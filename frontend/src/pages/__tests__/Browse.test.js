import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Browse from '../Browse';
import gameService from '../../services/gameService';

jest.mock('../../services/gameService');

describe('Browse', () => {
  beforeEach(() => {
    gameService.getGenres.mockResolvedValue([{ id: 5, name: 'Shooter' }]);
    gameService.getPlatforms.mockResolvedValue([{ id: 6, name: 'PC' }]);
  });

  it('renders genres and platforms from IGDB', async () => {
    render(<MemoryRouter><Browse /></MemoryRouter>);
    expect(await screen.findByRole('link', { name: /Shooter/i })).toBeInTheDocument();
    expect(await screen.findByRole('link', { name: /PC/i })).toBeInTheDocument();
  });

  it('links categories using their IGDB IDs', async () => {
    render(<MemoryRouter><Browse /></MemoryRouter>);
    expect(await screen.findByRole('link', { name: /Shooter/i })).toHaveAttribute('href', '/discover?genreId=5');
    expect(await screen.findByRole('link', { name: /PC/i })).toHaveAttribute('href', '/discover?platformId=6');
  });
});
