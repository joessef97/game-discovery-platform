import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaChevronRight, FaBookmark, FaLightbulb, FaGlobeAmericas, FaTrophy,
} from 'react-icons/fa';
import HeroBanner from '../components/HeroBanner';
import gameService from '../services/gameService';

/* ── Static Steam App IDs mapped to popular games ── */
const STEAM_GAME_MAP = [
  // Trending row (portrait cards)
  { steamId: 553850, name: 'Helldivers 2',    genres: ['Shooter'],      score: 87 },
  { steamId: 1086940, name: "Baldur's Gate 3", genres: ['RPG'],          score: 93 },
  { steamId: 3489700, name: 'Stellar Blade',   genres: ['Action'],       score: 86 },
  { steamId: 1174180, name: 'Red Dead 2',      genres: ['Adventure'],    score: 95 },
  { steamId: 1145350, name: 'Hades II',        genres: ['Rogue-like'],   score: 90 },
  { steamId: 2215430, name: 'Ghost of Tsushima',genres: ['Action'],      score: 93 },
];

const RECOMMENDED_STEAM = [
  { steamId: 292030,  name: 'The Witcher 3',   genres: ['Open World','RPG','Story Rich'],    score: 92 },
  { steamId: 367520,  name: 'Hollow Knight',   genres: ['2D','Metroidvania','Atmospheric'],  score: 90 },
  { steamId: 1091500, name: 'Cyberpunk 2077',  genres: ['Open World','RPG','Futuristic'],    score: 88 },
  { steamId: 524220,  name: 'Nier: Automata',  genres: ['RPG','Action','Sci-Fi'],            score: 89 },
];

const TOP_RATED_STEAM = [
  { steamId: 1245620, name: 'Elden Ring',       subtitle: 'Shadow of the Erdtree', score: 94, genres: '' },
  { steamId: 1086940, name: "Baldur's Gate 3",  subtitle: 'RPG · PC · PS5',        score: 93, genres: '' },
  { steamId: 1091500, name: 'Cyberpunk 2077',   subtitle: 'Phantom Liberty',        score: 92, genres: '' },
  { steamId: 2322010, name: 'God of War Ragnarok', subtitle: 'Action · PS5 · PC',   score: 90, genres: '' },
  { steamId: 367520,  name: 'Hollow Knight',    subtitle: 'Metroidvania · PC',      score: 89, genres: '' },
];

const UPCOMING_STEAM = [
  { steamId: 2721670, name: "Starfield: Shattered Space", date: 'Mar 30, 2025', tag: 'DLC',         tagColor: '#fbbf24' },
  { steamId: null,    name: 'Black Myth: Zhong Kui',      date: 'Aug 20, 2026', tag: 'Announced',   tagColor: '#fbbf24' },
  { steamId: 3159330, name: "Assassin's Creed Shadows",   date: 'Nov 15, 2026', tag: 'New Release', tagColor: '#22c55e' },
];

const GENRES = ['All', 'Action', 'RPG', 'Shooter', 'Indie', 'Strategy', 'Horror'];

const scoreColor  = (s) => s >= 80 ? '#22c55e' : s >= 60 ? '#fbbf24' : '#ef4444';
const scoreBg     = (s) => s >= 80 ? 'rgba(34,197,94,0.15)' : s >= 60 ? 'rgba(251,191,36,0.15)' : 'rgba(239,68,68,0.15)';
const scoreBorder = (s) => s >= 80 ? 'rgba(34,197,94,0.3)' : s >= 60 ? 'rgba(251,191,36,0.3)' : 'rgba(239,68,68,0.3)';

const steamCover = (id) => `https://cdn.cloudflare.steamstatic.com/steam/apps/${id}/library_600x900.jpg`;
const steamThumb = (id) => `https://cdn.cloudflare.steamstatic.com/steam/apps/${id}/library_600x900.jpg`;

const CARD_GRADIENTS = {
  553850: 'linear-gradient(160deg,#1a1a2e,#0f3460)',
  1086940: 'linear-gradient(160deg,#2d1b69,#11998e)',
  3489700: 'linear-gradient(160deg,#4a0080,#c2185b)',
  1174180: 'linear-gradient(160deg,#3d1a00,#c56000)',
  1145350: 'linear-gradient(160deg,#1a0533,#8b0000)',
  2215430: 'linear-gradient(160deg,#0d1b2a,#2d6a4f)',
  292030:  'linear-gradient(160deg,#1a0a00,#6b3a00)',
  367520:  'linear-gradient(160deg,#0a0015,#2d0045)',
  1091500: 'linear-gradient(160deg,#0a0a1a,#ff00ff1a)',
  524220:  'linear-gradient(160deg,#1a1a0a,#3d3d20)',
  1245620: 'linear-gradient(160deg,#1a1000,#6b4800)',
  2721670: 'linear-gradient(160deg,#000814,#003566)',
  2358720: 'linear-gradient(160deg,#1a0a00,#8b2500)',
  3159330: 'linear-gradient(160deg,#0a0a0f,#16213e)',
};

