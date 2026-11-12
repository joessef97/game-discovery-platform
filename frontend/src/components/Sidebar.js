import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FaHome, FaCompass, FaList, FaCalendarAlt, FaTrophy,
  FaGamepad, FaBookmark, FaHistory,
  FaDesktop,
} from 'react-icons/fa';

const NAV_ITEMS = [
  { to: '/', icon: FaHome, label: 'Home', exact: true },
  { to: '/discover', icon: FaCompass, label: 'Discover' },
  { to: '/browse', icon: FaList, label: 'Browse' },
  { to: '/upcoming', icon: FaCalendarAlt, label: 'Upcoming' },
  { to: '/charts', icon: FaTrophy, label: 'Top Charts' },
];

const LIBRARY_ITEMS = [
  { to: '/favorites', icon: FaGamepad, label: 'My Games' },
  { to: '/wishlist', icon: FaBookmark, label: 'Wishlist' },
  { to: '/recent', icon: FaHistory, label: 'Recent Searches' },
];

const PLATFORMS = [
  { to: '/browse', icon: FaDesktop, label: 'Genres & Platforms', color: 'var(--text-secondary)' },
];

const Sidebar = () => {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const isActive = (path) => location.pathname === path;

  const linkBase = `
    flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer
    hover:bg-white/5
  `;
  const linkActive = 'bg-white/8 text-white';
  const linkInactive = 'text-[rgba(240,240,240,0.55)] hover:text-white';

  return (
    <aside
      id="sidebar"
      className="fixed left-0 bottom-0 flex flex-col pt-2 pb-4 overflow-y-auto z-50"
      style={{
        top: 'var(--topbar-height)',
        width: 'var(--sidebar-width)',
        background: 'var(--bg-root)',
        borderRight: '1px solid var(--border)',
      }}
    >
      <div className="flex-1 flex flex-col px-3 gap-0.5">

        {/* ── NAV ── */}
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <Link
            key={label}
            to={to}
            className={`${linkBase} ${isActive(to) ? linkActive : linkInactive}`}
            style={isActive(to) ? {
              background: 'rgba(212,245,60,0.08)',
              color: '#d4f53c',
              borderLeft: '2px solid #d4f53c',
            } : {}}
          >
            <Icon className="w-4 h-4 flex-shrink-0 opacity-75" />
            <span style={{ fontFamily: 'var(--font-body)' }}>{label}</span>
          </Link>
        ))}

        {/* ── Divider ── */}
        <div className="my-3 border-t" style={{ borderColor: 'var(--border)' }} />

        {/* ── LIBRARY ── */}
        <div
          className="text-[10px] font-bold uppercase tracking-widest mb-1.5 px-3"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}
        >
          Library
        </div>

        {isAuthenticated ? LIBRARY_ITEMS.map(({ to, icon: Icon, label }) => (
          <Link
            key={label}
            to={to}
            className={`${linkBase} ${isActive(to) ? linkActive : linkInactive}`}
          >
            <Icon className="w-4 h-4 flex-shrink-0 opacity-75" />
            <span style={{ fontFamily: 'var(--font-body)' }}>{label}</span>
          </Link>
        )) : (
          <Link to="/login" className={`${linkBase} ${linkInactive}`}>
            <FaGamepad className="w-4 h-4 opacity-75" />
            <span className="text-xs">Sign in to access</span>
          </Link>
        )}

        {/* ── Divider ── */}
        <div className="my-3 border-t" style={{ borderColor: 'var(--border)' }} />

        {/* ── PLATFORMS ── */}
        <div
          className="text-[10px] font-bold uppercase tracking-widest mb-1.5 px-3"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}
        >
          Platforms
        </div>

        {PLATFORMS.map(({ to, icon: Icon, label, color }) => (
          <Link key={label} to={to} className={`${linkBase} ${linkInactive}`}>
            <Icon className="w-4 h-4 flex-shrink-0" style={{ color }} />
            <span style={{ fontFamily: 'var(--font-body)' }}>{label}</span>
          </Link>
        ))}
      </div>

      {/* ── User Card ── */}
      {isAuthenticated && (
        <Link to="/profile" className="mx-3 mt-4 p-3 rounded-xl transition-all hover:bg-white/5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: 'rgba(212,245,60,0.15)', color: '#d4f53c' }}>
              {user?.username?.slice(0, 2)?.toUpperCase() || 'P1'}
            </div>
            <div className="min-w-0 text-sm font-semibold text-white truncate">{user?.username || 'Player'}</div>
          </div>
        </Link>
      )}
    </aside>
  );
};

export default Sidebar;
