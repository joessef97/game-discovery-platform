import React from 'react';
import { Link } from 'react-router-dom';
import { FaNewspaper, FaArrowRight } from 'react-icons/fa';

const STORIES = [
  {
    title: 'Summer showcases put indies and co-op games in the spotlight',
    tag: 'Industry',
    date: 'Today',
    summary: 'A fresh wave of trailers, demos, and launch windows is giving players more reasons to keep their wishlist tidy.',
    query: 'Indie',
  },
  {
    title: 'RPG fans get a busy release calendar',
    tag: 'RPG',
    date: 'This week',
    summary: 'Big expansions and smaller character-driven adventures are crowding the charts across PC and console.',
    query: 'RPG',
  },
  {
    title: 'Cross-play keeps becoming the default expectation',
    tag: 'Platforms',
    date: 'Feature',
    summary: 'More upcoming multiplayer releases are launching with shared progression and broader platform support.',
    query: 'Multiplayer',
  },
];

const S = {
  page: { paddingTop: 'calc(var(--topbar-height) + var(--sp-6))', paddingLeft: 'calc(var(--sidebar-width) + var(--sp-6))', paddingRight: 'var(--sp-6)', paddingBottom: 'var(--sp-10)', minHeight: '100vh', animation: 'fadeIn 0.4s ease-out' },
  header: { display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', marginBottom: 'var(--sp-6)' },
  icon: { width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--r-xl)', background: 'var(--accent-dim)', color: 'var(--accent)' },
  title: { fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-primary)' },
  sub: { color: 'var(--text-muted)', fontSize: 'var(--text-sm)' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--sp-4)' },
  card: { padding: 'var(--sp-5)', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', minHeight: 220, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' },
  tag: { color: 'var(--accent)', fontSize: 'var(--text-xs)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-display)' },
  cardTitle: { color: 'var(--text-primary)', fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 800, lineHeight: 1.1, textTransform: 'uppercase', marginTop: 'var(--sp-2)' },
  summary: { color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)', lineHeight: 1.6, marginTop: 'var(--sp-3)' },
  link: { display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--accent)', fontWeight: 700, fontSize: 'var(--text-sm)' },
};

const News = () => (
  <div style={S.page}>
    <div style={S.header}>
      <div style={S.icon}><FaNewspaper /></div>
      <div>
        <h1 style={S.title}>News</h1>
        <p style={S.sub}>Game updates, release chatter, and discovery picks</p>
      </div>
    </div>

    <div style={S.grid}>
      {STORIES.map((story, i) => (
        <article key={story.title} style={{ ...S.card, animation: `fadeInUp 0.35s ease-out ${i * 0.05}s backwards` }}>
          <div>
            <div style={S.tag}>{story.tag} · {story.date}</div>
            <h2 style={S.cardTitle}>{story.title}</h2>
            <p style={S.summary}>{story.summary}</p>
          </div>
          <Link to={`/discover?q=${encodeURIComponent(story.query)}`} style={S.link}>
            Explore related games <FaArrowRight size={11} />
          </Link>
        </article>
      ))}
    </div>
  </div>
);

export default News;
