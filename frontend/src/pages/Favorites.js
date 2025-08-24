import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaTrash, FaGamepad } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import favoriteService from '../services/favoriteService';

const Favorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    setLoading(true);
    setError('');
    try {
      const favoritesData = await favoriteService.getFavorites();
      setFavorites(favoritesData);
    } catch (error) {
      console.error('Error loading favorites:', error);
      setError('Failed to load favorites. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (gameId) => {
    try {
      await favoriteService.removeFromFavorites(gameId);
      setFavorites(favorites.filter(fav => fav.gameId !== gameId));
    } catch (error) {
      console.error('Error removing favorite:', error);
      setError('Failed to remove game from favorites.');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 20px' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <FaHeart style={{ fontSize: '2.5rem', color: '#ff6b6b', marginBottom: '16px' }} />
          <h1>My Favorites</h1>
          <p>Games you've saved for later</p>
          {favorites.length > 0 && (
            <p style={{ marginTop: '16px', color: 'rgba(255, 255, 255, 0.7)' }}>
              {favorites.length} {favorites.length === 1 ? 'game' : 'games'}
            </p>
          )}
        </div>

        {error && (
          <div className="error" style={{ marginBottom: '20px' }}>
            {error}
          </div>
        )}

        {favorites.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }} className="card">
            <FaGamepad style={{ fontSize: '4rem', color: 'rgba(255, 255, 255, 0.3)', marginBottom: '24px' }} />
            <h2>No favorites yet</h2>
            <p style={{ marginBottom: '32px', color: 'rgba(255, 255, 255, 0.7)' }}>
              Start exploring games and add them to your favorites to see them here.
            </p>
            <Link to="/" className="btn btn-primary">
              Discover Games
            </Link>
          </div>
        ) : (
          <div className="games-grid">
            {favorites.map((favorite) => (
              <div key={favorite.gameId} className="card" style={{ position: 'relative' }}>
                <Link to={`/game/${favorite.gameId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <img 
                    src={favorite.gameImage || '/placeholder-game.jpg'} 
                    alt={favorite.gameName}
                    style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px', marginBottom: '16px' }}
                    onError={(e) => {
                      e.target.src = '/placeholder-game.jpg';
                    }}
                  />
                  <h3 style={{ marginBottom: '8px' }}>{favorite.gameName}</h3>
                  <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem' }}>
                    Added {new Date(favorite.addedAt).toLocaleDateString()}
                  </p>
                </Link>
                
                <button
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'rgba(255, 107, 107, 0.9)',
                    border: 'none',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onClick={() => handleRemoveFavorite(favorite.gameId)}
                  title="Remove from favorites"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
