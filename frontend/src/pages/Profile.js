import React, { useState, useEffect } from 'react';
import { FaUser, FaHeart, FaHistory, FaGamepad, FaSearch } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import gameService from '../services/gameService';
import favoriteService from '../services/favoriteService';

const S = {
  page: { paddingTop: 'calc(var(--topbar-height) + var(--sp-6))', paddingLeft: 'calc(var(--sidebar-width) + var(--sp-6))', paddingRight: 'var(--sp-6)', paddingBottom: 'var(--sp-10)', minHeight: '100vh', animation: 'fadeIn 0.4s ease-out' },
  profileCard: { display: 'flex', alignItems: 'center', gap: 'var(--sp-6)', padding: 'var(--sp-8)', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', marginBottom: 'var(--sp-6)', position: 'relative', overflow: 'hidden' },
  shine: { position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(212,245,60,0.03) 0%, transparent 50%)', pointerEvents: 'none' },
  avatar: { width: '72px', height: '72px', background: 'var(--accent-dim)', borderRadius: 'var(--r-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', color: 'var(--accent)', flexShrink: 0, boxShadow: '0 0 24px rgba(212,245,60,0.1)' },
  info: { position: 'relative', zIndex: 1 },
  username: { fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.02em', color: 'var(--text-primary)', marginBottom: '2px' },
  email: { fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBottom: '4px' },
  memberDate: { fontSize: 'var(--text-xs)', color: 'var(--text-muted)' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--sp-4)', marginBottom: 'var(--sp-6)' },
  statCard: { display: 'flex', alignItems: 'center', gap: 'var(--sp-4)', padding: 'var(--sp-5) var(--sp-5)', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', transition: 'all 300ms ease' },
  statIcon: (bg) => ({ width: '42px', height: '42px', borderRadius: 'var(--r-lg)', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }),
  statVal: { fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 },
  statLabel: { fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: '2px' },
  historyCard: { padding: 'var(--sp-6)', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)' },
  historyTitle: { fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-primary)', marginBottom: 'var(--sp-4)', display: 'flex', alignItems: 'center', gap: '8px' },
  historyItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--sp-3) var(--sp-4)', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)', transition: 'all 200ms ease' },
  historyQuery: { fontWeight: 500, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' },
  historyDate: { color: 'var(--text-muted)', fontSize: 'var(--text-xs)', flexShrink: 0 },
};

const Profile = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ favoritesCount: 0, searchHistoryCount: 0 });
  const [searchHistory, setSearchHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadProfileData(); }, []);

  const loadProfileData = async () => {
    setLoading(true);
    try {
      const [favorites, history] = await Promise.all([favoriteService.getFavorites(), gameService.getSearchHistory()]);
      setStats({ favoritesCount: favorites.length, searchHistoryCount: history.length });
      setSearchHistory(history.slice(0, 10));
    } catch (e) { console.error('Error loading profile:', e); }
    finally { setLoading(false); }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  if (loading) return <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'50vh',gap:'var(--sp-4)'}}><div className="spinner"></div></div>;

  return (
    <div style={S.page}>
      <div style={S.profileCard}>
        <div style={S.shine} />
        <div style={S.avatar}><FaUser /></div>
        <div style={S.info}>
          <h1 style={S.username}>{user?.username}</h1>
          <p style={S.email}>{user?.email}</p>
          <p style={S.memberDate}>Member since {formatDate(user?.createdAt)}</p>
        </div>
      </div>

      <div style={S.statsGrid}>
        {[
          { icon: <FaHeart style={{color:'var(--color-heart)'}} />, bg: 'rgba(244,63,94,0.1)', val: stats.favoritesCount, label: 'Favorite Games' },
          { icon: <FaHistory style={{color:'var(--accent)'}} />, bg: 'var(--accent-dim)', val: stats.searchHistoryCount, label: 'Searches Made' },
          { icon: <FaGamepad style={{color:'var(--color-success)'}} />, bg: 'rgba(34,197,94,0.1)', val: '∞', label: 'Games to Discover' },
        ].map((s, i) => (
          <div key={i} style={S.statCard}
            onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--border-hover)';e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='var(--shadow-lg)';}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='none';}}
          >
            <div style={S.statIcon(s.bg)}>{s.icon}</div>
            <div><div style={S.statVal}>{s.val}</div><div style={S.statLabel}>{s.label}</div></div>
          </div>
        ))}
      </div>

      {searchHistory.length > 0 && (
        <div style={S.historyCard}>
          <h2 style={S.historyTitle}><FaSearch style={{fontSize:'13px',color:'var(--accent)',opacity:0.7}} /> Recent Searches</h2>
          <div style={{display:'flex',flexDirection:'column',gap:'var(--sp-2)'}}>
            {searchHistory.map((s, i) => (
              <div key={i} style={S.historyItem}
                onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,0.04)';e.currentTarget.style.borderColor='var(--border-hover)';}}
                onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.02)';e.currentTarget.style.borderColor='var(--border)';}}
              >
                <span style={S.historyQuery}>"{s.query}"</span>
                <span style={S.historyDate}>{formatDate(s.searchedAt)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
