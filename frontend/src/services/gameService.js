import api from './api';

const gameService = {
  async searchGames(query, page = 1) {
    const response = await api.get(`/games/search?query=${encodeURIComponent(query)}&page=${page}`);
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
