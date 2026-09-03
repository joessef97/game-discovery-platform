import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaFire, FaDragon, FaCrosshairs, FaChess, FaCode, FaMap,
  FaFootballBall, FaSkull, FaCar, FaBrain, FaCity, FaStar,
} from 'react-icons/fa';

const GENRE_TILES = [
  {
    name: 'Action',
    icon: FaFire,
    gradient: 'linear-gradient(135deg, #7f1d1d 0%, #dc2626 100%)',
    glow: 'rgba(220,38,38,0.3)',
    count: '12,400+',
  },
  {
    name: 'RPG',
    icon: FaDragon,
    gradient: 'linear-gradient(135deg, #1e1b4b 0%, #7c3aed 100%)',
    glow: 'rgba(124,58,237,0.3)',
    count: '8,900+',
  },
  {
    name: 'Shooter',
    icon: FaCrosshairs,
    gradient: 'linear-gradient(135deg, #064e3b 0%, #059669 100%)',
    glow: 'rgba(5,150,105,0.3)',
    count: '5,200+',
  },
  {
    name: 'Strategy',
    icon: FaChess,
    gradient: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)',
    glow: 'rgba(37,99,235,0.3)',
    count: '6,100+',
  },
  {
    name: 'Indie',
    icon: FaCode,
    gradient: 'linear-gradient(135deg, #3d2200 0%, #d97706 100%)',
    glow: 'rgba(217,119,6,0.3)',
    count: '18,700+',
  },
  {
    name: 'Adventure',
    icon: FaMap,
    gradient: 'linear-gradient(135deg, #14532d 0%, #16a34a 100%)',
    glow: 'rgba(22,163,74,0.3)',
    count: '9,500+',
  },
  {
    name: 'Sports',
    icon: FaFootballBall,
    gradient: 'linear-gradient(135deg, #713f12 0%, #ca8a04 100%)',
    glow: 'rgba(202,138,4,0.3)',
    count: '3,800+',
  },
  {
    name: 'Horror',
    icon: FaSkull,
    gradient: 'linear-gradient(135deg, #0a0a0f 0%, #4a044e 100%)',
    glow: 'rgba(74,4,78,0.3)',
    count: '2,600+',
  },
  {
    name: 'Racing',
    icon: FaCar,
    gradient: 'linear-gradient(135deg, #1c1917 0%, #e11d48 100%)',
    glow: 'rgba(225,29,72,0.3)',
    count: '1,900+',
  },
  {
    name: 'Puzzle',
    icon: FaBrain,
    gradient: 'linear-gradient(135deg, #0c4a6e 0%, #0ea5e9 100%)',
    glow: 'rgba(14,165,233,0.3)',
    count: '4,200+',
  },
  {
    name: 'Simulation',
    icon: FaCity,
    gradient: 'linear-gradient(135deg, #1a2f1a 0%, #4ade80 100%)',
    glow: 'rgba(74,222,128,0.3)',
    count: '3,100+',
  },
  {
    name: 'Top Rated',
    icon: FaStar,
    gradient: 'linear-gradient(135deg, #3d2800 0%, #d4f53c 100%)',
    glow: 'rgba(212,245,60,0.3)',
    count: '500+',
  },
];

const GenreTile = ({ name, icon: Icon, gradient, glow, count, onClick }) => (
  <button
    onClick={onClick}
    className="group relative overflow-hidden rounded-2xl text-left transition-all"
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
      e.currentTarget.style.boxShadow = `0 16px 40px ${glow}`;
      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0) scale(1)';
      e.currentTarget.style.boxShadow = 'none';
      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
    }}
    style={{
      background: gradient,
      border: '1px solid rgba(255,255,255,0.08)',
      padding: '28px 20px',
      aspectRatio: '4/3',
      cursor: 'pointer',
      width: '100%',
      transition: 'all var(--t-base)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      borderRadius: 'var(--r-2xl)',
    }}
  >
    {/* Icon */}
    <div
      className="w-12 h-12 flex items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
      style={{ background: 'rgba(255,255,255,0.15)', fontSize: '1.4rem', color: '#fff' }}
    >
      <Icon />
    </div>

    {/* Label */}
    <div>
      <div
        className="font-black uppercase text-white leading-none mb-1"
        style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', letterSpacing: '0.05em' }}
      >
        {name}
      </div>
      <div style={{ fontSize: 'var(--text-xs)', color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-body)' }}>
        {count} games
      </div>
    </div>

    {/* Hover shine */}
    <div
      className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500"
      style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 60%)' }}
    />
  </button>
);

/* ══════════════════════════════════════
   BROWSE PAGE
══════════════════════════════════════ */
const Browse = () => {
  const navigate = useNavigate();

  const handleGenreClick = (name) => {
    if (name === 'Top Rated') {
      navigate('/charts');
    } else {
      navigate(`/discover?q=${encodeURIComponent(name)}`);
    }
  };

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
      <div style={{ marginBottom: 'var(--sp-8)' }}>
        <h1
          className="font-black uppercase mb-1"
          style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--text-primary)' }}
        >
          Browse by Genre
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
          Explore games across every category
        </p>
      </div>

      {/* ── Genre grid ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 'var(--sp-4)',
        }}
      >
        {GENRE_TILES.map((tile, i) => (
          <div
            key={tile.name}
            style={{ animation: `fadeInUp 0.4s ease-out ${i * 0.05}s backwards` }}
          >
            <GenreTile
              {...tile}
              onClick={() => handleGenreClick(tile.name)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Browse;