/* ── Section header ── */
const SectionHeader = ({ title, linkTo }) => (
  <div className="flex items-center justify-between mb-4">
    <h2
      className="font-black uppercase tracking-wide"
      style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: '#f0f0f0' }}
    >
      {title}
    </h2>
    {linkTo && (
      <Link
        to={linkTo}
        className="flex items-center gap-1 text-xs font-medium transition-colors hover:opacity-80"
        style={{ color: 'rgba(240,240,240,0.5)', fontFamily: 'var(--font-body)' }}
      >
        View All <FaChevronRight style={{ fontSize: 8 }} />
      </Link>
    )}
  </div>
);

/* ── Trending portrait card ── */
const TrendingCard = ({ steamId, name, genres, score }) => {
  const [imgErr, setImgErr] = useState(false);
  const grad = CARD_GRADIENTS[steamId] || 'linear-gradient(160deg,#111118,#16161f)';
  return (
    <Link
      to={`/game/${steamId}?steam=1&name=${encodeURIComponent(name)}`}
      className="block flex-shrink-0 rounded-xl overflow-hidden group transition-all hover:-translate-y-1"
      style={{
        width: 120,
        background: grad,
        border: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
      }}
    >
      <div className="relative" style={{ aspectRatio: '2/3' }}>
        {!imgErr && (
          <img
            src={steamCover(steamId)}
            alt={name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={() => setImgErr(true)}
          />
        )}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: 'linear-gradient(to top,rgba(10,10,15,0.85) 0%,transparent 60%)' }}
        />
        {score && (
          <div
            className="absolute top-2 left-2 w-9 h-7 flex items-center justify-center text-sm font-black rounded-md"
            style={{
              background: scoreBg(score), color: scoreColor(score),
              border: `1px solid ${scoreBorder(score)}`,
              fontFamily: 'var(--font-display)',
            }}
          >
            {score}
          </div>
        )}
      </div>
      <div className="p-2.5">
        <div
          className="font-bold text-[11px] uppercase leading-tight text-white truncate mb-1"
          style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.03em' }}
        >
          {name}
        </div>
        {genres[0] && (
          <span
            className="text-[9px] px-1.5 py-0.5 rounded"
            style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(240,240,240,0.5)', fontFamily: 'var(--font-body)' }}
          >
            {genres[0]}
          </span>
        )}
      </div>
    </Link>
  );
};

