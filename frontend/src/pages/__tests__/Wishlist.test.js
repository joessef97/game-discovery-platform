import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import Wishlist from '../Wishlist';
import wishlistService from '../../services/wishlistService';

jest.mock('../../services/wishlistService');

const renderPage = () =>
  render(
    <MemoryRouter>
      <Wishlist />
    </MemoryRouter>
  );

const ITEMS = [
  { gameId: 1022, gameName: 'The Legend of Zelda', gameImage: 'https://x/zelda.jpg', addedAt: '2026-09-01T10:00:00.000Z' },
  { gameId: 1245620, gameName: 'Elden Ring', gameImage: 'https://x/elden.jpg', addedAt: '2026-09-02T10:00:00.000Z' },
];

afterEach(() => jest.clearAllMocks());

describe('Wishlist page', () => {
  it('shows an empty state when nothing is saved', async () => {
    wishlistService.getWishlist.mockResolvedValue([]);
    renderPage();

    expect(await screen.findByText(/wishlist is empty/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /find games/i })).toBeInTheDocument();
  });

  it('renders saved games', async () => {
    wishlistService.getWishlist.mockResolvedValue(ITEMS);
    renderPage();

    expect(await screen.findByText('The Legend of Zelda')).toBeInTheDocument();
    expect(screen.getByText('Elden Ring')).toBeInTheDocument();
  });

  it('pluralises the count correctly', async () => {
    wishlistService.getWishlist.mockResolvedValue([ITEMS[0]]);
    const { unmount } = renderPage();
    expect(await screen.findByText(/1 game on your wishlist/i)).toBeInTheDocument();
    unmount();

    wishlistService.getWishlist.mockResolvedValue(ITEMS);
    renderPage();
    expect(await screen.findByText(/2 games on your wishlist/i)).toBeInTheDocument();
  });

  it('links each game to its detail page', async () => {
    wishlistService.getWishlist.mockResolvedValue([ITEMS[0]]);
    renderPage();

    const link = await screen.findByRole('link', { name: /the legend of zelda/i });
    expect(link).toHaveAttribute('href', '/game/1022');
  });

  it('removes a game and drops it from the list', async () => {
    wishlistService.getWishlist.mockResolvedValue(ITEMS);
    wishlistService.removeFromWishlist.mockResolvedValue({ message: 'ok' });
    renderPage();

    await screen.findByText('The Legend of Zelda');
    const [removeBtn] = screen.getAllByTitle(/remove/i);
    await userEvent.click(removeBtn);

    await waitFor(() =>
      expect(wishlistService.removeFromWishlist).toHaveBeenCalledWith(1022)
    );
    await waitFor(() =>
      expect(screen.queryByText('The Legend of Zelda')).not.toBeInTheDocument()
    );
    // the other game is untouched
    expect(screen.getByText('Elden Ring')).toBeInTheDocument();
  });

  it('surfaces an error when loading fails', async () => {
    wishlistService.getWishlist.mockRejectedValue(new Error('network'));
    renderPage();

    expect(await screen.findByText(/failed to load wishlist/i)).toBeInTheDocument();
  });

  it('surfaces an error when removal fails, keeping the game listed', async () => {
    wishlistService.getWishlist.mockResolvedValue([ITEMS[0]]);
    wishlistService.removeFromWishlist.mockRejectedValue(new Error('nope'));
    renderPage();

    await screen.findByText('The Legend of Zelda');
    await userEvent.click(screen.getAllByTitle(/remove/i)[0]);

    expect(await screen.findByText(/failed to remove/i)).toBeInTheDocument();
    expect(screen.getByText('The Legend of Zelda')).toBeInTheDocument();
  });
});
