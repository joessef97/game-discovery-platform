import api from './api';

const wishlistService = {
  async getWishlist() {
    const response = await api.get('/wishlist');
    return response.data;
  },

  async addToWishlist(gameId, gameName, gameImage) {
    const response = await api.post('/wishlist', {
      gameId,
      gameName,
      gameImage
    });
    return response.data;
  },

  async removeFromWishlist(gameId) {
    const response = await api.delete(`/wishlist/${gameId}`);
    return response.data;
  },

  async checkWishlistStatus(gameId) {
    const response = await api.get(`/wishlist/check/${gameId}`);
    return response.data;
  }
};

export default wishlistService;
