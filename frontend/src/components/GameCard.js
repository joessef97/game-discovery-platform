import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaBookmark, FaRegBookmark } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import favoriteService from '../services/favoriteService';
import wishlistService from '../services/wishlistService';

// Per-game CSS gradient fallbacks (Steam APP_ID → gradient)
const CARD_GRADIENTS = {
  // Helldivers 2
  553850: 'linear-gradient(160deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
  // Baldur's Gate 3
  1086940: 'linear-gradient(160deg, #2d1b69 0%, #11998e 100%)',
  // Stellar Blade
  3489700: 'linear-gradient(160deg, #4a0080 0%, #7b2d8b 50%, #c2185b 100%)',
  // Red Dead Redemption 2
  1174180: 'linear-gradient(160deg, #3d1a00 0%, #7c3303 50%, #c56000 100%)',
  // Hades II
  1145350: 'linear-gradient(160deg, #1a0533 0%, #5c1a8e 50%, #8b0000 100%)',
  // Ghost of Tsushima
  2215430: 'linear-gradient(160deg, #0d1b2a 0%, #1b4332 50%, #2d6a4f 100%)',
  // Elden Ring
  1245620: 'linear-gradient(160deg, #1a1000 0%, #3d2800 50%, #6b4800 100%)',
  // Hollow Knight
  367520: 'linear-gradient(160deg, #0a0015 0%, #1a0030 50%, #2d0045 100%)',
  // Cyberpunk 2077
  1091500: 'linear-gradient(160deg, #0a0a1a 0%, #1a0a2e 50%, #ff00ff1a 100%)',
  // Nier: Automata
  524220: 'linear-gradient(160deg, #1a1a0a 0%, #2a2a15 50%, #3d3d20 100%)',
  // Witcher 3
  292030: 'linear-gradient(160deg, #1a0a00 0%, #3d1a00 50%, #6b3a00 100%)',
  // Starfield
  2721670: 'linear-gradient(160deg, #000814 0%, #001d3d 50%, #003566 100%)',
  // Black Myth: Wukong
  2358720: 'linear-gradient(160deg, #1a0a00 0%, #4a1500 50%, #8b2500 100%)',
  // Assassin's Creed Shadows
  3159330: 'linear-gradient(160deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%)',
  // Default fallback
  default: 'linear-gradient(160deg, #111118 0%, #16161f 100%)',
};

const getGradient = (gameId) => CARD_GRADIENTS[gameId] || CARD_GRADIENTS.default;

const getSteamCover = (steamAppId) =>
  steamAppId
    ? `https://cdn.cloudflare.steamstatic.com/steam/apps/${steamAppId}/library_600x900.jpg`
    : null;

