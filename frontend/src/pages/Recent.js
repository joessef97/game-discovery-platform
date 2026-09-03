import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaHistory, FaSearch, FaArrowRight } from 'react-icons/fa';
import gameService from '../services/gameService';

const S = {
  page: { paddingTop: 'calc(var(--topbar-height) + var(--sp-6))', paddingLeft: 'calc(var(--sidebar-width) + var(--sp-6))', paddingRight: 'var(--sp-6)', paddingBottom: 'var(--sp-10)', minHeight: '100vh', animation: 'fadeIn 0.4s ease-out' },
  header: { marginBottom: 'var(--sp-8)' },
  title: { fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', fontWeight: 900, letterSpacing: '0.02em', textTransform: 'uppercase', color: 'var(--text-primary)', marginBottom: 'var(--sp-1)', display: 'flex', alignItems: 'center', gap: 10 },
  sub: { color: 'var(--text-muted)', fontSize: 'var(--text-sm)' },
  empty: { textAlign: 'center', padding: 'var(--sp-16) var(--sp-6)', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', maxWidth: '460px', margin: '0 auto' },
  emptyIcon: { fontSize: '3rem', color: 'var(--accent)', opacity: 0.35, marginBottom: 'var(--sp-6)' },
  emptyTitle: { fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: 'var(--sp-2)' },
  emptyText: { color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--sp-6)' },
  list: { display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)', maxWidth: 720 },
  row: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--sp-4)', padding: 'var(--sp-4) var(--sp-5)', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', textDecoration: 'none', color: 'inherit', transition: 'all 200ms ease' },
  rowLeft: { display: 'flex', alignItems: 'center', gap: 'var(--sp-4)', minWidth: 0 },
  rowIcon: { width: 34, height: 34, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--r-md)', background: 'var(--accent-dim)', color: 'var(--accent)', fontSize: 13 },
  query: { fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  when: { fontSize: '11px', color: 'var(--text-muted)', marginTop: 2 },
  arrow: { color: 'var(--text-muted)', fontSize: 11, flexShrink: 0 },
};

const formatWhen = (iso) => {
  if (!iso) return '';
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return '';
  const mins = Math.floor((Date.now() - then.getTime()) / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? '' : 's'} ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  return then.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const Recent = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { loadHistory(); }, []);

  const loadHistory = async () => {
    setLoading(true);
    try { setHistory(await gameService.getSearchHistory()); }
    catch (e) { setError('Failed to load your recent activity.'); }
    finally { setLoading(false); }
  };

  if (loading) return <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'50vh',gap:'var(--sp-4)'}}><div className="spinner"></div><span style={{color:'var(--text-muted)',fontSize:'var(--text-sm)'}}>Loading...</span></div>;

  return (
    <div style={S.page}>
      <div style={S.header}>
        <h1 style={S.title}><FaHistory style={{ color: 'var(--accent)', fontSize: 20 }} /> Recent Searches</h1>
        <p style={S.sub}>{history.length > 0 ? `Your last ${history.length} search${history.length === 1 ? '' : 'es'}` : 'Your latest activity will appear here'}</p>
      </div>

      {error && <div className="error" style={{maxWidth:'500px',marginBottom:'var(--sp-5)'}}>{error}</div>}

      {history.length === 0 ? (
        <div style={S.empty}>
          <FaSearch style={S.emptyIcon} />
          <h2 style={S.emptyTitle}>No recent searches</h2>
          <p style={S.emptyText}>Search for a game and it will show up here so you can pick up where you left off.</p>
          <Link to="/discover" className="btn btn-primary">Start Searching</Link>
        </div>
      ) : (
        <div style={S.list}>
          {history.map((entry, i) => (
            <Link
              key={entry._id || `${entry.query}-${i}`}
              to={`/discover?q=${encodeURIComponent(entry.query)}`}
              style={{ ...S.row, animation: `fadeInUp 0.35s ease-out ${i * 0.03}s backwards` }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.transform = 'translateX(4px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateX(0)'; }}
            >
              <div style={S.rowLeft}>
                <div style={S.rowIcon}><FaSearch /></div>
                <div style={{ minWidth: 0 }}>
                  <div style={S.query}>{entry.query}</div>
                  <div style={S.when}>{formatWhen(entry.searchedAt)}</div>
                </div>
              </div>
              <FaArrowRight style={S.arrow} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Recent;
