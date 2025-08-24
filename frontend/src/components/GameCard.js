import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaHeart, FaRegHeart } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import favoriteService from '../services/favoriteService';
import './GameCard.css';

const GameCard = ({ game }) => {
  const { isAuthenticated } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && game.id) {
      checkFavoriteStatus();
    }
  }, [isAuthenticated, game.id]);

  const checkFavoriteStatus = async () => {
    try {
      const response = await favoriteService.checkFavoriteStatus(game.id);
      setIsFavorited(response.isFavorite);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const handleFavoriteToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      return;
    }

    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const formatRating = (rating) => {
    return rating ? rating.toFixed(1) : 'N/A';
  };

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '/placeholder-game.jpg';
    return imageUrl;
  };

  return (
    <Link to={`/game/${game.id}`} className="game-card">
      <div className="game-image-container">
        <img 
          src={getImageUrl(game.background_image)} 
          alt={game.name}
          className="game-image"
          onError={(e) => {
            e.target.src = '/placeholder-game.jpg';
          }}
        />
        {isAuthenticated && (
          <button
            className={`favorite-button ${isFavorited ? 'favorited' : ''}`}
            onClick={handleFavoriteToggle}
            disabled={isLoading}
            title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            {isFavorited ? <FaHeart /> : <FaRegHeart />}
          </button>
        )}
      </div>
      
      <div className="game-info">
        <h3 className="game-title">{game.name}</h3>
        
        {game.rating && (
          <div className="game-rating">
            <FaStar />
            <span>{formatRating(game.rating)}</span>
          </div>
        )}
        
        {game.platforms && game.platforms.length > 0 && (
          <div className="game-platforms">
            {game.platforms.slice(0, 3).map((platform, index) => (
              <span key={index} className="platform-tag">
                {platform.platform.name}
              </span>
            ))}
            {game.platforms.length > 3 && (
              <span className="platform-tag">+{game.platforms.length - 3}</span>
            )}
          </div>
        )}
        
        {game.genres && game.genres.length > 0 && (
          <div className="game-genres">
            {game.genres.slice(0, 3).map((genre, index) => (
              <span key={index} className="genre-tag">
                {genre.name}
              </span>
            ))}
          </div>
        )}
        
        {game.released && (
          <div className="game-release-date">
            Released: {new Date(game.released).toLocaleDateString()}
          </div>
        )}
      </div>
    </Link>
  );
};

export default GameCard;
