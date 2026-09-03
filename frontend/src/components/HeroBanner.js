import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FaPlay } from 'react-icons/fa';

// Real Steam CDN hero games with APP IDs
const HERO_GAMES = [
  {
    id: 1245620,
    name: 'ELDEN RING',
    subtitle: 'SHADOW OF THE ERDTREE',
    description: 'Rise, Tarnished, and step into the new chapter of the Lands Between.',
    score: 94,
    scoreLabel: 'EXCEPTIONAL',
    reviews: '12,432 reviews',
    tags: ['Action RPG', 'Fantasy', 'Open World'],
    trailerYt: 'E3Huy2cdih0',
    gradient: 'linear-gradient(to right, rgba(10,10,15,0.98) 0%, rgba(10,10,15,0.75) 60%, rgba(10,10,15,0.1) 100%)',
    heroUrl: `https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/library_hero.jpg`,
  },
  {
    id: 1086940,
    name: 'BALDUR\'S GATE 3',
    subtitle: 'GAME OF THE YEAR',
    description: 'Gather your party and return to the Forgotten Realms in an epic D&D adventure.',
    score: 97,
    scoreLabel: 'MASTERPIECE',
    reviews: '18,291 reviews',
    tags: ['RPG', 'Co-op', 'Turn-Based'],
    trailerYt: 'hqY0EHDjOvU',
    gradient: 'linear-gradient(to right, rgba(10,10,15,0.98) 0%, rgba(10,10,15,0.75) 60%, rgba(10,10,15,0.1) 100%)',
    heroUrl: `https://cdn.cloudflare.steamstatic.com/steam/apps/1086940/library_hero.jpg`,
  },
  {
    id: 1091500,
    name: 'CYBERPUNK 2077',
    subtitle: 'PHANTOM LIBERTY',
    description: 'Explore the dark future of Night City with its neon-lit streets and chrome-plated danger.',
    score: 88,
    scoreLabel: 'GREAT',
    reviews: '22,100 reviews',
    tags: ['Action RPG', 'Open World', 'Sci-Fi'],
    trailerYt: 'UnA6_rXFKFg',
    gradient: 'linear-gradient(to right, rgba(10,10,15,0.98) 0%, rgba(10,10,15,0.75) 60%, rgba(10,10,15,0.1) 100%)',
    heroUrl: `https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/library_hero.jpg`,
  },
  {
    id: 2322010,
    name: 'BALATRO',
    subtitle: 'POKER ROGUELIKE',
    description: 'A hypnotic poker-based roguelite where you bend the rules to create powerful synergies.',
    score: 97,
    scoreLabel: 'MASTERPIECE',
    reviews: '9,841 reviews',
    tags: ['Card Game', 'Roguelite', 'Strategy'],
    trailerYt: 'tFYsRZvHhEs',
    gradient: 'linear-gradient(to right, rgba(10,10,15,0.98) 0%, rgba(10,10,15,0.75) 60%, rgba(10,10,15,0.1) 100%)',
    heroUrl: `https://cdn.cloudflare.steamstatic.com/steam/apps/2379780/library_hero.jpg`,
  },
];

const getStars = (score) => {
  const out = score / 20;
  const full = Math.floor(out);
  const half = out % 1 >= 0.4 ? 1 : 0;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - half);
};

