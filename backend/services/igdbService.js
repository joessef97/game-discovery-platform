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
             involved_companies.developer, involved_companies.publisher, age_ratings.rating;
      limit ${limit};
      offset ${offset};
    `;
    
    return this.makeRequest('games', searchQuery);
  }

  async getGameDetails(gameId) {
    const query = `
      fields name, cover.url, first_release_date, rating, genres.name, platforms.name,
             summary, storyline, screenshots.url, videos.video_id, involved_companies.company.name,
             involved_companies.developer, involved_companies.publisher, age_ratings.rating,
             artworks.url, websites.url, websites.category;
      where id = ${gameId};
    `;
    
    const result = await this.makeRequest('games', query);
    return result[0];
  }

  async getTrendingGames(limit = 20, offset = 0) {
    // Get games released in the last 5 years, sorted by rating
    const fiveYearsAgo = Math.floor((Date.now() - (5 * 365 * 24 * 60 * 60 * 1000)) / 1000);
    
    const query = `
      fields name, cover.url, first_release_date, rating, genres.name, platforms.name, 
             summary, screenshots.url, videos.video_id, involved_companies.company.name,
             involved_companies.developer, involved_companies.publisher;
      limit ${limit};
      offset ${offset};
      where first_release_date >= ${fiveYearsAgo} & cover != null;
      sort rating desc;
    `;
    
    return this.makeRequest('games', query);
  }

  // Helper method to format cover URL
  formatImageUrl(url, size = 'cover_big') {
    if (!url) return null;
    return url.replace('t_thumb', `t_${size}`);
  }

  // Helper method to format screenshot URLs
  formatScreenshotUrl(url, size = 'screenshot_med') {
    if (!url) return null;
    return url.replace('t_thumb', `t_${size}`);
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
    // IGDB age rating categories - simplified mapping
    const ratingMap = {
      1: 'E', // Everyone
      2: 'E10+', // Everyone 10+
      3: 'T', // Teen
      4: 'M', // Mature
      5: 'AO' // Adults Only
    };
    
    const esrbRating = ageRatings.find(ar => ar.category === 1); // ESRB category
    return esrbRating ? ratingMap[esrbRating.rating] || 'RP' : 'RP';
  }
}

module.exports = new IGDBService();
