import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from '../Home';
import gameService from '../../services/gameService';
jest.mock('../../services/gameService');

const live = { id: 4242, name: 'Live IGDB Game', background_image: null, rating: 8.6, released: '2024-01-01', genres: [] };
describe('Home', () => {
  beforeEach(() => {
    gameService.getTrendingGames.mockResolvedValue({ results: [live] });
    gameService.getTopRatedGames.mockResolvedValue({ results: [{ ...live, id: 4343, name: 'Live Top Rated' }] });
    gameService.getUpcomingGames.mockResolvedValue({ results: [{ ...live, id: 4444, name: 'Live Upcoming' }] });
    gameService.getGenres.mockResolvedValue([{ id: 5, name: 'Shooter' }]);
  });
  it('renders live trending, top-rated, and upcoming results', async () => {
    render(<MemoryRouter><Home /></MemoryRouter>);
    expect(await screen.findByText('Live IGDB Game')).toBeInTheDocument();
    expect(await screen.findByText('Live Top Rated')).toBeInTheDocument();
    expect(await screen.findByText('Live Upcoming')).toBeInTheDocument();
  });
  it('shows retry after a section failure', async () => {
    gameService.getTrendingGames.mockRejectedValueOnce(new Error('offline'));
    render(<MemoryRouter><Home /></MemoryRouter>);
    expect(await screen.findByRole('alert')).toHaveTextContent(/could not load/i);
    fireEvent.click(screen.getByRole('button', { name: /retry trending/i }));
    expect(await screen.findByText('Live IGDB Game')).toBeInTheDocument();
  });
  it('omits mock newsletter, recommendations, and feature claims', async () => {
    render(<MemoryRouter><Home /></MemoryRouter>);
    await screen.findByText('Live IGDB Game');
    expect(screen.queryByText(/subscribe|AI-powered|active community|achievements/i)).not.toBeInTheDocument();
  });
});
