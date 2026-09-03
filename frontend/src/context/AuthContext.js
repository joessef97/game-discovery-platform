import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';

const TOKEN_KEY = 'gamehub_token';
const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // Rehydrate on mount
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      authService
        .getCurrentUser()
        .then((u) => setUser(u))
        .catch(() => localStorage.removeItem(TOKEN_KEY))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const response = await authService.login(email, password);
    localStorage.setItem(TOKEN_KEY, response.token);
    setUser(response.user);
    return response;
  };

  const register = async (username, email, password) => {
    const response = await authService.register(username, email, password);
    localStorage.setItem(TOKEN_KEY, response.token);
    setUser(response.user);
    return response;
  };

  const setSession = ({ token, user }) => {
    localStorage.setItem(TOKEN_KEY, token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, login, register, setSession, logout, loading, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
};
