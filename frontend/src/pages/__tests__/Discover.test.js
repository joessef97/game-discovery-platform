import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Discover from '../Discover';
import gameService from '../../services/gameService';

jest.mock('../../services/gameService');

const first = { id: 1, name: 'Elden Ring', background_image: '', genres: [], rating: 9 };
const second = { id: 2, name: 'Elden Ring: Shadow', background_image: '', genres: [], rating: 8 };

describe('Discover category filters and pagination', () => {
  it('searches within the selected genre and keeps filters while loading more', async () => {
    gameService.searchGames
      .mockResolvedValueOnce({ results: [first], next: true })
      .mockResolvedValueOnce({ results: [first, second], next: null });

    render(<MemoryRouter initialEntries={['/discover?q=elden%20ring&genreId=5']}><Discover /></MemoryRouter>);

    await screen.findByText('Elden Ring');
    await waitFor(() => expect(gameService.searchGames).toHaveBeenCalledWith('elden ring', 1, 20, { genreId: '5' }));
    fireEvent.click(screen.getByRole('button', { name: /load more/i }));
    await screen.findByText('Elden Ring: Shadow');

    expect(gameService.searchGames).toHaveBeenLastCalledWith('elden ring', 2, 20, { genreId: '5' });
    expect(screen.getAllByText('Elden Ring')).toHaveLength(1);
  });
});
