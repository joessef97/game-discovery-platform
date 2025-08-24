import React, { useState, useEffect } from 'react';
import { FaUser, FaHeart, FaHistory, FaGamepad } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import gameService from '../services/gameService';
import favoriteService from '../services/favoriteService';

const Profile = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    favoritesCount: 0,
    searchHistoryCount: 0
  });
  const [searchHistory, setSearchHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    setLoading(true);
    try {
      const [favorites, history] = await Promise.all([
        favoriteService.getFavorites(),
        gameService.getSearchHistory()
      ]);
      
      setStats({
        favoritesCount: favorites.length,
        searchHistoryCount: history.length
      });
      
      setSearchHistory(history.slice(0, 10)); // Show last 10 searches
    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px', marginBottom: '50px', padding: '40px' }} className="card">
          <div style={{
            width: '120px',
            height: '120px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '3rem',
            color: 'white'
          }}>
            <FaUser />
          </div>
          
          <div>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>{user?.username}</h1>
            <p style={{ fontSize: '1.2rem', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '12px' }}>{user?.email}</p>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              Member since {formatDate(user?.createdAt)}
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '40px' }}>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '32px 24px' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              color: 'white'
            }}>
              <FaHeart />
            </div>
            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'white', marginBottom: '4px' }}>
                {stats.favoritesCount}
              </div>
              <div style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Favorite Games</div>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '32px 24px' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              color: 'white'
            }}>
              <FaHistory />
            </div>
            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'white', marginBottom: '4px' }}>
                {stats.searchHistoryCount}
              </div>
              <div style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Searches Made</div>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '32px 24px' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              color: 'white'
            }}>
              <FaGamepad />
            </div>
            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'white', marginBottom: '4px' }}>
                ∞
              </div>
              <div style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Games to Discover</div>
            </div>
          </div>
        </div>

        {searchHistory.length > 0 && (
          <div className="card" style={{ padding: '32px' }}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '24px' }}>Recent Searches</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {searchHistory.map((search, index) => (
                <div key={index} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px 20px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <span style={{ fontWeight: '500' }}>"{search.query}"</span>
                  <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem' }}>
                    {formatDate(search.searchedAt)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
