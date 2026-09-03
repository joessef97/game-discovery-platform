import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaGamepad, FaSearch, FaBell, FaSignOutAlt } from 'react-icons/fa';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => { logout(); navigate('/'); };

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      navigate(`/discover?q=${encodeURIComponent(q)}`);
      setSearchQuery('');
    }
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-[100] flex items-center px-4 border-b"
      style={{
        height: 'var(--topbar-height)',
        background: 'rgba(10,10,15,0.92)',
        backdropFilter: 'blur(24px) saturate(180%)',
        borderColor: 'var(--border)',
      }}
      id="topbar"
    >
      <div className="flex items-center w-full gap-3">
        {/* ── Brand ── */}
        <Link
          to="/"
          className="flex items-center gap-2 flex-shrink-0 transition-opacity hover:opacity-85"
          style={{ width: 'calc(var(--sidebar-width) - 8px)' }}
        >
          <div
            className="w-8 h-8 flex items-center justify-center rounded-md text-[#0a0a0f] text-base"
            style={{ background: '#d4f53c', boxShadow: '0 0 16px rgba(212,245,60,0.25)' }}
          >
            <FaGamepad />
          </div>
          <span
            className="text-white text-xl font-black uppercase tracking-wide"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            GAME<span style={{ color: '#d4f53c' }}>HUB</span>
          </span>
        </Link>

        {/* ── Search ── */}
        <form
          className="flex-1 relative"
          style={{ maxWidth: 420, margin: '0 auto' }}
          onSubmit={handleSearch}
        >
          <FaSearch
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] pointer-events-none"
            style={{ color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search games, genres, tags..."
            className="w-full py-2 pr-4 pl-9 text-sm rounded-full outline-none transition-all"
            style={{
              fontFamily: 'var(--font-body)',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#d4f53c';
              e.target.style.boxShadow = '0 0 0 3px rgba(212,245,60,0.08)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--border)';
              e.target.style.boxShadow = 'none';
            }}
            id="topbar-search"
          />
        </form>

        {/* ── Right ── */}
        <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
          {isAuthenticated ? (
            <>
              <button
                className="relative w-9 h-9 flex items-center justify-center rounded-md text-sm transition-all hover:bg-white/5"
                style={{ color: 'var(--text-secondary)', border: '1px solid transparent' }}
                title="Notifications"
                id="notifications-btn"
              >
                <FaBell />
                <span
                  className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
                  style={{ background: '#d4f53c', border: '2px solid #0a0a0f' }}
                />
              </button>

              <Link
                to="/profile"
                className="flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-all hover:bg-white/7"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                }}
                id="user-profile-pill"
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[10px]"
                  style={{ background: 'var(--accent-dim)', color: '#d4f53c' }}
                >
                  <span className="font-bold uppercase" style={{ fontFamily: 'var(--font-display)' }}>
                    {user?.username?.slice(0, 2) || 'P1'}
                  </span>
                </div>
                <span className="text-white">{user?.username || 'PlayerOne'}</span>
                <span
                  className="text-xs font-bold ml-1"
                  style={{ color: '#d4f53c', fontFamily: 'var(--font-display)' }}
                >
                  Lv {user?.level ?? 1}
                </span>
              </Link>

              <button
                className="w-9 h-9 flex items-center justify-center rounded-md text-sm transition-all hover:bg-white/5"
                style={{ color: 'var(--text-secondary)', border: '1px solid transparent' }}
                onClick={handleLogout}
                title="Sign out"
                id="logout-btn"
              >
                <FaSignOutAlt />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium rounded-md transition-all hover:bg-white/5"
                style={{ color: 'var(--text-secondary)' }}
                id="signin-btn"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-sm font-bold rounded-md transition-all hover:opacity-90"
                style={{
                  background: '#d4f53c',
                  color: '#0a0a0f',
                  fontFamily: 'var(--font-display)',
                  letterSpacing: '0.05em',
                }}
                id="signup-btn"
              >
                GET STARTED
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
