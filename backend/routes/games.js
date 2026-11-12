const express = require('express');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const igdbService = require('../services/igdbService');

const router = express.Router();

// @route   GET /api/games/search
// @desc    Search games
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    const pagination = categoryPagination(req, res);
    if (!pagination) return;

    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const { page, pageSize, offset } = pagination;
    const genreId = req.query.genre_id === undefined ? null : positiveInteger(req.query.genre_id);
    const platformId = req.query.platform_id === undefined ? null : positiveInteger(req.query.platform_id);
    if ((req.query.genre_id !== undefined && genreId === null) || (req.query.platform_id !== undefined && platformId === null)) {
      return res.status(400).json({ message: 'Invalid genre_id or platform_id' });
    }
    const filters = {};
    if (genreId !== null) filters.genreId = genreId;
    if (platformId !== null) filters.platformId = platformId;
    const games = await igdbService.searchGames(query, pageSize, offset, filters);
    // Format games data
    const formattedGames = games.map(game => igdbService.formatGameData(game));

    // Save search to user's history if authenticated
    if (req.header('Authorization')) {
      try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        
        if (user) {
          // Add to search history (keep only last 50 searches)
          user.searchHistory.unshift({ query });
          user.searchHistory = user.searchHistory.slice(0, 50);
          await user.save();
        }
      } catch (error) {
        // Ignore auth errors for search history
        console.log('Search history save failed:', error.message);
      }
    }

    res.json({
      results: formattedGames,
      count: formattedGames.length,
      next: formattedGames.length === pageSize ? true : null,
      previous: page > 1 ? true : null
    });
  } catch (error) {
    console.error('Game search error:', error.message);
    res.status(500).json({ message: 'Error searching games' });
  }
});

// @route   GET /api/games/steam/:steamId
// @desc    Get game details by Steam App ID (maps to correct IGDB game)
// @access  Public
router.get('/steam/:steamId', async (req, res) => {
  try {
    const { steamId } = req.params;
    const { name } = req.query; // optional game name hint for accurate lookup
    const game = await igdbService.getGameBySteamId(steamId, name || null);

    if (!game) {
      return res.status(404).json({ message: 'Game not found for this Steam ID' });
    }

    res.json(igdbService.formatGameData(game));
  } catch (error) {
    console.error('Steam game lookup error:', error.message);
    res.status(500).json({ message: 'Error fetching game details' });
  }
});


// Parse bounded positive integers before passing client values to IGDB.
function positiveInteger(value, fallback, max = Number.MAX_SAFE_INTEGER) {
  if (value === undefined) return fallback;
  if (!/^[1-9]\d*$/.test(String(value))) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed <= max ? parsed : null;
}

function categoryPagination(req, res) {
  const page = positiveInteger(req.query.page, 1);
  const pageSize = positiveInteger(req.query.page_size, 20, 40);
  if (page === null || pageSize === null) {
    res.status(400).json({ message: 'Invalid page or page_size (page >= 1, page_size 1-40)' });
    return null;
  }
  const offset = (page - 1) * pageSize;
  if (!Number.isSafeInteger(offset)) {
    res.status(400).json({ message: 'Page offset is too large' });
    return null;
  }
  return { page, pageSize, offset };
}

router.get('/genres', async (_req, res) => {
  try {
    const categories = await igdbService.getGenres(100, 0);
    res.json(categories.map(({ id, name }) => ({ id, name })));
  } catch (error) {
    console.error('Genre list error:', error.message);
    res.status(500).json({ message: 'Error fetching genres' });
  }
});

router.get('/platforms', async (_req, res) => {
  try {
    const categories = await igdbService.getPlatforms(100, 0);
    res.json(categories.map(({ id, name }) => ({ id, name })));
  } catch (error) {
    console.error('Platform list error:', error.message);
    res.status(500).json({ message: 'Error fetching platforms' });
  }
});

