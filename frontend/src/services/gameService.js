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

  async getTrendingGames(page = 1) {
    const response = await api.get(`/games/trending/popular?page=${page}`);
    return response.data;
  },

  async getSearchHistory() {
    const response = await api.get('/games/user/search-history');
    return response.data;
  }
};

export default gameService;
