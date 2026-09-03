import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaClock, FaGamepad, FaDesktop, FaXbox } from 'react-icons/fa';
import { SiPlaystation, SiNintendoswitch } from 'react-icons/si';
import gameService from '../services/gameService';


/* Map IGDB platform names onto the four icons this page renders */
const PLATFORM_ALIASES = [
  [/playstation\s*5|playstation\s*4/i, 'PS5'],
  [/xbox/i,                              'Xbox'],
  [/nintendo switch/i,                   'Switch'],
  [/^pc|windows|linux|mac/i,             'PC'],
];

const mapPlatforms = (platforms = []) => {
  const out = [];
  platforms.forEach((p) => {
    const name = p?.platform?.name || '';
    const hit = PLATFORM_ALIASES.find(([re]) => re.test(name));
    if (hit && !out.includes(hit[1])) out.push(hit[1]);
  });
  return out;
};

/* Colour the release tag by how far out the date is */
const tagFor = (date) => {
  const days = (date - new Date()) / 86400000;
  if (days <= 30)  return { tag: 'Coming Soon',      tagColor: '#22c55e' };
  if (days <= 180) return { tag: 'This Year',        tagColor: '#fbbf24' };
  return { tag: 'Announced', tagColor: '#f43f5e' };
};

const GRADIENTS = [
  'linear-gradient(135deg,#0f2027,#203a43,#2c5364)',
  'linear-gradient(135deg,#1a0a00,#8b2500)',
  'linear-gradient(135deg,#000814,#003566)',
  'linear-gradient(135deg,#2d1b69,#11998e)',
  'linear-gradient(135deg,#1a0533,#5c1a8e)',
];

const PLATFORM_ICONS = {
  PC:    { icon: FaDesktop,        color: 'var(--text-secondary)' },
  PS5:   { icon: SiPlaystation,    color: '#2d73f5' },
  Xbox:  { icon: FaXbox,           color: '#4ca82b' },
  Switch:{ icon: SiNintendoswitch, color: '#e4000f' },
};

/* Countdown helper */
const getCountdown = (date) => {
  const now  = new Date();
  const diff = date - now;
  if (diff <= 0) return null;
  const days  = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 365) return `${Math.floor(days / 365)}y ${days % 365}d`;
  if (days > 0)   return `${days}d ${hours}h`;
  return `${hours}h`;
};

/* Format date nicely */
const fmtDate = (d) => d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
const fmtMonth = (d) => d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

/* Group by month */
const groupByMonth = (games) => {
  const groups = {};
  games.forEach((g) => {
    const key = fmtMonth(g.releaseDate);
    if (!groups[key]) groups[key] = [];
    groups[key].push(g);
  });
  return groups;
};

