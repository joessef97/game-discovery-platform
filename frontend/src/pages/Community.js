import React from 'react';
import { Link } from 'react-router-dom';
import { FaUsers, FaComments, FaTrophy, FaHeart } from 'react-icons/fa';

const POSTS = [
  { icon: FaComments, title: 'What are you playing this week?', text: 'Jump into discovery threads and compare picks with other players.', to: '/discover?q=Co-op' },
  { icon: FaTrophy, title: 'Top chart debates', text: 'Browse the highest-rated list and find your next argument starter.', to: '/charts' },
  { icon: FaHeart, title: 'Build your collection', text: 'Save favorites now so your library becomes useful as you explore.', to: '/favorites' },
];

const S = {
  page: { paddingTop: 'calc(var(--topbar-height) + var(--sp-6))', paddingLeft: 'calc(var(--sidebar-width) + var(--sp-6))', paddingRight: 'var(--sp-6)', paddingBottom: 'var(--sp-10)', minHeight: '100vh', animation: 'fadeIn 0.4s ease-out' },
  header: { display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', marginBottom: 'var(--sp-6)' },
  icon: { width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--r-xl)', background: 'rgba(45,115,245,0.12)', color: '#6ea1ff' },
  title: { fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-primary)' },
  sub: { color: 'var(--text-muted)', fontSize: 'var(--text-sm)' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--sp-4)' },
  card: { padding: 'var(--sp-5)', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', transition: 'all 200ms ease' },
  cardIcon: { width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--r-lg)', background: 'rgba(255,255,255,0.05)', color: 'var(--accent)', marginBottom: 'var(--sp-4)' },
  cardTitle: { fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-primary)', marginBottom: 'var(--sp-2)' },
  text: { color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)', lineHeight: 1.6, marginBottom: 'var(--sp-5)' },
};

const Community = () => (
  <div style={S.page}>
    <div style={S.header}>
      <div style={S.icon}><FaUsers /></div>
      <div>
        <h1 style={S.title}>Community</h1>
        <p style={S.sub}>Player activity, collections, and shared discovery</p>
      </div>
    </div>

    <div style={S.grid}>
      {POSTS.map(({ icon: Icon, title, text, to }, i) => (
        <div key={title} style={{ ...S.card, animation: `fadeInUp 0.35s ease-out ${i * 0.05}s backwards` }}>
          <div style={S.cardIcon}><Icon /></div>
          <h2 style={S.cardTitle}>{title}</h2>
          <p style={S.text}>{text}</p>
          <Link to={to} className="btn btn-secondary">Open</Link>
        </div>
      ))}
    </div>
  </div>
);

export default Community;
