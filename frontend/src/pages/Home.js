import React, { useState, useEffect } from 'react';
import { FaSearch, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import GameCard from '../components/GameCard';
import gameService from '../services/gameService';
import './Home.css';

const Home = () => {
  const [games, setGames] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTrendingGames();
  }, []);

  const loadTrendingGames = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await gameService.getTrendingGames(1);
      setGames(data.results || []);
      setTotalPages(Math.ceil((data.count || 0) / 20));
      setCurrentPage(1);
      setHasSearched(false);
    } catch (error) {
      console.error('Error loading trending games:', error);
      setError('Failed to load trending games. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e, page = 1) => {
    e?.preventDefault();
    
    if (!searchQuery.trim()) {
      loadTrendingGames();
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data = await gameService.searchGames(searchQuery.trim(), page);
      setGames(data.results || []);
      setTotalPages(Math.ceil((data.count || 0) / 20));
      setCurrentPage(page);
      setHasSearched(true);
    } catch (error) {
      console.error('Error searching games:', error);
      setError('Failed to search games. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      if (hasSearched) {
        handleSearch(null, newPage);
      } else {
        loadTrendingGames();
      }
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    loadTrendingGames();
  };

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <h1>Discover Your Next Favorite Game</h1>
          <p>
            Explore thousands of games, read reviews, watch trailers, and build your 
            personal collection of favorites.
          </p>
        </div>
      </section>

      {/* Search Section */}
      <section className="search-section">
        <div className="container">
          <form onSubmit={handleSearch} className="search-container">
            <input
              type="text"
              placeholder="Search for games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-button">
              <FaSearch />
            </button>
          </form>
          
          {hasSearched && (
            <div className="search-info">
              <p>Search results for: <strong>"{searchQuery}"</strong></p>
              <button onClick={clearSearch} className="btn btn-secondary">
                Show Trending Games
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Results Section */}
      <section className="results-section">
        <div className="container">
          {error && (
            <div className="error">
              {error}
            </div>
          )}

          <div className="section-header">
            <h2>{hasSearched ? 'Search Results' : 'Trending Games'}</h2>
            {games.length > 0 && (
              <p className="results-count">
                {hasSearched ? `${games.length} results found` : `${games.length} trending games`}
              </p>
            )}
          </div>

          {loading ? (
            <div className="loading-grid">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="loading-card">
                  <div className="loading-image"></div>
                  <div className="loading-content">
                    <div className="loading-title"></div>
                    <div className="loading-text"></div>
                    <div className="loading-text short"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : games.length > 0 ? (
            <>
              <div className="games-grid">
                {games.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="btn btn-secondary"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <FaChevronLeft />
                    Previous
                  </button>
                  
                  <div className="page-info">
                    Page {currentPage} of {totalPages}
                  </div>
                  
                  <button
                    className="btn btn-secondary"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <FaChevronRight />
                  </button>
                </div>
              )}
            </>
          ) : !loading && (
            <div className="no-results">
              <h3>No games found</h3>
              <p>
                {hasSearched 
                  ? "Try adjusting your search terms or browse trending games instead."
                  : "Unable to load trending games at the moment."
                }
              </p>
              {hasSearched && (
                <button onClick={clearSearch} className="btn btn-primary">
                  Show Trending Games
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
