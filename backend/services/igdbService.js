const axios = require('axios');

class IGDBService {
  constructor() {
    this.baseURL = 'https://api.igdb.com/v4';
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  async getAccessToken() {
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
        params: {
          client_id: process.env.TWITCH_CLIENT_ID,
          client_secret: process.env.TWITCH_CLIENT_SECRET,
          grant_type: 'client_credentials'
        }
      });

      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 60000; // Refresh 1 minute early
      
      return this.accessToken;
    } catch (error) {
      console.error('Error getting IGDB access token:', error.response?.data || error.message);
      throw new Error('Failed to authenticate with IGDB API');
    }
  }

  async makeRequest(endpoint, query) {
    const token = await this.getAccessToken();
    
    try {
      const response = await axios.post(`${this.baseURL}/${endpoint}`, query, {
        headers: {
          'Client-ID': process.env.TWITCH_CLIENT_ID,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'text/plain'
        },
        timeout: 15000 // 15 second timeout for IGDB requests
      });
      
      return response.data;
    } catch (error) {
      // If token expired, try refreshing and retry once
      if (error.response?.status === 401) {
        console.log('Token expired, refreshing...');
        this.accessToken = null;
        this.tokenExpiry = null;
        
        const newToken = await this.getAccessToken();
        try {
          const retryResponse = await axios.post(`${this.baseURL}/${endpoint}`, query, {
            headers: {
              'Client-ID': process.env.TWITCH_CLIENT_ID,
              'Authorization': `Bearer ${newToken}`,
              'Content-Type': 'text/plain'
            },
            timeout: 15000
          });
          return retryResponse.data;
        } catch (retryError) {
          console.error(`Retry failed for IGDB request to ${endpoint}:`, retryError.response?.data || retryError.message);
          throw retryError;
        }
      }
      
      console.error(`Error making IGDB request to ${endpoint}:`, error.response?.data || error.message);
      throw error;
    }
  }

  async searchGames(query, limit = 20, offset = 0) {
    const searchQuery = `
      search "${query}";
      fields name, cover.url, first_release_date, rating, genres.name, platforms.name, 
             summary, storyline, screenshots.url, videos.video_id, involved_companies.company.name,
             involved_companies.developer, involved_companies.publisher,
             age_ratings.organization, age_ratings.rating_category;
      limit ${limit};
      offset ${offset};
    `;
    
    return this.makeRequest('games', searchQuery);
  }

  // Games with a confirmed future release date, soonest first.
  // category = 0 keeps DLC/editions/bundles out of the list.
  async getUpcomingGames(limit = 20, offset = 0) {
    const now = Math.floor(Date.now() / 1000);

    // Sorting purely by date returns whatever ships tomorrow (mostly shovelware),
    // so rank by IGDB's `hypes` (anticipation) and cap the window at ~3 years.
    const horizon = now + (3 * 365 * 24 * 60 * 60);

    const query = `
      fields name, cover.url, first_release_date, rating, hypes, genres.name,
             platforms.name, summary;
      limit ${limit};
      offset ${offset};
      where first_release_date > ${now} & first_release_date < ${horizon}
            & cover != null & game_type = 0 & hypes != null;
      sort hypes desc;
    `;

    return this.makeRequest('games', query);
  }

  // Highest-rated released games. rating_count guards against a handful of
  // votes producing a bogus 100/100, and game_type = 0 excludes editions/DLC.
  async getTopRatedGames(limit = 20, offset = 0, sinceYear = null) {
    const now = Math.floor(Date.now() / 1000);
    const yearFilter = sinceYear
      ? ` & first_release_date >= ${Math.floor(new Date(`${sinceYear}-01-01`).getTime() / 1000)}`
      : '';

    // Recent games have not accumulated many votes yet, so a flat 400-vote floor
    // would leave the year-scoped tabs empty. Scale it to the window instead.
    const minVotes = sinceYear ? 100 : 400;

    const query = `
      fields name, cover.url, first_release_date, rating, rating_count, genres.name,
             platforms.name, summary;
      limit ${limit};
      offset ${offset};
      where rating != null & rating_count >= ${minVotes} & cover != null & game_type = 0
            & first_release_date <= ${now}${yearFilter};
      sort rating desc;
    `;

    return this.makeRequest('games', query);
  }

  async getGameDetails(gameId) {
    const query = `
      fields name, cover.url, first_release_date, rating, genres.name, platforms.name,
             summary, storyline, screenshots.url, videos.video_id, involved_companies.company.name,
             involved_companies.developer, involved_companies.publisher,
             age_ratings.organization, age_ratings.rating_category,
             artworks.url, websites.url, websites.type;
      where id = ${gameId};
    `;
    
    const result = await this.makeRequest('games', query);
    return result[0];
  }

  async getTrendingGames(limit = 20, offset = 0) {
    // Get games released in the last 5 years, sorted by rating.
    // rating_count guards against obscure titles with a handful of votes topping
    // the list, and game_type = 0 keeps DLC/editions out.
    const fiveYearsAgo = Math.floor((Date.now() - (5 * 365 * 24 * 60 * 60 * 1000)) / 1000);
    
    const query = `
      fields name, cover.url, first_release_date, rating, genres.name, platforms.name, 
             summary, screenshots.url, videos.video_id, involved_companies.company.name,
             involved_companies.developer, involved_companies.publisher;
      limit ${limit};
      offset ${offset};
      where first_release_date >= ${fiveYearsAgo} & cover != null & game_type = 0
            & rating != null & rating_count >= 150;
      sort rating desc;
    `;
    
    return this.makeRequest('games', query);
  }


  // Normalise a title for comparison: lowercase, strip punctuation/edition noise.
  normaliseTitle(title) {
    return String(title || '')
      .toLowerCase()
      .replace(/[‘’“”]/g, "'")
      .replace(/\b(director'?s cut|game of the year|goty)\b/g, ' ')
      .replace(/\b(deluxe|ultimate|premium|complete|definitive|collector'?s)\b/g, ' ')
      .replace(/\b(edition|remastered|bundle)\b/g, ' ')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim()
      // IGDB often uses Roman numerals ("Baldur's Gate III") where the UI uses
      // digits ("Baldur's Gate 3"). Normalise the unambiguous ones so the base
      // game matches instead of a "... : Deluxe Edition" entry. 'v' and 'x' are
      // deliberately excluded — too ambiguous (e.g. "Mega Man X").
      .replace(/\b(ii|iii|iv|vi|vii|viii|ix|xi|xii|xiii)\b/g, (r) => ({
        ii: '2', iii: '3', iv: '4', vi: '6', vii: '7',
        viii: '8', ix: '9', xi: '11', xii: '12', xiii: '13',
      })[r])
      .replace(/\s+/g, ' ')
      .trim();
  }

  // True when the raw title looks like an edition/DLC rather than the base game.
  // Used only to break ties, so a base game wins over "... : Deluxe Edition".
  isEditionTitle(name) {
    return /\b(deluxe|ultimate|premium|complete|definitive|collector'?s|digital|goty|edition|bundle|upgrade|soundtrack|dlc)\b/i
      .test(String(name || ''));
  }

  // Choose the candidate that genuinely matches the requested title.
  // Returns null when nothing is close enough, so the caller can fall through
  // to a more reliable lookup rather than showing an unrelated game.
  pickBestNameMatch(candidates, wanted) {
    const want = this.normaliseTitle(wanted);
    if (!want) return null;

    const scored = candidates
      .map((g) => {
        const have = this.normaliseTitle(g.name);
        let score = 0;
        if (have === want) score = 100;                       // exact title
        else if (have.startsWith(want + ' ')) score = 80;      // wanted + suffix
        else if (want.startsWith(have + ' ')) score = 70;      // wanted has extra words
        else if (have.includes(want)) score = 60;              // wanted appears inside
        else if (want.includes(have)) score = 50;
        else {
          // Otherwise require meaningful word overlap
          const wantWords = new Set(want.split(' ').filter(Boolean));
          const haveWords = have.split(' ').filter(Boolean);
          if (wantWords.size) {
            const hits = haveWords.filter((w) => wantWords.has(w)).length;
            const ratio = hits / wantWords.size;
            if (ratio >= 0.75) score = 40;
          }
        }
        // Prefer shorter *raw* titles at equal score, so the base game wins over
        // "... : Deluxe Edition" (both normalise to the same string).
        return { game: g, score, len: String(g.name || '').length };
      })
      .filter((c) => c.score > 0)
      .sort((a, b) =>
        b.score - a.score ||
        // base game before an edition/DLC entry at the same score
        (this.isEditionTitle(a.game.name) ? 1 : 0) - (this.isEditionTitle(b.game.name) ? 1 : 0) ||
        a.len - b.len
      );

    return scored.length ? scored[0].game : null;
  }

  // Look up a game by its Steam App ID.
  // If 'gameName' is provided, search IGDB by name and return the best match.
  // Otherwise try external_games then fall back to direct IGDB ID lookup.
  async getGameBySteamId(steamAppId, gameName = null) {
    // Preferred: search by game name (most reliable)
    if (gameName) {
      const nameQuery = `
        search "${gameName}";
        fields name, cover.url, first_release_date, rating, genres.name, platforms.name,
               summary, storyline, screenshots.url, videos.video_id,
               involved_companies.company.name, involved_companies.developer,
               involved_companies.publisher, age_ratings.organization,
               age_ratings.rating_category, artworks.url,
               websites.url, websites.type;
        limit 5;
      `;
      const nameResults = await this.makeRequest('games', nameQuery);
      if (nameResults && nameResults.length > 0) {
        // IGDB's fuzzy search does not reliably rank the exact title first, so
        // score the candidates instead of trusting nameResults[0]. Returning an
        // arbitrary fuzzy hit is what previously made a link open the wrong game.
        const best = this.pickBestNameMatch(nameResults, gameName);
        if (best) return best;
      }
    }

    // Fallback 1: IGDB external_games (Steam source = 1).
    // NB: this used to filter on `category`, which IGDB deprecated — the query
    // silently returned no rows, so this fallback never fired.
    try {
      const extQuery = `
        fields game;
        where uid = "${steamAppId}" & external_game_source = 1;
        limit 1;
      `;
      const extResults = await this.makeRequest('external_games', extQuery);
      if (extResults && extResults.length > 0 && extResults[0].game) {
        const igdbId = extResults[0].game;
        return this.getGameDetails(igdbId);
      }
    } catch (e) {
      console.log('external_games lookup failed, skipping:', e.message);
    }

    // Fallback 2: treat steamAppId as raw IGDB ID (for search-result links)
    return this.getGameDetails(steamAppId);
  }


  // Format cover URL — ensure https: prefix and use larger size
  formatImageUrl(url, size = 'cover_big') {
    if (!url) return null;
    // IGDB returns protocol-relative URLs like //images.igdb.com/...
    const withProtocol = url.startsWith('//') ? `https:${url}` : url;
    return withProtocol.replace('t_thumb', `t_${size}`);
  }

  // Format screenshot URL — ensure https: prefix
  formatScreenshotUrl(url, size = 'screenshot_med') {
    if (!url) return null;
    const withProtocol = url.startsWith('//') ? `https:${url}` : url;
    return withProtocol.replace('t_thumb', `t_${size}`);
  }

  // Helper method to convert IGDB game data to our format
  formatGameData(game) {
    return {
      id: game.id,
      name: game.name,
      background_image: game.cover ? this.formatImageUrl(game.cover.url) : null,
      released: game.first_release_date ? new Date(game.first_release_date * 1000).toISOString().split('T')[0] : null,
      rating: game.rating ? game.rating / 10 : null, // Convert from 0-100 to 0-10 scale
      genres: game.genres ? game.genres.map(g => ({ name: g.name })) : [],
      platforms: game.platforms ? game.platforms.map(p => ({ platform: { name: p.name } })) : [],
      description_raw: game.summary || game.storyline || '',
      screenshots: game.screenshots ? game.screenshots.map(s => ({ 
        image: this.formatScreenshotUrl(s.url, 'screenshot_big') 
      })) : [],
      trailers: game.videos ? game.videos.map(v => ({
        preview: `https://img.youtube.com/vi/${v.video_id}/maxresdefault.jpg`,
        data: { max: `https://www.youtube.com/watch?v=${v.video_id}` }
      })) : [],
      developers: this.extractCompanies(game.involved_companies, true),
      publishers: this.extractCompanies(game.involved_companies, false),
      esrb_rating: game.age_ratings ? { name: this.getESRBRating(game.age_ratings) } : null,
      metacritic: game.rating ? Math.round(game.rating) : null
    };
  }

  extractCompanies(involvedCompanies, isDeveloper) {
    if (!involvedCompanies) return [];
    
    return involvedCompanies
      .filter(ic => isDeveloper ? ic.developer : ic.publisher)
      .map(ic => ({ name: ic.company.name }));
  }

  getESRBRating(ageRatings) {
    // IGDB replaced age_ratings.category/.rating with .organization/.rating_category.
    // Values below are read from IGDB's age_rating_organizations (ESRB = 1) and
    // age_rating_categories endpoints.
    const ESRB_ORGANIZATION = 1;
    const ratingMap = {
      1: 'RP',   // Rating Pending
      2: 'EC',   // Early Childhood
      3: 'E',    // Everyone
      4: 'E10+', // Everyone 10+
      5: 'T',    // Teen
      6: 'M',    // Mature
      7: 'AO',   // Adults Only
    };

    const esrbRating = ageRatings.find(ar => ar.organization === ESRB_ORGANIZATION);
    return esrbRating ? ratingMap[esrbRating.rating_category] || 'RP' : 'RP';
  }
}

module.exports = new IGDBService();
