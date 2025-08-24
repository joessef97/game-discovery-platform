import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaGamepad, FaUser, FaHeart, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="nav-content">
          <Link to="/" className="nav-brand" onClick={closeMenu}>
            <FaGamepad className="brand-icon" />
            <span>Game Discovery</span>
          </Link>

          <button className="mobile-menu-toggle" onClick={toggleMenu}>
            {isMenuOpen ? <FaTimes /> : <FaBars />}
          </button>

          <div className={`nav-menu ${isMenuOpen ? 'nav-menu-open' : ''}`}>
            <div className="nav-links">
              <Link to="/" className="nav-link" onClick={closeMenu}>
                Home
              </Link>
              {isAuthenticated && (
                <Link to="/favorites" className="nav-link" onClick={closeMenu}>
                  <FaHeart className="nav-icon" />
                  Favorites
                </Link>
              )}
            </div>

            <div className="nav-auth">
              {isAuthenticated ? (
                <div className="user-menu">
                  <Link to="/profile" className="user-link" onClick={closeMenu}>
                    <FaUser className="nav-icon" />
                    <span>{user?.username}</span>
                  </Link>
                  <button className="logout-btn" onClick={handleLogout}>
                    <FaSignOutAlt className="nav-icon" />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="auth-links">
                  <Link to="/login" className="nav-link" onClick={closeMenu}>
                    Login
                  </Link>
                  <Link to="/register" className="btn btn-primary" onClick={closeMenu}>
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
