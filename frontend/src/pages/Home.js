import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaGamepad, FaRedo, FaStar } from 'react-icons/fa';
import gameService from '../services/gameService';

const GameCard = ({ game }) => (
  <Link to={`/game/${game.id}`} className="block rounded-xl overflow-hidden transition-transform hover:-translate-y-1" style={{ minWidth: 150, maxWidth: 190, background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)', textDecoration: 'none' }}>
    {game.background_image ? <img src={game.background_image} alt="" loading="lazy" style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover' }} /> : <div aria-hidden="true" style={{ aspectRatio: '2/3', display: 'grid', placeItems: 'center', background: 'linear-gradient(160deg,#1a1a2e,#16213e)', color: 'var(--text-muted)' }}><FaGamepad size={28} /></div>}
    <div style={{ padding: 12 }}>
      <strong style={{ display: 'block', fontSize: 12, textTransform: 'uppercase', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{game.name}</strong>
      <div style={{ display: 'flex', gap: 8, marginTop: 8, color: 'var(--text-muted)', fontSize: 11 }}>
        {game.rating != null && <span><FaStar style={{ color: '#fbbf24' }} /> {Number(game.rating).toFixed(1)}</span>}
        {game.released && <span>{game.released}</span>}
      </div>
      {!!game.genres?.length && <div style={{ color: 'var(--text-muted)', fontSize: 10, marginTop: 6 }}>{game.genres.slice(0, 2).map((genre) => genre.name).join(' · ')}</div>}
    </div>
  </Link>
);

const GameSection = ({ title, load, href, emptyMessage }) => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true); setError(false);
    load().then((response) => { if (active) setGames(response.results || []); })
      .catch(() => { if (active) { setGames([]); setError(true); } })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [load, attempt]);

  return (
    <section style={{ marginBottom: 32 }} aria-label={title}>
      <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
        <h2 className="font-black uppercase" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)', fontSize: 20 }}>{title}</h2>
        <Link to={href} style={{ color: 'var(--text-muted)', fontSize: 12 }}>View all →</Link>
      </div>
      {loading && <p role="status" style={{ color: 'var(--text-muted)' }}>Loading {title.toLowerCase()}…</p>}
      {error && <div role="alert" style={{ color: 'var(--text-secondary)' }}>Could not load {title.toLowerCase()}. <button type="button" aria-label={`Retry ${title}`} onClick={() => setAttempt((value) => value + 1)}><FaRedo /> Retry</button></div>}
      {!loading && !error && games.length === 0 && <p style={{ color: 'var(--text-muted)' }}>{emptyMessage}</p>}
      {!loading && !error && games.length > 0 && <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin' }}>{games.map((game) => <GameCard key={game.id} game={game} />)}</div>}
    </section>
  );
};

const Home = () => {
  const [genres, setGenres] = useState([]);
  const [genreError, setGenreError] = useState(false);
  const loadTrending = useCallback(() => gameService.getTrendingGames(1), []);
  const loadTopRated = useCallback(() => gameService.getTopRatedGames(1, 12), []);
  const loadUpcoming = useCallback(() => gameService.getUpcomingGames(1, 12), []);

  const loadGenres = useCallback(async () => {
    setGenreError(false);
    try { setGenres((await gameService.getGenres()).slice(0, 12)); }
    catch { setGenres([]); setGenreError(true); }
  }, []);
  useEffect(() => { loadGenres(); }, [loadGenres]);

  return (
    <div style={{ paddingTop: 'calc(var(--topbar-height) + var(--sp-6))', paddingLeft: 'calc(var(--sidebar-width) + var(--sp-6))', paddingRight: 'var(--sp-6)', paddingBottom: 'var(--sp-10)', minHeight: '100vh' }}>
      <header style={{ marginBottom: 30 }}>
        <p style={{ color: 'var(--accent)', fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase' }}>GAME DISCOVERY</p>
        <h1 className="font-black uppercase" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)' }}>Find your next game</h1>
        <p style={{ color: 'var(--text-muted)' }}>Explore the live IGDB catalog by popularity, rating, release date, genre, or platform.</p>
        <div className="flex gap-3" style={{ marginTop: 16 }}><Link to="/discover" className="px-5 py-3 rounded-lg font-bold" style={{ background: 'var(--accent)', color: 'var(--bg-root)' }}>Search games</Link><Link to="/browse" className="px-5 py-3 rounded-lg" style={{ border: '1px solid var(--border)', color: 'var(--text-primary)' }}>Browse catalog</Link></div>
      </header>

      <GameSection title="Trending games" load={loadTrending} href="/" emptyMessage="No trending games are available right now." />
      <GameSection title="Top rated" load={loadTopRated} href="/charts" emptyMessage="No top-rated games are available right now." />
      <GameSection title="Upcoming releases" load={loadUpcoming} href="/upcoming" emptyMessage="No upcoming releases are available right now." />

      <section aria-label="Browse by genre">
        <div className="flex items-center justify-between" style={{ marginBottom: 14 }}><h2 className="font-black uppercase" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)', fontSize: 20 }}>Browse by genre</h2><Link to="/browse" style={{ color: 'var(--text-muted)', fontSize: 12 }}>All genres →</Link></div>
        {genreError && <div role="alert">Could not load genres. <button type="button" onClick={loadGenres}>Retry</button></div>}
        {!genreError && <div className="flex gap-2 flex-wrap">{genres.map((genre) => <Link key={genre.id} to={`/discover?genreId=${genre.id}`} className="px-3 py-2 rounded-full" style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border)', fontSize: 12 }}>{genre.name}</Link>)}</div>}
      </section>
    </div>
  );
};

export default Home;