/* ── Upcoming card ── */
const UpcomingCard = ({ id, name, genre, releaseDate, tag, tagColor, platforms, gradient, desc, image }) => {
  const [imgErr, setImgErr]   = useState(false);
  const [countdown, setCountdown] = useState(getCountdown(releaseDate));
  const img = image || null;

  useEffect(() => {
    const t = setInterval(() => setCountdown(getCountdown(releaseDate)), 60000);
    return () => clearInterval(t);
  }, [releaseDate]);

  return (
    <Link
      to={`/game/${id}`}
      className="flex gap-4 rounded-xl overflow-hidden group transition-all"
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border)',
        textDecoration: 'none',
        color: 'inherit',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      {/* Cover */}
      <div
        className="relative flex-shrink-0 rounded-l-xl overflow-hidden"
        style={{ width: 80, background: gradient }}
      >
        {img && !imgErr && (
          <img
            src={img}
            alt={name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={() => setImgErr(true)}
          />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 py-3 pr-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div>
            <div
              className="font-bold text-white text-sm leading-tight truncate mb-0.5"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              {name}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
              {genre}
            </div>
          </div>
          <span
            className="text-[9px] font-bold px-2 py-0.5 rounded flex-shrink-0"
            style={{
              background: `${tagColor}20`,
              color: tagColor,
              border: `1px solid ${tagColor}44`,
              fontFamily: 'var(--font-display)',
              letterSpacing: '0.04em',
            }}
          >
            {tag}
          </span>
        </div>

        <p
          className="text-[11px] leading-relaxed mb-2 line-clamp-2"
          style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-body)' }}
        >
          {desc}
        </p>

        <div className="flex items-center justify-between">
          {/* Platforms */}
          <div className="flex items-center gap-2">
            {platforms.map((p) => {
              const { icon: PIcon, color } = PLATFORM_ICONS[p] || {};
              return PIcon ? <PIcon key={p} style={{ color, fontSize: 13 }} title={p} /> : null;
            })}
          </div>

          {/* Release info */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5" style={{ color: 'var(--text-muted)', fontSize: 11 }}>
              <FaCalendarAlt style={{ fontSize: 10 }} />
              <span style={{ fontFamily: 'var(--font-body)' }}>{fmtDate(releaseDate)}</span>
            </div>
            {countdown && (
              <div
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-full"
                style={{
                  background: 'rgba(212,245,60,0.08)',
                  border: '1px solid rgba(212,245,60,0.15)',
                  color: '#d4f53c',
                  fontSize: 10,
                  fontFamily: 'var(--font-display)',
                  letterSpacing: '0.04em',
                }}
              >
                <FaClock style={{ fontSize: 9 }} />
                {countdown}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

/* ══════════════════════════════════════
   UPCOMING PAGE
══════════════════════════════════════ */
const Upcoming = () => {
  const [games, setGames]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await gameService.getUpcomingGames(1, 24);
        if (cancelled) return;
        const mapped = (data.results || [])
          .filter((g) => g.released)
          .map((g, i) => {
            const releaseDate = new Date(g.released);
            return {
              id: g.id,
              name: g.name,
              genre: g.genres?.map((x) => x.name).slice(0, 2).join(' · ') || 'Game',
              releaseDate,
              platforms: mapPlatforms(g.platforms),
              gradient: GRADIENTS[i % GRADIENTS.length],
              desc: g.description_raw || 'No description available yet.',
              image: g.background_image,
              ...tagFor(releaseDate),
            };
          });
        setGames(mapped);
      } catch (e) {
        if (!cancelled) setError('Failed to load upcoming releases.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const sorted = [...games].sort((a, b) => a.releaseDate - b.releaseDate);
  const grouped = groupByMonth(sorted);

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
            <FaCalendarAlt />
          </div>
          <h1
            className="font-black uppercase"
            style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--text-primary)' }}
          >
            Upcoming Releases
          </h1>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
          Mark your calendar — the most anticipated games are coming soon
        </p>
      </div>

      {error && (
        <div className="error" style={{ maxWidth: 500, marginBottom: 'var(--sp-5)' }}>{error}</div>
      )}

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '40vh', gap: 'var(--sp-4)' }}>
          <div className="spinner"></div>
          <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Loading upcoming releases...</span>
        </div>
      )}

      {!loading && !error && sorted.length === 0 && (
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>No upcoming releases found right now.</p>
      )}

      {/* ── Groups ── */}
      <div className="flex flex-col gap-8">
        {Object.entries(grouped).map(([month, games]) => (
          <section key={month}>
            {/* Month header */}
            <div
              className="flex items-center gap-3 mb-4"
            >
              <h2
                className="font-black uppercase"
                style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', color: 'var(--text-primary)', letterSpacing: '0.05em' }}
              >
                {month}
              </h2>
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}
              >
                {games.length} release{games.length !== 1 ? 's' : ''}
              </span>
              <div className="flex-1" style={{ borderTop: '1px solid var(--border)' }} />
            </div>

            {/* Game cards */}
            <div className="flex flex-col gap-3">
              {games.map((g, i) => (
                <div key={g.id} style={{ animation: `fadeInUp 0.35s ease-out ${i * 0.07}s backwards` }}>
                  <UpcomingCard {...g} />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default Upcoming;
