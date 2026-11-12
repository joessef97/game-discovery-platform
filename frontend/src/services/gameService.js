import api from './api';

const gameService = {
  async searchGames(query, page = 1, pageSize = 20, filters = {}) {
    const params = new URLSearchParams({ query, page: String(page) });
    if (pageSize !== 20 || filters.genreId || filters.platformId) params.set('page_size', String(pageSize));
    if (filters.genreId) params.set('genre_id', String(filters.genreId));
    if (filters.platformId) params.set('platform_id', String(filters.platformId));
    const response = await api.get(`/games/search?${params.toString().replace(/\+/g, '%20')}`);
    return response.data;
  },

  async getGenres() {
    const response = await api.get('/games/genres');
    return response.data;
  },

  async getPlatforms() {
    const response = await api.get('/games/platforms');
    return response.data;
  },

  async getGamesByGenre(id, page = 1, pageSize = 20) {
    const response = await api.get(`/games/genre/${encodeURIComponent(id)}?page=${page}&page_size=${pageSize}`);
    return response.data;
  },

  async getGamesByPlatform(id, page = 1, pageSize = 20) {
    const response = await api.get(`/games/platform/${encodeURIComponent(id)}?page=${page}&page_size=${pageSize}`);
    return response.data;
  },

  async getGameDetails(gameId) {
    const response = await api.get(`/games/${gameId}`);
    return response.data;
  },

  async getGameDetailsBySteamId(steamId, gameName = null) {
    const params = gameName ? `?name=${encodeURIComponent(gameName)}` : '';
    const response = await api.get(`/games/steam/${steamId}${params}`);
    return response.data;
  },

  async getTrendingGames(page = 1) {
    const response = await api.get(`/games/trending/popular?page=${page}`);
    return response.data;
  },

  async getUpcomingGames(page = 1, pageSize = 20) {
    const response = await api.get(`/games/upcoming/list?page=${page}&page_size=${pageSize}`);
    return response.data;
  },

  async getTopRatedGames(page = 1, pageSize = 20, since = null) {
    const sinceParam = since ? `&since=${since}` : '';
    const response = await api.get(`/games/top-rated/list?page=${page}&page_size=${pageSize}${sinceParam}`);
    return response.data;
  },

  async getSearchHistory() {
    const response = await api.get('/games/user/search-history');
    return response.data;
  }
};

export default gameService;
