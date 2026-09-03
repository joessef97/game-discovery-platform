import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import Recent from '../Recent';
import gameService from '../../services/gameService';

jest.mock('../../services/gameService');

const renderPage = () =>
  render(
    <MemoryRouter>
      <Recent />
    </MemoryRouter>
  );

const minutesAgo = (n) => new Date(Date.now() - n * 60_000).toISOString();

afterEach(() => jest.clearAllMocks());

describe('Recent searches page', () => {
  it('shows an empty state when there is no history', async () => {
    gameService.getSearchHistory.mockResolvedValue([]);
    renderPage();

    expect(await screen.findByText(/no recent searches/i)).toBeInTheDocument();
  });

  it('lists past searches', async () => {
    gameService.getSearchHistory.mockResolvedValue([
      { _id: '1', query: 'elden ring', searchedAt: minutesAgo(5) },
      { _id: '2', query: 'hollow knight', searchedAt: minutesAgo(90) },
    ]);
    renderPage();

    expect(await screen.findByText('elden ring')).toBeInTheDocument();
    expect(screen.getByText('hollow knight')).toBeInTheDocument();
  });

  it('links each entry back to a Discover search', async () => {
    gameService.getSearchHistory.mockResolvedValue([
      { _id: '1', query: 'hollow knight', searchedAt: minutesAgo(1) },
    ]);
    renderPage();

    const link = await screen.findByRole('link', { name: /hollow knight/i });
    expect(link).toHaveAttribute('href', '/discover?q=hollow%20knight');
  });

  it('formats relative timestamps', async () => {
    gameService.getSearchHistory.mockResolvedValue([
      { _id: '1', query: 'a', searchedAt: minutesAgo(0) },
      { _id: '2', query: 'b', searchedAt: minutesAgo(5) },
      { _id: '3', query: 'c', searchedAt: minutesAgo(120) },
      { _id: '4', query: 'd', searchedAt: minutesAgo(60 * 24 * 2) },
    ]);
    renderPage();

    expect(await screen.findByText(/just now/i)).toBeInTheDocument();
    expect(screen.getByText('5 minutes ago')).toBeInTheDocument();
    expect(screen.getByText('2 hours ago')).toBeInTheDocument();
    expect(screen.getByText('2 days ago')).toBeInTheDocument();
  });

  it('uses singular units correctly', async () => {
    gameService.getSearchHistory.mockResolvedValue([
      { _id: '1', query: 'a', searchedAt: minutesAgo(1) },
      { _id: '2', query: 'b', searchedAt: minutesAgo(60) },
    ]);
    renderPage();

    expect(await screen.findByText('1 minute ago')).toBeInTheDocument();
    expect(screen.getByText('1 hour ago')).toBeInTheDocument();
  });

  it('surfaces an error when loading fails', async () => {
    gameService.getSearchHistory.mockRejectedValue(new Error('network'));
    renderPage();

    expect(await screen.findByText(/failed to load your recent activity/i)).toBeInTheDocument();
  });

  it('tolerates a missing timestamp without crashing', async () => {
    gameService.getSearchHistory.mockResolvedValue([{ _id: '1', query: 'orphan' }]);
    renderPage();

    expect(await screen.findByText('orphan')).toBeInTheDocument();
  });
});
