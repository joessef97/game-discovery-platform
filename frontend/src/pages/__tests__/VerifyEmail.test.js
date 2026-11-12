import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import VerifyEmail from '../VerifyEmail';
import authService from '../../services/authService';

jest.mock('../../services/authService');

describe('VerifyEmail', () => {
  it('confirms the token and offers a sign-in link', async () => {
    authService.verifyEmail.mockResolvedValue({ message: 'Email verified.' });
    render(<MemoryRouter initialEntries={['/verify-email/one-time-token']}><Routes><Route path="/verify-email/:token" element={<VerifyEmail />} /></Routes></MemoryRouter>);
    expect(await screen.findByText('Email verified.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sign in/i })).toHaveAttribute('href', '/login');
    expect(authService.verifyEmail).toHaveBeenCalledWith('one-time-token');
  });
});
