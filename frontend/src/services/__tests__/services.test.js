import api from '../api';
import wishlistService from '../wishlistService';
import favoriteService from '../favoriteService';
import gameService from '../gameService';

jest.mock('../api');

afterEach(() => jest.clearAllMocks());

describe('wishlistService', () => {
  it('GETs the wishlist', async () => {
    api.get.mockResolvedValue({ data: [] });
    await expect(wishlistService.getWishlist()).resolves.toEqual([]);
    expect(api.get).toHaveBeenCalledWith('/wishlist');
  });

  it('POSTs a new entry with the expected body', async () => {
    api.post.mockResolvedValue({ data: { message: 'ok' } });
    await wishlistService.addToWishlist(1022, 'Zelda', 'https://x/y.jpg');

    expect(api.post).toHaveBeenCalledWith('/wishlist', {
      gameId: 1022,
      gameName: 'Zelda',
      gameImage: 'https://x/y.jpg',
    });
  });

  it('DELETEs by game id', async () => {
    api.delete.mockResolvedValue({ data: { message: 'ok' } });
    await wishlistService.removeFromWishlist(1022);
    expect(api.delete).toHaveBeenCalledWith('/wishlist/1022');
  });

  it('checks membership', async () => {
    api.get.mockResolvedValue({ data: { isWishlisted: true } });
    await expect(wishlistService.checkWishlistStatus(1022)).resolves.toEqual({ isWishlisted: true });
    expect(api.get).toHaveBeenCalledWith('/wishlist/check/1022');
  });
});

describe('favoriteService', () => {
  it('hits the favorites endpoints, not the wishlist ones', async () => {
    api.get.mockResolvedValue({ data: [] });
    await favoriteService.getFavorites();
    expect(api.get).toHaveBeenCalledWith('/favorites');

    api.delete.mockResolvedValue({ data: {} });
    await favoriteService.removeFromFavorites(7);
    expect(api.delete).toHaveBeenCalledWith('/favorites/7');
  });
});

describe('gameService', () => {
  beforeEach(() => api.get.mockResolvedValue({ data: { results: [] } }));

  it('URL-encodes the search query', async () => {
    await gameService.searchGames('hollow knight');
    expect(api.get).toHaveBeenCalledWith('/games/search?query=hollow%20knight&page=1');
  });

  it('encodes characters that would break the query string', async () => {
    await gameService.searchGames('c&c: red alert');
    const url = api.get.mock.calls[0][0];
    expect(url).toContain('query=c%26c%3A%20red%20alert');
  });

  it('requests upcoming games with pagination', async () => {
    await gameService.getUpcomingGames(2, 24);
    expect(api.get).toHaveBeenCalledWith('/games/upcoming/list?page=2&page_size=24');
  });

  it('omits the since parameter when no year is given', async () => {
    await gameService.getTopRatedGames(1, 20, null);
    expect(api.get).toHaveBeenCalledWith('/games/top-rated/list?page=1&page_size=20');
  });

  it('includes the since parameter when a year is given', async () => {
    await gameService.getTopRatedGames(1, 20, 2024);
    expect(api.get).toHaveBeenCalledWith('/games/top-rated/list?page=1&page_size=20&since=2024');
  });

  it('fetches game details by id', async () => {
    await gameService.getGameDetails(1022);
    expect(api.get).toHaveBeenCalledWith('/games/1022');
  });
});