/* ── Recommended landscape card ── */
const RecommendedCard = ({ steamId, name, genres, score }) => {
  const [imgErr, setImgErr] = useState(false);
  const grad = CARD_GRADIENTS[steamId] || 'linear-gradient(160deg,#111118,#16161f)';
  return (
    <Link
      to={`/game/${steamId}?steam=1&name=${encodeURIComponent(name)}`}
      className="block relative rounded-xl overflow-hidden group transition-all hover:-translate-y-1"
      style={{
        background: grad,
        border: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
        aspectRatio: '16/9',
      }}
    >
      {!imgErr && (
        <img
          src={steamCover(steamId)}
          alt={name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={() => setImgErr(true)}
        />
      )}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to top,rgba(10,10,15,0.95) 0%,rgba(10,10,15,0.3) 65%,transparent 100%)' }}
      />
      {score && (
        <div
          className="absolute top-2 right-2 w-9 h-7 flex items-center justify-center text-sm font-black rounded-md"
          style={{
            background: scoreBg(score), color: scoreColor(score),
            border: `1px solid ${scoreBorder(score)}`,
            fontFamily: 'var(--font-display)',
          }}
        >
          {score}
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <div
          className="font-bold uppercase text-sm text-white leading-tight mb-1.5"
          style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.04em' }}
        >
          {name}
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {genres.map((g) => (
            <span
              key={g}
              className="text-[9px] px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(240,240,240,0.65)', fontFamily: 'var(--font-body)' }}
            >
              {g}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
};

/* ── Right: Top Rated row ── */
const RankedItem = ({ rank, steamId, name, subtitle, score }) => {
  const [imgErr, setImgErr] = useState(false);
  const grad = CARD_GRADIENTS[steamId] || 'linear-gradient(160deg,#111118,#16161f)';
  return (
    <Link
      to={`/game/${steamId}?steam=1&name=${encodeURIComponent(name)}`}
      className="flex items-center gap-3 py-2.5 px-1 rounded-lg transition-all hover:bg-white/4 group"
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <span
        className="text-sm font-black w-5 text-center flex-shrink-0"
        style={{ fontFamily: 'var(--font-display)', color: 'rgba(240,240,240,0.3)' }}
      >
        {rank}
      </span>
      <div
        className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0"
        style={{ background: grad }}
      >
        {steamId && !imgErr && (
          <img
            src={steamThumb(steamId)}
            alt={name}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={() => setImgErr(true)}
          />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div
          className="text-xs font-semibold text-white leading-tight truncate"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          {name}
        </div>
        <div className="text-[10px] truncate" style={{ color: 'rgba(240,240,240,0.4)', fontFamily: 'var(--font-body)' }}>
          {subtitle}
        </div>
      </div>
      {score && (
        <div
          className="flex-shrink-0 w-8 h-7 flex items-center justify-center text-sm font-black rounded-md"
          style={{
            background: scoreBg(score), color: scoreColor(score),
            border: `1px solid ${scoreBorder(score)}`,
            fontFamily: 'var(--font-display)',
          }}
        >
          {score}
        </div>
      )}
    </Link>
  );
};

/* ── Right: Upcoming row ── */
const UpcomingItem = ({ steamId, name, date, tag, tagColor }) => {
  const [imgErr, setImgErr] = useState(false);
  const grad = CARD_GRADIENTS[steamId] || 'linear-gradient(160deg,#111118,#16161f)';
  return (
    <Link
      to={`/game/${steamId ?? 0}?steam=1&name=${encodeURIComponent(name)}`}
      className="flex items-center gap-3 py-2.5 px-1 rounded-lg transition-all hover:bg-white/4"
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <div
        className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0"
        style={{ background: grad }}
      >
        {!imgErr && (
          <img
            src={steamThumb(steamId)}
            alt={name}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={() => setImgErr(true)}
          />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div
          className="text-xs font-semibold text-white leading-tight truncate"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          {name}
        </div>
        <div className="text-[10px]" style={{ color: 'rgba(240,240,240,0.4)', fontFamily: 'var(--font-body)' }}>
          {date}
        </div>
        <span
          className="text-[9px] font-bold px-1.5 py-0.5 rounded mt-0.5 inline-block"
          style={{
            background: `${tagColor}22`,
            color: tagColor,
            border: `1px solid ${tagColor}44`,
            fontFamily: 'var(--font-display)',
          }}
        >
          {tag}
        </span>
      </div>
    </Link>
  );
};

/* ══════════════════════════════════════
   HOME PAGE
══════════════════════════════════════ */
const Home = () => {
  const [activeGenre, setActiveGenre] = useState('All');
  const [apiGames, setApiGames] = useState([]);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSaved, setNewsletterSaved] = useState(false);

  useEffect(() => {
    // Load API games in background for dynamic content
    const load = async () => {
      try {
        const data = await gameService.getTrendingGames(1);
        setApiGames(data.results || []);
      } catch {}
    };
    load();
  }, []);

  const filteredTrending = activeGenre === 'All'
    ? STEAM_GAME_MAP
    : STEAM_GAME_MAP.filter((game) => game.genres.includes(activeGenre));

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterSaved(true);
    setNewsletterEmail('');
  };

  return (
    <div
      className="flex gap-0 min-h-screen"
      style={{ paddingTop: 'var(--topbar-height)', paddingLeft: 'var(--sidebar-width)' }}
    >
      {/* ══ MAIN CONTENT ══ */}
      <div className="flex-1 min-w-0 px-5 py-5" style={{ paddingRight: 'calc(var(--right-sidebar-width) + 20px)' }}>

        {/* ── Hero Banner ── */}
        <HeroBanner games={apiGames} />

        {/* ── Trending Games ── */}
        <section className="mb-8">
          <SectionHeader title="Trending Games" linkTo="/" />

          {/* Genre filter tabs */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {GENRES.map((g) => (
              <button
                key={g}
                onClick={() => setActiveGenre(g)}
                className="px-3 py-1.5 text-xs font-medium rounded-full transition-all"
                style={activeGenre === g
                  ? { background: '#d4f53c', color: '#0a0a0f', fontFamily: 'var(--font-body)', border: '1px solid #d4f53c' }
                  : {
                      background: 'rgba(255,255,255,0.04)',
                      color: 'rgba(240,240,240,0.6)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      fontFamily: 'var(--font-body)',
                    }
                }
              >
                {g}
              </button>
            ))}
          </div>

          {/* Scrollable row of portrait cards */}
          <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin' }}>
            {filteredTrending.map((g) => (
              <TrendingCard key={g.steamId} {...g} />
            ))}
          </div>
        </section>

        {/* ── Recommended For You ── */}
        <section className="mb-8">
          <SectionHeader title="Recommended For You" linkTo="/" />
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            {RECOMMENDED_STEAM.map((g) => (
              <RecommendedCard key={g.steamId} {...g} />
            ))}
          </div>
        </section>

        {/* ── Feature Bar ── */}
        <div
          className="grid grid-cols-4 gap-4 p-4 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
        >
          {[
            { icon: FaBookmark, title: 'Curated Collections', desc: 'Handpicked game lists by our experts.' },
            { icon: FaLightbulb, title: 'Personalized Picks',  desc: 'AI-powered recommendations for you.' },
            { icon: FaGlobeAmericas, title: 'Active Community', desc: 'Connect with gamers worldwide.' },
            { icon: FaTrophy,    title: 'Achievements',        desc: 'Track, earn and showcase your progress.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-3">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-sm"
                style={{ background: 'rgba(212,245,60,0.1)', color: '#d4f53c' }}
              >
                <Icon />
              </div>
              <div>
                <div
                  className="text-xs font-semibold text-white mb-0.5"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  {title}
                </div>
                <div className="text-[10px]" style={{ color: 'rgba(240,240,240,0.4)', fontFamily: 'var(--font-body)' }}>
                  {desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══ RIGHT SIDEBAR ══ */}
      <aside
        className="fixed right-0 top-0 bottom-0 overflow-y-auto px-4 py-5"
        style={{
          width: 'var(--right-sidebar-width)',
          paddingTop: 'calc(var(--topbar-height) + 20px)',
          borderLeft: '1px solid var(--border)',
          background: 'var(--bg-root)',
        }}
      >

        {/* ── Top Rated ── */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-3">
            <h3
              className="font-black uppercase leading-tight"
              style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: '#f0f0f0', letterSpacing: '0.05em' }}
            >
              TOP RATED THIS<br />WEEK
            </h3>
            <Link
              to="/charts"
              className="text-[10px] font-medium mt-0.5"
              style={{ color: 'rgba(240,240,240,0.4)', fontFamily: 'var(--font-body)' }}
            >
              View All
            </Link>
          </div>

          <div className="flex flex-col">
            {TOP_RATED_STEAM.map((g, i) => (
              <RankedItem key={g.steamId} rank={i + 1} {...g} />
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="mb-5" style={{ borderTop: '1px solid var(--border)' }} />

        {/* ── Upcoming Releases ── */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-3">
            <h3
              className="font-black uppercase leading-tight"
              style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: '#f0f0f0', letterSpacing: '0.05em' }}
            >
              UPCOMING<br />RELEASES
            </h3>
            <Link
              to="/upcoming"
              className="text-[10px] font-medium mt-0.5"
              style={{ color: 'rgba(240,240,240,0.4)', fontFamily: 'var(--font-body)' }}
            >
              View All
            </Link>
          </div>

          <div className="flex flex-col">
            {UPCOMING_STEAM.map((g) => (
              <UpcomingItem key={g.steamId} {...g} />
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="mb-5" style={{ borderTop: '1px solid var(--border)' }} />

        {/* ── Newsletter ── */}
        <div
          className="p-4 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <h3
            className="font-black uppercase mb-2"
            style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: '#f0f0f0', letterSpacing: '0.05em' }}
          >
            STAY IN THE LOOP
          </h3>
          <p className="text-[11px] mb-3" style={{ color: 'rgba(240,240,240,0.45)', fontFamily: 'var(--font-body)' }}>
            Get the latest game news, updates and exclusive deals straight to your inbox.
          </p>
          <form className="flex gap-2" onSubmit={handleSubscribe}>
            <input
              type="email"
              placeholder="Enter email..."
              value={newsletterEmail}
              onChange={(e) => {
                setNewsletterEmail(e.target.value);
                setNewsletterSaved(false);
              }}
              className="flex-1 px-3 py-2 text-xs rounded-lg outline-none"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#f0f0f0',
                fontFamily: 'var(--font-body)',
              }}
            />
            <button
              type="submit"
              className="px-3 py-2 text-xs font-bold rounded-lg transition-all hover:opacity-90"
              style={{
                background: '#d4f53c',
                color: '#0a0a0f',
                fontFamily: 'var(--font-display)',
                letterSpacing: '0.05em',
                flexShrink: 0,
              }}
            >
              {newsletterSaved ? 'Saved' : 'Subscribe'}
            </button>
          </form>
        </div>
      </aside>
    </div>
  );
};

export default Home;
