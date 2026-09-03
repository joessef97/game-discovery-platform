import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { FaStar, FaHeart, FaRegHeart, FaBookmark, FaRegBookmark, FaCalendarAlt, FaArrowLeft, FaGamepad, FaPlay } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import gameService from '../services/gameService';
import favoriteService from '../services/favoriteService';
import wishlistService from '../services/wishlistService';

const S = {
  page: { paddingTop: 'calc(var(--topbar-height) + var(--sp-6))', paddingLeft: 'calc(var(--sidebar-width) + var(--sp-6))', paddingRight: 'var(--sp-6)', paddingBottom: 'var(--sp-10)', minHeight: '100vh', animation: 'fadeIn 0.4s ease-out' },
  back: { marginBottom: 'var(--sp-5)', display: 'inline-flex' },
  grid: { display: 'grid', gridTemplateColumns: '320px 1fr', gap: 'var(--sp-8)', marginBottom: 'var(--sp-10)' },
  imgWrap: { position: 'relative', borderRadius: 'var(--r-xl)', overflow: 'hidden', border: '1px solid var(--border)', aspectRatio: '3/4', background: 'var(--bg-elevated)' },
  img: { width: '100%', height: '100%', objectFit: 'cover' },
  details: { display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' },
  title: { fontFamily: 'var(--font-display)', fontSize: 'clamp(1.75rem, 3vw, 2.75rem)', fontWeight: 900, letterSpacing: '-0.01em', textTransform: 'uppercase', lineHeight: 1.1, color: 'var(--text-primary)' },
  metaRow: { display: 'flex', alignItems: 'center', gap: 'var(--sp-4)', flexWrap: 'wrap' },
  scoreBig: (s) => ({ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: '44px', height: '44px', padding: '0 10px', fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 900, borderRadius: 'var(--r-lg)', background: s >= 80 ? 'rgba(34,197,94,0.15)' : s >= 60 ? 'rgba(251,191,36,0.15)' : 'rgba(239,68,68,0.15)', color: s >= 80 ? 'var(--score-high)' : s >= 60 ? 'var(--score-mid)' : 'var(--score-low)', border: `1px solid ${s >= 80 ? 'rgba(34,197,94,0.3)' : s >= 60 ? 'rgba(251,191,36,0.3)' : 'rgba(239,68,68,0.3)'}` }),
  metaBadge: { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 'var(--r-full)', fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-secondary)' },
  pills: { display: 'flex', flexWrap: 'wrap', gap: '6px' },
  genrePill: { padding: '4px 14px', background: 'var(--accent-dim)', border: '1px solid rgba(212,245,60,0.15)', borderRadius: 'var(--r-full)', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--accent-text)' },
  platPill: { padding: '4px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--text-tertiary)' },
  wishBtn: (w) => ({ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 24px', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 700, cursor: 'pointer', borderRadius: 'var(--r-md)', transition: 'all 200ms ease', width: 'fit-content', border: w ? '1px solid rgba(56,189,248,0.35)' : '1px solid var(--border)', background: w ? 'rgba(56,189,248,0.12)' : 'transparent', color: w ? '#38bdf8' : 'var(--text-secondary)' }),
  favBtn: (f) => ({ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 24px', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 700, cursor: 'pointer', borderRadius: 'var(--r-md)', transition: 'all 200ms ease', width: 'fit-content', border: f ? '1px solid rgba(244,63,94,0.3)' : 'none', background: f ? 'rgba(244,63,94,0.1)' : 'var(--accent)', color: f ? 'var(--color-heart)' : '#0a0a0f' }),
  aboutLabel: { fontFamily: 'var(--font-display)', fontSize: 'var(--text-xs)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 'var(--sp-3)' },
  aboutText: { fontSize: 'var(--text-sm)', lineHeight: 1.7, color: 'var(--text-tertiary)', maxWidth: '600px' },
  secTitle: { fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-primary)', marginBottom: 'var(--sp-5)', display: 'flex', alignItems: 'center', gap: '10px' },
  tGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--sp-4)', marginBottom: 'var(--sp-10)' },
  tWrap: { position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)', background: 'var(--bg-elevated)' },
  iframe: { position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' },
  ssGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--sp-3)' },
  ss: { width: '100%', height: '120px', objectFit: 'cover', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)', cursor: 'pointer', transition: 'all 300ms ease' },
  center: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: 'var(--sp-4)' },
  muted: { color: 'var(--text-muted)', fontSize: 'var(--text-sm)' },
};

const GameDetail = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isSteam = searchParams.get('steam') === '1';
  const gameName = searchParams.get('name') || null;
  const { isAuthenticated } = useAuth();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFavorited, setIsFavorited] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    if (id) {
      loadGameDetails();
      if (isAuthenticated) { checkFavoriteStatus(); checkWishlistStatus(); }
    }
  }, [id, isAuthenticated, isSteam]);

  const loadGameDetails = async () => {
    setLoading(true);
    setError('');
    try {
      // Use Steam ID lookup if ?steam=1, otherwise use IGDB ID directly
      const data = isSteam
        ? await gameService.getGameDetailsBySteamId(id, gameName)
        : await gameService.getGameDetails(id);
      setGame(data);
    } catch (e) {
      setError('Failed to load game details.');
    } finally {
      setLoading(false);
    }
  };

  const checkFavoriteStatus = async () => {
    try {
      const r = await favoriteService.checkFavoriteStatus(id);
      setIsFavorited(r.isFavorite);
    } catch (e) {}
  };

  const checkWishlistStatus = async () => {
    try {
      const r = await wishlistService.checkWishlistStatus(id);
      setIsWishlisted(r.isWishlisted);
    } catch (e) {}
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated || !game) return;
    try {
      if (isWishlisted) {
        await wishlistService.removeFromWishlist(game.id);
        setIsWishlisted(false);
      } else {
        await wishlistService.addToWishlist(game.id, game.name, game.background_image || '');
        setIsWishlisted(true);
      }
    } catch (e) {}
  };

  const handleFavoriteToggle = async () => {
    if (!isAuthenticated || !game) return;
    try {
      if (isFavorited) {
        await favoriteService.removeFromFavorites(game.id);
        setIsFavorited(false);
      } else {
        await favoriteService.addToFavorites(game.id, game.name, game.background_image || '');
        setIsFavorited(true);
      }
    } catch (e) {}
  };

  if (loading) return (
    <div style={S.center}>
      <div className="spinner" />
      <span style={S.muted}>Loading game details...</span>
    </div>
  );

  if (error || !game) return (
    <div style={S.center}>
      <FaGamepad style={{ fontSize: '3rem', color: 'var(--text-muted)', opacity: 0.3 }} />
      <div className="error">{error || 'Game not found'}</div>
      <Link to="/" className="btn btn-primary"><FaArrowLeft /> Back to Home</Link>
    </div>
  );

  const score = game.rating ? Math.round(game.rating * 20) : null;

  return (
    <div style={S.page}>
      <Link to="/" className="btn btn-secondary" style={S.back}><FaArrowLeft /> Back</Link>

      <div style={S.grid} className="gd-grid">
        {/* Cover — use IGDB cover (matched to the actual found game), fall back to Steam CDN */}
        <div style={S.imgWrap}>
          <img
            src={game.background_image || (isSteam ? `https://cdn.cloudflare.steamstatic.com/steam/apps/${id}/library_600x900.jpg` : '/placeholder-game.jpg')}
            alt={game.name}
            style={S.img}
            onError={(e) => {
              // If IGDB cover fails, try Steam CDN, then give up
              if (isSteam && e.target.src !== `https://cdn.cloudflare.steamstatic.com/steam/apps/${id}/library_600x900.jpg`) {
                e.target.src = `https://cdn.cloudflare.steamstatic.com/steam/apps/${id}/library_600x900.jpg`;
              } else {
                e.target.style.display = 'none';
              }
            }}
          />
        </div>

        <div style={S.details}>
          <h1 style={S.title}>{game.name}</h1>
          <div style={S.metaRow}>
            {score && <div style={S.scoreBig(score)}>{score}</div>}
            {game.released && (
              <div style={S.metaBadge}>
                <FaCalendarAlt style={{ opacity: 0.5 }} />
                {new Date(game.released).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </div>
            )}
            {game.rating && (
              <div style={S.metaBadge}>
                <FaStar style={{ color: 'var(--color-star)' }} />
                {game.rating.toFixed(1)}
              </div>
            )}
          </div>

          {game.genres?.length > 0 && (
            <div style={S.pills}>
              {game.genres.map((g, i) => <span key={i} style={S.genrePill}>{g.name}</span>)}
            </div>
          )}

          {game.platforms?.length > 0 && (
            <div style={S.pills}>
              {game.platforms.map((p, i) => <span key={i} style={S.platPill}>{p.platform?.name || p.name}</span>)}
            </div>
          )}

          {isAuthenticated && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              <button style={S.favBtn(isFavorited)} onClick={handleFavoriteToggle}>
                {isFavorited ? <FaHeart /> : <FaRegHeart />}
                {isFavorited ? 'Remove from Favorites' : 'Add to Favorites'}
              </button>
              <button style={S.wishBtn(isWishlisted)} onClick={handleWishlistToggle}>
                {isWishlisted ? <FaBookmark /> : <FaRegBookmark />}
                {isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
              </button>
            </div>
          )}

          {game.description_raw && (
            <div>
              <div style={S.aboutLabel}>About This Game</div>
              <p style={S.aboutText}>{game.description_raw}</p>
            </div>
          )}
        </div>
      </div>

      {game.trailers?.length > 0 && (
        <div style={{ marginBottom: 'var(--sp-10)' }}>
          <h3 style={S.secTitle}><FaPlay style={{ fontSize: '12px', color: 'var(--accent)' }} /> Trailers</h3>
          <div style={S.tGrid}>
            {game.trailers.slice(0, 4).map((t, i) => (
              <div key={i} style={S.tWrap}>
                <iframe
                  src={t.data.max.replace('watch?v=', 'embed/')}
                  title={`Trailer ${i + 1}`}
                  style={S.iframe}
                  allowFullScreen
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {game.screenshots?.length > 0 && (
        <div>
          <h3 style={S.secTitle}>Screenshots</h3>
          <div style={S.ssGrid}>
            {game.screenshots.slice(0, 8).map((s, i) => (
              <img
                key={i}
                src={s.image}
                alt={`Screenshot ${i + 1}`}
                style={S.ss}
                onClick={() => window.open(s.image, '_blank')}
                onMouseEnter={(e) => { e.target.style.transform = 'scale(1.03)'; e.target.style.borderColor = 'var(--border-hover)'; }}
                onMouseLeave={(e) => { e.target.style.transform = 'scale(1)'; e.target.style.borderColor = 'var(--border)'; }}
              />
            ))}
          </div>
        </div>
      )}

      <style>{`.gd-grid { @media (max-width: 768px) { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
};

export default GameDetail;
