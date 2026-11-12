import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Profile from '../Profile';
import authService from '../../services/authService';
import favoriteService from '../../services/favoriteService';
import gameService from '../../services/gameService';

jest.mock('../../services/authService');
jest.mock('../../services/favoriteService');
jest.mock('../../services/gameService');
jest.mock('../../context/AuthContext', () => ({ useAuth: () => ({ user: { username: 'TestUser', email: 'test@example.com', emailVerified: false, createdAt: '2024-01-01' } }) }));

describe('Profile email verification', () => {
  beforeEach(() => {
    favoriteService.getFavorites.mockResolvedValue([]);
    gameService.getSearchHistory.mockResolvedValue([]);
    authService.resendVerification.mockResolvedValue({ message: 'A new verification email has been sent.' });
  });

  it('lets an unverified user resend their confirmation email', async () => {
    render(<MemoryRouter><Profile /></MemoryRouter>);
    fireEvent.click(await screen.findByRole('button', { name: /resend verification email/i }));
    expect(await screen.findByRole('status')).toHaveTextContent(/new verification email/i);
    expect(authService.resendVerification).toHaveBeenCalled();
  });
});