const HeroBanner = ({ games = [] }) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [trailerYt, setTrailerYt] = useState(null); // YouTube video ID when modal is open

  // Use real Steam games primarily, fallback to API games
  const heroData = HERO_GAMES;

  const next = useCallback(() => {
    setActiveIdx((p) => (p + 1) % heroData.length);
  }, [heroData.length]);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(next, 6000);
    return () => clearInterval(t);
  }, [paused, next]);

  const active = heroData[activeIdx];

  return (
    <>
    <div
      className="relative rounded-2xl overflow-hidden mb-6 select-none"
      style={{ height: 220 }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {heroData.map((g, i) => (
        <div
          key={g.id}
          className={`absolute inset-0 hero-slide ${i === activeIdx ? 'active' : ''}`}
          style={{ flexDirection: 'column' }}
        >
          {/* Background Image */}
          <img
            src={g.heroUrl}
            alt={g.name}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0" style={{ background: g.gradient }} />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-center px-8" style={{ paddingRight: '40%' }}>
            {/* Featured badge + tags */}
            <div className="flex items-center gap-2 mb-3">
              <span
                className="text-[10px] font-black uppercase px-2.5 py-1 rounded"
                style={{
                  background: '#d4f53c',
                  color: '#0a0a0f',
                  fontFamily: 'var(--font-display)',
                  letterSpacing: '0.08em',
                }}
              >
                FEATURED
              </span>
              {g.tags.map((t) => (
                <span
                  key={t}
                  className="text-[10px] font-medium px-2.5 py-1 rounded"
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: 'rgba(240,240,240,0.8)',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  {t}
                </span>
              ))}
            </div>

            {/* Title */}
            <h2
              className="font-black uppercase leading-none mb-1"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '2.8rem',
                color: '#fff',
                letterSpacing: '0.02em',
                textShadow: '0 2px 20px rgba(0,0,0,0.5)',
              }}
            >
              {g.name}
            </h2>
            <div
              className="font-bold uppercase mb-3"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1rem',
                color: '#d4f53c',
                letterSpacing: '0.15em',
              }}
            >
              {g.subtitle}
            </div>

            {/* Score + description row */}
            <div className="flex items-start gap-5 mb-4">
              <div className="flex items-end gap-2 flex-shrink-0">
                <span
                  className="font-black leading-none"
                  style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', color: '#fff' }}
                >
                  {g.score}
                </span>
                <div className="mb-1">
                  <div className="text-xs font-medium" style={{ color: 'rgba(240,240,240,0.5)', fontFamily: 'var(--font-body)' }}>/100</div>
                </div>
                <div className="mb-1">
                  <div
                    className="text-xs font-bold uppercase"
                    style={{ color: '#22c55e', fontFamily: 'var(--font-display)', letterSpacing: '0.05em' }}
                  >
                    {g.scoreLabel}
                  </div>
                  <div className="text-xs" style={{ color: '#fbbf24', fontFamily: 'var(--font-body)' }}>
                    {getStars(g.score)}
                  </div>
                  <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Based on {g.reviews}</div>
                </div>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(240,240,240,0.7)', fontFamily: 'var(--font-body)', maxWidth: 280 }}>
                {g.description}
              </p>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3">
              <Link
                to={`/game/${g.id}`}
                className="px-5 py-2.5 text-sm font-bold rounded-lg transition-all hover:opacity-90 hover:-translate-y-0.5"
                style={{
                  background: '#d4f53c',
                  color: '#0a0a0f',
                  fontFamily: 'var(--font-display)',
                  letterSpacing: '0.05em',
                }}
              >
                View Details
              </Link>
              <button
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg transition-all hover:bg-white/15"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#fff',
                  fontFamily: 'var(--font-body)',
                }}
                onClick={() => {
                  if (g.trailerYt) setTrailerYt(g.trailerYt);
                }}
              >
                <FaPlay style={{ fontSize: 9 }} />
                Watch Trailer
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Dots */}
      <div className="absolute bottom-4 right-6 flex items-center gap-2">
        {heroData.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveIdx(i)}
            className="transition-all rounded-full"
            style={{
              width: i === activeIdx ? 24 : 8,
              height: 8,
              background: i === activeIdx ? '#d4f53c' : 'rgba(255,255,255,0.25)',
              boxShadow: i === activeIdx ? '0 0 8px rgba(212,245,60,0.4)' : 'none',
            }}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>

    {/* ── YouTube Trailer Modal ── */}
    {trailerYt && (
      <div
        onClick={() => setTrailerYt(null)}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: 'rgba(0,0,0,0.88)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(8px)',
          animation: 'fadeIn 0.2s ease-out',
        }}
        onKeyDown={(e) => { if (e.key === 'Escape') setTrailerYt(null); }}
        tabIndex={-1}
      >
        {/* Close button */}
        <button
          onClick={() => setTrailerYt(null)}
          style={{
            position: 'absolute',
            top: 24,
            right: 32,
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: '#fff',
            fontSize: '1.2rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'sans-serif',
            lineHeight: 1,
          }}
          title="Close"
        >
          ✕
        </button>

        {/* Video container — stopPropagation so clicking the iframe doesn't close */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            width: 'min(900px, 92vw)',
            aspectRatio: '16/9',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 32px 80px rgba(0,0,0,0.8)',
          }}
        >
          <iframe
            src={`https://www.youtube.com/embed/${trailerYt}?autoplay=1&rel=0`}
            title="Game Trailer"
            allow="autoplay; fullscreen"
            allowFullScreen
            style={{ width: '100%', height: '100%', border: 'none' }}
          />
        </div>
      </div>
    )}
    </>
  );
};


export default HeroBanner;
