import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaStar, FaHeart, FaRegHeart, FaCalendarAlt, FaArrowLeft } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import gameService from '../services/gameService';
import favoriteService from '../services/favoriteService';

const GameDetail = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    if (id) {
      loadGameDetails();
      if (isAuthenticated) {
        checkFavoriteStatus();
      }
    }
  }, [id, isAuthenticated]);

  const loadGameDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const gameData = await gameService.getGameDetails(id);
      setGame(gameData);
    } catch (error) {
      console.error('Error loading game details:', error);
      setError('Failed to load game details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const checkFavoriteStatus = async () => {
    try {
      const response = await favoriteService.checkFavoriteStatus(id);
      setIsFavorited(response.isFavorite);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!isAuthenticated || !game) return;

    try {
      if (isFavorited) {
        await favoriteService.removeFromFavorites(game.id);
        setIsFavorited(false);
      } else {
        await favoriteService.addToFavorites(
          game.id,
          game.name,
          game.background_image || ''
        );
        setIsFavorited(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div className="error">{error || 'Game not found'}</div>
        <Link to="/" className="btn btn-primary">
          <FaArrowLeft />
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 20px' }}>
      <div className="container">
        <Link to="/" className="btn btn-secondary" style={{ marginBottom: '20px' }}>
          <FaArrowLeft />
          Back
        </Link>
        
        <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
          <div style={{ flex: '0 0 300px' }}>
            <img 
              src={game.background_image || '/placeholder-game.jpg'} 
              alt={game.name}
              style={{ width: '100%', borderRadius: '12px' }}
            />
          </div>
          
          <div style={{ flex: '1', minWidth: '300px' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>{game.name}</h1>
            
            {game.rating && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <FaStar color="#ffd700" />
                <span>{game.rating.toFixed(1)}</span>
              </div>
            )}
            
            {game.released && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <FaCalendarAlt />
                <span>Released: {new Date(game.released).toLocaleDateString()}</span>
              </div>
            )}
            
            {game.genres && game.genres.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <strong>Genres: </strong>
                {game.genres.map(genre => genre.name).join(', ')}
              </div>
            )}
            
            {isAuthenticated && (
              <button
                className={`btn ${isFavorited ? 'btn-danger' : 'btn-primary'}`}
                onClick={handleFavoriteToggle}
                style={{ marginBottom: '20px' }}
              >
                {isFavorited ? <FaHeart /> : <FaRegHeart />}
                {isFavorited ? 'Remove from Favorites' : 'Add to Favorites'}
              </button>
            )}
            
            {game.description_raw && (
              <div style={{ marginBottom: '30px' }}>
                <h3>About This Game</h3>
                <p style={{ lineHeight: '1.6', color: 'rgba(255, 255, 255, 0.9)' }}>
                  {game.description_raw}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Trailers Section */}
        {game.trailers && game.trailers.length > 0 && (
          <div style={{ marginTop: '40px' }}>
            <h3 style={{ marginBottom: '20px' }}>Trailers</h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '20px' 
            }}>
              {game.trailers.slice(0, 4).map((trailer, index) => (
                <div key={index} style={{ 
                  position: 'relative',
                  paddingBottom: '56.25%', // 16:9 aspect ratio
                  height: 0,
                  overflow: 'hidden',
                  borderRadius: '8px',
                  backgroundColor: '#1a1a1a'
                }}>
                  <iframe
                    src={trailer.data.max.replace('watch?v=', 'embed/')}
                    title={`${game.name} Trailer ${index + 1}`}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      border: 'none'
                    }}
                    allowFullScreen
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Screenshots Section */}
        {game.screenshots && game.screenshots.length > 0 && (
          <div style={{ marginTop: '40px' }}>
            <h3 style={{ marginBottom: '20px' }}>Screenshots</h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '15px' 
            }}>
              {game.screenshots.slice(0, 6).map((screenshot, index) => (
                <img
                  key={index}
                  src={screenshot.image}
                  alt={`${game.name} Screenshot ${index + 1}`}
                  style={{
                    width: '100%',
                    height: '150px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                  onClick={() => window.open(screenshot.image, '_blank')}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameDetail;
