import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaGamepad, FaRedo } from 'react-icons/fa';
import gameService from '../services/gameService';

const CategorySection = ({ title, items, type }) => (
  <section style={{ marginBottom: 'var(--sp-8)' }} aria-label={title}>
    <h2 className="font-bold uppercase" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)', marginBottom: 'var(--sp-4)' }}>{title}</h2>
    {!items.length ? <p style={{ color: 'var(--text-muted)' }}>No {title.toLowerCase()} available.</p> : (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 'var(--sp-3)' }}>
        {items.map((item) => (
          <Link key={item.id} to={`/discover?${type}Id=${item.id}`} className="rounded-xl transition-all hover:-translate-y-1"
            style={{ padding: '20px', minHeight: 92, display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)', textDecoration: 'none' }}>
            <FaGamepad aria-hidden="true" style={{ color: 'var(--accent)' }} />
            <span className="font-bold">{item.name}</span>
          </Link>
        ))}
      </div>
    )}
  </section>
);

const Browse = () => {
  const [genres, setGenres] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [liveGenres, livePlatforms] = await Promise.all([gameService.getGenres(), gameService.getPlatforms()]);
      setGenres(liveGenres);
      setPlatforms(livePlatforms);
    } catch {
      setError('Could not load categories from IGDB.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadCategories(); }, [loadCategories]);

  return (
    <div style={{ paddingTop: 'calc(var(--topbar-height) + var(--sp-6))', paddingLeft: 'calc(var(--sidebar-width) + var(--sp-6))', paddingRight: 'var(--sp-6)', paddingBottom: 'var(--sp-10)', minHeight: '100vh' }}>
      <header style={{ marginBottom: 'var(--sp-8)' }}>
        <h1 className="font-black uppercase mb-1" style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--text-primary)' }}>Browse games</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Explore live genres and platforms from IGDB.</p>
      </header>
      {loading && <p role="status" style={{ color: 'var(--text-muted)' }}>Loading categories…</p>}
      {error && <div role="alert" className="error">{error} <button type="button" onClick={loadCategories}><FaRedo aria-hidden="true" /> Retry</button></div>}
      {!loading && !error && <>
        <CategorySection title="Genres" items={genres} type="genre" />
        <CategorySection title="Platforms" items={platforms} type="platform" />
      </>}
    </div>
  );
};

export default Browse;
