import api from './api';

const favoriteService = {
  async getFavorites() {
    const response = await api.get('/favorites');
    return response.data;
  },

  async addToFavorites(gameId, gameName, gameImage) {
    const response = await api.post('/favorites', {
      gameId,
      gameName,
      gameImage
    });
    return response.data;
  },

  async removeFromFavorites(gameId) {
    const response = await api.delete(`/favorites/${gameId}`);
    return response.data;
  },

  async checkFavoriteStatus(gameId) {
    const response = await api.get(`/favorites/check/${gameId}`);
    return response.data;
  }
};

export default favoriteService;
