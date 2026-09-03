import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaBookmark, FaTrash, FaGamepad } from 'react-icons/fa';
import wishlistService from '../services/wishlistService';

const S = {
  page: { paddingTop: 'calc(var(--topbar-height) + var(--sp-6))', paddingLeft: 'calc(var(--sidebar-width) + var(--sp-6))', paddingRight: 'var(--sp-6)', paddingBottom: 'var(--sp-10)', minHeight: '100vh', animation: 'fadeIn 0.4s ease-out' },
  header: { marginBottom: 'var(--sp-8)' },
  title: { fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', fontWeight: 900, letterSpacing: '0.02em', textTransform: 'uppercase', color: 'var(--text-primary)', marginBottom: 'var(--sp-1)', display: 'flex', alignItems: 'center', gap: 10 },
  sub: { color: 'var(--text-muted)', fontSize: 'var(--text-sm)' },
  empty: { textAlign: 'center', padding: 'var(--sp-16) var(--sp-6)', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', maxWidth: '460px', margin: '0 auto' },
  emptyIcon: { fontSize: '3rem', color: 'var(--color-heart)', opacity: 0.3, marginBottom: 'var(--sp-6)' },
  emptyTitle: { fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: 'var(--sp-2)' },
  emptyText: { color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--sp-6)' },
  card: { position: 'relative', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', overflow: 'hidden', transition: 'all 300ms ease' },
  cardImg: { width: '100%', aspectRatio: '3/4', objectFit: 'cover', display: 'block', transition: 'transform 0.6s ease' },
  cardInfo: { padding: 'var(--sp-3)' },
  cardName: { fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '3px', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  cardDate: { fontSize: '10px', color: 'var(--text-muted)' },
  delBtn: { position: 'absolute', top: '8px', right: '8px', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(10,10,15,0.6)', backdropFilter: 'blur(8px)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--r-md)', color: 'var(--color-danger)', cursor: 'pointer', fontSize: '11px', transition: 'all 200ms ease', zIndex: 10, opacity: 0 },
};

const Wishlist = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { loadWishlist(); }, []);

  const loadWishlist = async () => {
    setLoading(true);
    try { setItems(await wishlistService.getWishlist()); }
    catch (e) { setError('Failed to load wishlist.'); }
    finally { setLoading(false); }
  };

  const handleRemove = async (gameId) => {
    try {
      await wishlistService.removeFromWishlist(gameId);
      setItems(list => list.filter(x => x.gameId !== gameId));
    } catch (e) { setError('Failed to remove.'); }
  };

  if (loading) return <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'50vh',gap:'var(--sp-4)'}}><div className="spinner"></div><span style={{color:'var(--text-muted)',fontSize:'var(--text-sm)'}}>Loading...</span></div>;

  return (
    <div style={S.page}>
      <div style={S.header}>
        <h1 style={S.title}><FaBookmark style={{ color: 'var(--color-heart)', fontSize: 20 }} /> Wishlist</h1>
        <p style={S.sub}>{items.length > 0 ? `${items.length} game${items.length===1?'':'s'} on your wishlist` : 'Games you want to keep an eye on'}</p>
      </div>

      {error && <div className="error" style={{maxWidth:'500px',marginBottom:'var(--sp-5)'}}>{error}</div>}

      {items.length === 0 ? (
        <div style={S.empty}>
          <FaGamepad style={S.emptyIcon} />
          <h2 style={S.emptyTitle}>Wishlist is empty</h2>
          <p style={S.emptyText}>Tap the bookmark icon on any game to keep an eye on it here.</p>
          <Link to="/discover" className="btn btn-primary">Find Games</Link>
        </div>
      ) : (
        <div className="games-grid">
          {items.map((item, i) => (
            <div
              key={item.gameId}
              style={{...S.card, animation: `fadeInUp 0.4s ease-out ${i*0.04}s backwards`}}
              onMouseEnter={e => { e.currentTarget.style.borderColor='var(--border-hover)'; e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='var(--shadow-card-hover)'; const d=e.currentTarget.querySelector('.del-btn'); if(d)d.style.opacity='1'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none'; const d=e.currentTarget.querySelector('.del-btn'); if(d)d.style.opacity='0'; }}
            >
              <Link to={`/game/${item.gameId}`} style={{textDecoration:'none',color:'inherit'}}>
                <img src={item.gameImage || '/placeholder-game.jpg'} alt={item.gameName} style={S.cardImg} onError={e=>{e.target.src='/placeholder-game.jpg';}} />
                <div style={S.cardInfo}>
                  <div style={S.cardName}>{item.gameName}</div>
                  <div style={S.cardDate}>Added {new Date(item.addedAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</div>
                </div>
              </Link>
              <button className="del-btn" style={S.delBtn} onClick={() => handleRemove(item.gameId)} title="Remove"
                onMouseEnter={e=>{e.target.style.background='rgba(239,68,68,0.2)';e.target.style.transform='scale(1.1)';}}
                onMouseLeave={e=>{e.target.style.background='rgba(10,10,15,0.6)';e.target.style.transform='scale(1)';}}
              ><FaTrash /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