function categoryGames(service, idParam, label) {
  return async (req, res) => {
    const id = positiveInteger(req.params[idParam]);
    const pagination = categoryPagination(req, res);
    if (id === null) return res.status(400).json({ message: `Invalid ${label} ID` });
    if (!pagination) return;
    try {
      const games = await service(id, pagination.pageSize, pagination.offset);
      const results = games.map(game => igdbService.formatGameData(game));
      res.json({ results, count: results.length, next: results.length === pagination.pageSize ? true : null, previous: pagination.page > 1 ? true : null });
    } catch (error) {
      console.error(`${label} games error:`, error.message);
      res.status(500).json({ message: `Error fetching ${label} games` });
    }
  };
}
router.get('/genre/:genreId', categoryGames(igdbService.getGamesByGenre.bind(igdbService), 'genreId', 'genre'));
router.get('/platform/:platformId', categoryGames(igdbService.getGamesByPlatform.bind(igdbService), 'platformId', 'platform'));
// @route   GET /api/games/:id
// @desc    Get game details by IGDB ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const game = await igdbService.getGameDetails(id);
    
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    const formattedGame = igdbService.formatGameData(game);
    res.json(formattedGame);
  } catch (error) {
    console.error('Game details error:', error.message);
    if (error.response?.status === 404) {
      return res.status(404).json({ message: 'Game not found' });
    }
    res.status(500).json({ message: 'Error fetching game details' });
  }
});

// @route   GET /api/games/trending
// @desc    Get trending games
// @access  Public
router.get('/trending/popular', async (req, res) => {
  try {
    const pagination = categoryPagination(req, res);
    if (!pagination) return;
    const games = await igdbService.getTrendingGames(pagination.pageSize, pagination.offset);
    const results = games.map(game => igdbService.formatGameData(game));
    res.json({ results, count: results.length, next: results.length === pagination.pageSize ? true : null, previous: pagination.page > 1 ? true : null });
  } catch (error) {
    console.error('Trending games error:', error.message);
    res.status(500).json({ message: 'Error fetching trending games' });
  }
});
// @route   GET /api/games/upcoming
// @desc    Get games with a confirmed future release date
// @access  Public
router.get('/upcoming/list', async (req, res) => {
  try {
    const pagination = categoryPagination(req, res);
    if (!pagination) return;
    const games = await igdbService.getUpcomingGames(pagination.pageSize, pagination.offset);
    const results = games.map(game => ({ ...igdbService.formatGameData(game), hypes: game.hypes || 0 }));
    res.json({ results, count: results.length, next: results.length === pagination.pageSize ? true : null, previous: pagination.page > 1 ? true : null });
  } catch (error) {
    console.error('Upcoming games error:', error.message);
    res.status(500).json({ message: 'Error fetching upcoming games' });
  }
});
// @route   GET /api/games/top-rated
// @desc    Get highest-rated released games (optionally since a given year)
// @access  Public
router.get('/top-rated/list', async (req, res) => {
  try {
    const pagination = categoryPagination(req, res);
    if (!pagination) return;
    const since = req.query.since === undefined ? null : positiveInteger(req.query.since, null, new Date().getUTCFullYear() + 1);
    if (req.query.since !== undefined && since === null) return res.status(400).json({ message: 'Invalid since year' });
    const games = await igdbService.getTopRatedGames(pagination.pageSize, pagination.offset, since);
    const results = games.map(game => ({ ...igdbService.formatGameData(game), rating_count: game.rating_count || 0 }));
    res.json({ results, count: results.length, next: results.length === pagination.pageSize ? true : null, previous: pagination.page > 1 ? true : null });
  } catch (error) {
    console.error('Top rated games error:', error.message);
    res.status(500).json({ message: 'Error fetching top rated games' });
  }
});
// @route   GET /api/games/user/search-history
// @desc    Get user's search history
// @access  Private
router.get('/user/search-history', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('searchHistory');
    res.json(user.searchHistory || []);
  } catch (error) {
    console.error('Search history error:', error);
    res.status(500).json({ message: 'Error fetching search history' });
  }
});

module.exports = router;
