import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaTrophy, FaMedal } from 'react-icons/fa';
import gameService from '../services/gameService';

const TABS = ['All Time', 'This Year', 'Last 3 Years'];

const scoreColor  = (s) => s >= 90 ? '#22c55e' : s >= 80 ? '#22c55e' : s >= 70 ? '#fbbf24' : '#ef4444';
const scoreBg     = (s) => s >= 80 ? 'rgba(34,197,94,0.15)' : s >= 60 ? 'rgba(251,191,36,0.15)' : 'rgba(239,68,68,0.15)';
const scoreBorder = (s) => s >= 80 ? 'rgba(34,197,94,0.3)'  : s >= 60 ? 'rgba(251,191,36,0.3)'  : 'rgba(239,68,68,0.3)';

const rankColor = (r) => r === 1 ? '#fbbf24' : r === 2 ? '#d1d5db' : r === 3 ? '#b45309' : 'var(--text-muted)';
const rankSize  = (r) => r <= 3 ? '1.4rem' : '1rem';

const RankRow = ({ rank, id, name, genre, score, platform, year, image, i }) => {
  const [imgErr, setImgErr] = useState(false);
  const img = image || null;
  const isTop3 = rank <= 3;

  return (
    <Link
      to={`/game/${id}`}
      className="flex items-center gap-4 px-4 py-3 rounded-xl group transition-all"
      style={{
        background: isTop3 ? 'rgba(255,255,255,0.025)' : 'transparent',
        border: `1px solid ${isTop3 ? 'rgba(255,255,255,0.07)' : 'transparent'}`,
        textDecoration: 'none',
        color: 'inherit',
        animation: `fadeInUp 0.35s ease-out ${i * 0.05}s backwards`,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = isTop3 ? 'rgba(255,255,255,0.025)' : 'transparent'; e.currentTarget.style.borderColor = isTop3 ? 'rgba(255,255,255,0.07)' : 'transparent'; }}
    >
      {/* Rank number */}
      <div
        className="flex items-center justify-center flex-shrink-0"
        style={{ width: 36, fontFamily: 'var(--font-display)', fontSize: rankSize(rank), fontWeight: 900, color: rankColor(rank) }}
      >
        {rank <= 3 ? <FaMedal /> : rank}
      </div>

      {/* Thumbnail */}
      <div
        className="w-10 h-14 rounded-lg overflow-hidden flex-shrink-0"
        style={{ background: 'linear-gradient(160deg,#111118,#16161f)' }}
      >
        {img && !imgErr && (
          <img
            src={img}
            alt={name}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={() => setImgErr(true)}
          />
        )}
      </div>

      {/* Game info */}
      <div className="flex-1 min-w-0">
        <div
          className="font-bold text-white text-sm leading-tight truncate mb-1"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          {name}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-[10px] px-2 py-0.5 rounded-full"
            style={{ background: 'var(--accent-dim)', color: 'var(--accent)', fontFamily: 'var(--font-body)' }}
          >
            {genre}
          </span>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
            {platform} · {year}
          </span>
        </div>
      </div>

      {/* Score */}
      <div
        className="flex-shrink-0 flex items-center justify-center font-black rounded-lg"
        style={{
          width: 44, height: 36,
          background: scoreBg(score),
          color: scoreColor(score),
          border: `1px solid ${scoreBorder(score)}`,
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-lg)',
        }}
      >
        {score}
      </div>
    </Link>
  );
};

/* ══════════════════════════════════════
   TOP CHARTS PAGE
══════════════════════════════════════ */
const TopCharts = () => {
  const [activeTab, setActiveTab] = useState('All Time');

  const [list, setList]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    (async () => {
      try {
        // 'This Year' / 'Last 3 Years' narrow the window; 'All Time' is unfiltered.
        const thisYear = new Date().getFullYear();
        const since =
          activeTab === 'This Year'     ? thisYear :
          activeTab === 'Last 3 Years'  ? thisYear - 2 : null;

        const data = await gameService.getTopRatedGames(1, 20, since);
        if (cancelled) return;
        setList((data.results || []).map((g, i) => ({
          rank: i + 1,
          id: g.id,
          name: g.name,
          genre: g.genres?.map((x) => x.name).slice(0, 2).join(' / ') || 'Game',
          score: g.rating ? Math.round(g.rating * 10) : null,
          platform: g.platforms?.map((p) => p.platform.name).slice(0, 2).join(' · ') || '',
          year: g.released ? new Date(g.released).getFullYear() : '',
          image: g.background_image,
        })));
      } catch (e) {
        if (!cancelled) setError('Failed to load charts.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [activeTab]);

  return (
    <div
      style={{
        paddingTop: 'calc(var(--topbar-height) + var(--sp-6))',
        paddingLeft: 'calc(var(--sidebar-width) + var(--sp-6))',
        paddingRight: 'var(--sp-6)',
        paddingBottom: 'var(--sp-10)',
        minHeight: '100vh',
      }}
    >
      {/* ── Header ── */}
      <div style={{ marginBottom: 'var(--sp-6)' }}>
        <div className="flex items-center gap-3 mb-1">
          <div
            className="w-10 h-10 flex items-center justify-center rounded-xl"
            style={{ background: 'rgba(212,245,60,0.1)', color: '#d4f53c', fontSize: '1.1rem' }}
          >
            <FaTrophy />
          </div>
          <h1
            className="font-black uppercase"
            style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--text-primary)' }}
          >
            Top Charts
          </h1>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
          The highest-rated games, straight from IGDB's community ratings
        </p>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-2 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="px-5 py-2 text-sm font-bold rounded-full transition-all"
            style={activeTab === tab
              ? { background: '#d4f53c', color: '#0a0a0f', fontFamily: 'var(--font-display)', border: '1px solid #d4f53c' }
              : {
                  background: 'rgba(255,255,255,0.04)',
                  color: 'rgba(240,240,240,0.6)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  fontFamily: 'var(--font-body)',
                }
            }
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Legend row ── */}
      <div
        className="flex items-center gap-4 px-4 mb-2"
        style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', letterSpacing: '0.08em', textTransform: 'uppercase' }}
      >
        <div style={{ width: 36 }}>#</div>
        <div style={{ width: 40 }}>Cover</div>
        <div className="flex-1">Game</div>
        <div>Score</div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px solid var(--border)', marginBottom: 'var(--sp-3)' }} />

      {/* ── Chart list ── */}
      {error && <div className="error" style={{ maxWidth: 500, marginBottom: 'var(--sp-4)' }}>{error}</div>}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '35vh', gap: 'var(--sp-4)' }}>
          <div className="spinner"></div>
          <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Loading charts...</span>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          {list.map((item, i) => (
            <RankRow key={item.id} {...item} i={i} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TopCharts;
