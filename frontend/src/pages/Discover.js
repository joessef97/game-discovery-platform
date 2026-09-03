import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FaSearch, FaTimes, FaGamepad, FaStar, FaFilter } from 'react-icons/fa';
import gameService from '../services/gameService';

const GENRES = ['All', 'Action', 'RPG', 'Shooter', 'Strategy', 'Indie', 'Adventure', 'Sports', 'Horror', 'Racing', 'Puzzle', 'Simulation'];

const scoreColor  = (s) => s >= 80 ? '#22c55e' : s >= 60 ? '#fbbf24' : '#ef4444';
const scoreBg     = (s) => s >= 80 ? 'rgba(34,197,94,0.15)' : s >= 60 ? 'rgba(251,191,36,0.15)' : 'rgba(239,68,68,0.15)';
const scoreBorder = (s) => s >= 80 ? 'rgba(34,197,94,0.3)'  : s >= 60 ? 'rgba(251,191,36,0.3)'  : 'rgba(239,68,68,0.3)';

/* ── Result card ── */
const ResultCard = ({ game }) => {
  const [imgErr, setImgErr] = useState(false);
  const score = game.rating ? Math.round(game.rating * 20) : null;
  // Use IGDB's cover image directly — it's already matched to the correct game
  const img = game.background_image;

  return (
    <Link
      to={`/game/${game.id}`}
      className="block rounded-xl overflow-hidden group transition-all hover:-translate-y-1"
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      <div className="relative" style={{ aspectRatio: '2/3' }}>
        {!imgErr && img ? (
          <img
            src={img}
            alt={game.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={() => setImgErr(true)}
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: 'linear-gradient(160deg,#1a1a2e,#16213e)' }}
          >
            <FaGamepad style={{ fontSize: '2rem', color: 'rgba(240,240,240,0.1)' }} />
          </div>
        )}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: 'linear-gradient(to top,rgba(10,10,15,0.85) 0%,transparent 60%)' }}
        />
        {score && (
          <div
            className="absolute top-2 left-2 flex items-center justify-center w-9 h-7 text-sm font-black rounded-md"
            style={{
              background: scoreBg(score),
              color: scoreColor(score),
              border: `1px solid ${scoreBorder(score)}`,
              fontFamily: 'var(--font-display)',
            }}
          >
            {score}
          </div>
        )}
      </div>
      <div className="p-3">
        <div
          className="font-bold text-xs uppercase text-white leading-tight mb-1.5 truncate"
          style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.03em' }}
        >
          {game.name}
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {game.genres?.slice(0, 2).map((g) => (
            <span
              key={g.name}
              className="text-[9px] px-1.5 py-0.5 rounded"
              style={{
                background: 'rgba(255,255,255,0.06)',
                color: 'rgba(240,240,240,0.5)',
                fontFamily: 'var(--font-body)',
              }}
            >
              {g.name}
            </span>
          ))}
          {game.rating && (
            <span
              className="flex items-center gap-1 text-[9px] ml-auto"
              style={{ color: '#fbbf24' }}
            >
              <FaStar style={{ fontSize: 8 }} />
              {game.rating.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

/* ── Empty state ── */
const EmptyState = ({ query }) => (
  <div
    className="flex flex-col items-center justify-center py-24 rounded-2xl"
    style={{ border: '1px dashed var(--border)', background: 'rgba(255,255,255,0.01)' }}
  >
    <FaGamepad style={{ fontSize: '3rem', color: 'var(--text-muted)', opacity: 0.2, marginBottom: '24px' }} />
    <div
      className="text-lg font-black uppercase mb-2"
      style={{ fontFamily: 'var(--font-display)', color: 'var(--text-secondary)' }}
    >
      {query ? 'No results found' : 'Start searching'}
    </div>
    <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', textAlign: 'center', maxWidth: 320 }}>
      {query
        ? `We couldn't find any games matching "${query}". Try a different search term.`
        : 'Type a game name, genre, or keyword in the search bar above.'}
    </p>
  </div>
);

/* ══════════════════════════════════════
   DISCOVER PAGE
══════════════════════════════════════ */
const Discover = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery]         = useState(initialQuery);
  const [inputVal, setInputVal]   = useState(initialQuery);
  const [activeGenre, setActiveGenre] = useState('All');
  const [results, setResults]     = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [searched, setSearched]   = useState(!!initialQuery);

  const doSearch = useCallback(async (q) => {
    if (!q.trim()) { setResults([]); setSearched(false); return; }
    setLoading(true);
    setError('');
    setSearched(true);
    try {
      const data = await gameService.searchGames(q);
      setResults(data.results || []);
    } catch {
      setError('Search failed. Please check your connection and try again.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Run search whenever URL param changes
  useEffect(() => {
    const q = searchParams.get('q') || '';
    setQuery(q);
    setInputVal(q);
    if (q) doSearch(q);
  }, [searchParams, doSearch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const q = inputVal.trim();
    if (!q) return;
    setSearchParams({ q });
  };

  const handleClear = () => {
    setInputVal('');
    setSearchParams({});
    setResults([]);
    setSearched(false);
  };

  const filtered = activeGenre === 'All'
    ? results
    : results.filter(g => g.genres?.some(genre => genre.name === activeGenre));

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
        <h1
          className="font-black uppercase mb-1"
          style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--text-primary)' }}
        >
          Discover
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
          Search millions of games from the IGDB database
        </p>
      </div>

      {/* ── Search bar ── */}
      <form onSubmit={handleSubmit} style={{ marginBottom: 'var(--sp-5)', maxWidth: 560 }}>
        <div className="relative flex gap-2">
          <div className="relative flex-1">
            <FaSearch
              className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'var(--text-muted)', fontSize: 13 }}
            />
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Search for any game..."
              id="discover-search"
              style={{
                width: '100%',
                padding: '12px 44px 12px 44px',
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-base)',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--r-xl)',
                color: 'var(--text-primary)',
                outline: 'none',
                transition: 'border-color 150ms ease, box-shadow 150ms ease',
              }}
              onFocus={(e) => { e.target.style.borderColor = '#d4f53c'; e.target.style.boxShadow = '0 0 0 3px rgba(212,245,60,0.08)'; }}
              onBlur={(e)  => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
            />
            {inputVal && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full transition-all hover:bg-white/10"
                style={{ color: 'var(--text-muted)' }}
              >
                <FaTimes style={{ fontSize: 11 }} />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="px-6 py-3 font-bold rounded-xl transition-all hover:opacity-90"
            style={{
              background: '#d4f53c',
              color: '#0a0a0f',
              fontFamily: 'var(--font-display)',
              letterSpacing: '0.05em',
              fontSize: 'var(--text-sm)',
              flexShrink: 0,
            }}
          >
            Search
          </button>
        </div>
      </form>

      {/* ── Genre filter chips ── */}
      {results.length > 0 && (
        <div
          className="flex gap-2 flex-wrap items-center"
          style={{ marginBottom: 'var(--sp-5)' }}
        >
          <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <FaFilter style={{ fontSize: 10 }} /> Filter
          </span>
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
      )}

      {/* ── Results count ── */}
      {searched && !loading && results.length > 0 && (
        <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', marginBottom: 'var(--sp-4)' }}>
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          {query && <> for <span style={{ color: 'var(--text-secondary)' }}>"{query}"</span></>}
          {activeGenre !== 'All' && <> in <span style={{ color: 'var(--accent)' }}>{activeGenre}</span></>}
        </div>
      )}

      {/* ── Error ── */}
      {error && <div className="error" style={{ maxWidth: 560, marginBottom: 'var(--sp-5)' }}>{error}</div>}

      {/* ── Loading ── */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="spinner" />
          <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Searching...</span>
        </div>
      )}

      {/* ── Results grid ── */}
      {!loading && searched && filtered.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: 'var(--sp-4)',
          }}
        >
          {filtered.map((game, i) => (
            <div key={game.id} style={{ animation: `fadeInUp 0.35s ease-out ${i * 0.04}s backwards` }}>
              <ResultCard game={game} />
            </div>
          ))}
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && (searched ? filtered.length === 0 : true) && !error && (
        <EmptyState query={query} />
      )}
    </div>
  );
};

export default Discover;