const GameCard = ({ game, steamAppId, variant = 'trending' }) => {
  const { isAuthenticated } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isWishLoading, setIsWishLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && game?.id) checkSaved();
  }, [isAuthenticated, game?.id]);

  const checkSaved = async () => {
    try {
      const [fav, wish] = await Promise.all([
        favoriteService.checkFavoriteStatus(game.id),
        wishlistService.checkWishlistStatus(game.id),
      ]);
      setIsFavorited(fav.isFavorite);
      setIsWishlisted(wish.isWishlisted);
    } catch {}
  };

  const toggleFav = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      if (isFavorited) {
        await favoriteService.removeFromFavorites(game.id);
        setIsFavorited(false);
      } else {
        await favoriteService.addToFavorites(game.id, game.name, game.background_image || '');
        setIsFavorited(true);
      }
    } catch {}
    finally { setIsLoading(false); }
  };

  const toggleWish = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return;
    setIsWishLoading(true);
    try {
      if (isWishlisted) {
        await wishlistService.removeFromWishlist(game.id);
        setIsWishlisted(false);
      } else {
        await wishlistService.addToWishlist(game.id, game.name, game.background_image || '');
        setIsWishlisted(true);
      }
    } catch {}
    finally { setIsWishLoading(false); }
  };

  const score = game?.rating ? Math.round(game.rating * 20) : null;
  const scoreColor =
    score >= 90 ? '#22c55e' :
    score >= 80 ? '#22c55e' :
    score >= 70 ? '#fbbf24' : '#ef4444';
  const scoreBg =
    score >= 80 ? 'rgba(34,197,94,0.15)' :
    score >= 60 ? 'rgba(251,191,36,0.15)' : 'rgba(239,68,68,0.15)';
  const scoreBorder =
    score >= 80 ? 'rgba(34,197,94,0.3)' :
    score >= 60 ? 'rgba(251,191,36,0.3)' : 'rgba(239,68,68,0.3)';

  const primaryGenre = game?.genres?.[0]?.name || '';
  const coverSrc = getSteamCover(steamAppId) || game?.background_image;
  const fallbackGradient = getGradient(steamAppId || game?.id);

  if (variant === 'recommended') {
    // Wide landscape card for recommended section
    return (
      <Link
        to={`/game/${game.id}`}
        className="block relative rounded-xl overflow-hidden transition-all group"
        style={{
          background: fallbackGradient,
          border: '1px solid rgba(255,255,255,0.06)',
          aspectRatio: '16/9',
        }}
      >
        {coverSrc && (
          <img
            src={coverSrc}
            alt={game.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        )}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(10,10,15,0.95) 0%, rgba(10,10,15,0.4) 60%, transparent 100%)' }}
        />

        {score && (
          <div
            className="absolute top-2 right-2 flex items-center justify-center w-8 h-8 text-sm font-black rounded-md"
            style={{
              background: scoreBg,
              color: scoreColor,
              border: `1px solid ${scoreBorder}`,
              fontFamily: 'var(--font-display)',
            }}
          >
            {score}
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-3">
          <div
            className="font-bold uppercase text-sm text-white leading-tight mb-1"
            style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.04em' }}
          >
            {game.name}
          </div>
          {game?.genres?.length > 0 && (
            <div className="flex gap-1.5 flex-wrap">
              {game.genres.slice(0, 3).map((g) => (
                <span
                  key={g.name}
                  className="text-[9px] font-medium px-2 py-0.5 rounded-full"
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    color: 'rgba(240,240,240,0.7)',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  {g.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {isAuthenticated && (
          <>
            <button
              className="absolute top-2 left-2 w-7 h-7 flex items-center justify-center rounded-full text-xs opacity-0 group-hover:opacity-100 transition-all"
              style={{
                background: isFavorited ? 'rgba(244,63,94,0.2)' : 'rgba(255,255,255,0.12)',
                color: isFavorited ? '#f43f5e' : 'rgba(240,240,240,0.7)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
              onClick={toggleFav}
              disabled={isLoading}
              title={isFavorited ? 'Remove from My Games' : 'Add to My Games'}
              aria-label={isFavorited ? 'Remove from My Games' : 'Add to My Games'}
            >
              {isFavorited ? <FaHeart /> : <FaRegHeart />}
            </button>
            <button
              className="absolute top-2 left-11 w-7 h-7 flex items-center justify-center rounded-full text-xs opacity-0 group-hover:opacity-100 transition-all"
              style={{
                background: isWishlisted ? 'rgba(56,189,248,0.2)' : 'rgba(255,255,255,0.12)',
                color: isWishlisted ? '#38bdf8' : 'rgba(240,240,240,0.7)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
              onClick={toggleWish}
              disabled={isWishLoading}
              title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
              aria-label={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
            >
              {isWishlisted ? <FaBookmark /> : <FaRegBookmark />}
            </button>
          </>
        )}
      </Link>
    );
  }

  // Default: vertical portrait card for trending
  return (
    <Link
      to={`/game/${game.id}`}
      className="block relative rounded-xl overflow-hidden transition-all group flex-shrink-0"
      style={{
        background: fallbackGradient,
        border: '1px solid rgba(255,255,255,0.06)',
        width: 130,
      }}
    >
      <div className="relative" style={{ aspectRatio: '2/3' }}>
        {coverSrc && (
          <img
            src={coverSrc}
            alt={game.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        )}
        {/* hover overlay */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: 'linear-gradient(to top, rgba(10,10,15,0.9) 0%, transparent 60%)' }}
        />

        {score && (
          <div
            className="absolute top-2 left-2 flex items-center justify-center w-9 h-7 text-base font-black rounded-md"
            style={{
              background: scoreBg,
              color: scoreColor,
              border: `1px solid ${scoreBorder}`,
              fontFamily: 'var(--font-display)',
            }}
          >
            {score}
          </div>
        )}

        {isAuthenticated && (
          <>
            <button
              className="absolute top-1.5 right-1.5 w-6 h-6 flex items-center justify-center rounded-full text-[10px] opacity-0 group-hover:opacity-100 transition-all"
              style={{
                background: isFavorited ? 'rgba(244,63,94,0.2)' : 'rgba(255,255,255,0.12)',
                color: isFavorited ? '#f43f5e' : 'rgba(240,240,240,0.7)',
              }}
              onClick={toggleFav}
              disabled={isLoading}
              title={isFavorited ? 'Remove from My Games' : 'Add to My Games'}
              aria-label={isFavorited ? 'Remove from My Games' : 'Add to My Games'}
            >
              {isFavorited ? <FaHeart /> : <FaRegHeart />}
            </button>
            <button
              className="absolute top-9 right-1.5 w-6 h-6 flex items-center justify-center rounded-full text-[10px] opacity-0 group-hover:opacity-100 transition-all"
              style={{
                background: isWishlisted ? 'rgba(56,189,248,0.2)' : 'rgba(255,255,255,0.12)',
                color: isWishlisted ? '#38bdf8' : 'rgba(240,240,240,0.7)',
              }}
              onClick={toggleWish}
              disabled={isWishLoading}
              title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
              aria-label={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
            >
              {isWishlisted ? <FaBookmark /> : <FaRegBookmark />}
            </button>
          </>
        )}
      </div>

      <div className="p-2.5">
        <div
          className="font-bold text-[11px] uppercase text-white leading-tight mb-1 truncate"
          style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.03em' }}
        >
          {game.name}
        </div>
        {primaryGenre && (
          <span
            className="text-[9px] font-medium px-1.5 py-0.5 rounded"
            style={{
              background: 'rgba(255,255,255,0.07)',
              color: 'rgba(240,240,240,0.55)',
              fontFamily: 'var(--font-body)',
            }}
          >
            {primaryGenre}
          </span>
        )}
      </div>
    </Link>
  );
};

export default GameCard;
