import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FaSearch, FaTimes, FaGamepad, FaStar } from 'react-icons/fa';
import gameService from '../services/gameService';

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
  const paramsKey = searchParams.toString();
  const currentParams = new URLSearchParams(paramsKey);
  const query = currentParams.get('q') || '';
  const genreId = currentParams.get('genreId');
  const platformId = currentParams.get('platformId');
  const filters = {};
  if (genreId) filters.genreId = genreId;
  if (platformId) filters.platformId = platformId;

  const [inputVal, setInputVal] = useState(query);
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(Boolean(query || genreId || platformId));

  const loadPage = useCallback(async (pageNumber, append = false) => {
    const params = new URLSearchParams(paramsKey);
    const searchQuery = params.get('q') || '';
    const selectedGenre = params.get('genreId');
    const selectedPlatform = params.get('platformId');
    if (!searchQuery && !selectedGenre && !selectedPlatform) {
      setResults([]); setHasMore(false); setSearched(false); setLoading(false); return;
    }
    if (append) setLoadingMore(true); else setLoading(true);
    setError('');
    setSearched(true);
    try {
      let data;
      if (searchQuery) {
        const searchFilters = {};
        if (selectedGenre) searchFilters.genreId = selectedGenre;
        if (selectedPlatform) searchFilters.platformId = selectedPlatform;
        data = await gameService.searchGames(searchQuery, pageNumber, 20, searchFilters);
      } else if (selectedGenre) {
        data = await gameService.getGamesByGenre(selectedGenre, pageNumber, 20);
      } else {
        data = await gameService.getGamesByPlatform(selectedPlatform, pageNumber, 20);
      }
      const incoming = data.results || [];
      setResults((previous) => {
        const combined = append ? [...previous, ...incoming] : incoming;
        return Array.from(new Map(combined.map((game) => [String(game.id), game])).values());
      });
      setPage(pageNumber);
      setHasMore(Boolean(data.next));
    } catch {
      setError('Could not load games. Check your connection and try again.');
      if (!append) setResults([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [paramsKey]);

  useEffect(() => {
    setInputVal(query);
    loadPage(1, false);
  }, [query, paramsKey, loadPage]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextQuery = inputVal.trim();
    if (!nextQuery) return;
    const next = new URLSearchParams(paramsKey);
    next.set('q', nextQuery);
    setSearchParams(next);
  };

  const handleClear = () => {
    setInputVal('');
    const next = new URLSearchParams(paramsKey);
    next.delete('q');
    setSearchParams(next);
  };

  return (
    <div style={{ paddingTop: 'calc(var(--topbar-height) + var(--sp-6))', paddingLeft: 'calc(var(--sidebar-width) + var(--sp-6))', paddingRight: 'var(--sp-6)', paddingBottom: 'var(--sp-10)', minHeight: '100vh' }}>
      <div style={{ marginBottom: 'var(--sp-6)' }}>
        <h1 className="font-black uppercase mb-1" style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--text-primary)' }}>Discover</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Search and browse live games from IGDB.</p>
      </div>
      <form onSubmit={handleSubmit} style={{ marginBottom: 'var(--sp-5)', maxWidth: 560 }}>
        <div className="relative flex gap-2">
          <div className="relative flex-1">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)', fontSize: 13 }} />
            <input id="discover-search" type="text" value={inputVal} onChange={(event) => setInputVal(event.target.value)} placeholder="Search for any game..."
              style={{ width: '100%', padding: '12px 44px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', color: 'var(--text-primary)' }} />
            {inputVal && <button type="button" aria-label="Clear search" onClick={handleClear} className="absolute right-3 top-1/2 -translate-y-1/2"><FaTimes /></button>}
          </div>
          <button type="submit" className="px-6 py-3 font-bold rounded-xl" style={{ background: '#d4f53c', color: '#0a0a0f' }}>Search</button>
        </div>
      </form>
      {(genreId || platformId) && <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--sp-4)' }}>Filtered by {genreId ? `IGDB genre ${genreId}` : `IGDB platform ${platformId}`}</p>}
      {loading && <div role="status" className="flex items-center justify-center py-24 gap-4"><div className="spinner" /><span>Loading games…</span></div>}
      {error && <div role="alert" className="error">{error} <button type="button" onClick={() => loadPage(page, page > 1)}>Retry</button></div>}
      {!loading && searched && results.length > 0 && <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--sp-4)' }}>{results.length} games{query ? ` for “${query}”` : ''}</p>}
      {!loading && searched && results.length > 0 && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 'var(--sp-4)' }}>{results.map((game, index) => <div key={game.id} style={{ animation: `fadeInUp 0.35s ease-out ${index * 0.04}s backwards` }}><ResultCard game={game} /></div>)}</div>}
      {!loading && searched && !error && results.length === 0 && <EmptyState query={query} />}
      {!loading && hasMore && <div className="flex justify-center" style={{ marginTop: 'var(--sp-6)' }}><button type="button" onClick={() => loadPage(page + 1, true)} disabled={loadingMore} className="px-6 py-3 rounded-xl font-bold" style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>{loadingMore ? 'Loading…' : 'Load more'}</button></div>}
      {!searched && !query && <EmptyState query="" />}
    </div>
  );
};
export default Discover;
