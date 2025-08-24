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
    const { query, page = 1, page_size = 20 } = req.query;

    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const offset = (page - 1) * page_size;
    const games = await igdbService.searchGames(query, page_size, offset);

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
      next: formattedGames.length === page_size ? true : null,
      previous: page > 1 ? true : null
    });
  } catch (error) {
    console.error('Game search error:', error.message);
    res.status(500).json({ message: 'Error searching games' });
  }
});

// @route   GET /api/games/:id
// @desc    Get game details
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
    const { page = 1, page_size = 20 } = req.query;
    
    const offset = (page - 1) * page_size;
    const games = await igdbService.getTrendingGames(page_size, offset);

    // Format games data
    const formattedGames = games.map(game => igdbService.formatGameData(game));

    res.json({
      results: formattedGames,
      count: formattedGames.length,
      next: formattedGames.length === page_size ? true : null,
      previous: page > 1 ? true : null
    });
  } catch (error) {
    console.error('Trending games error:', error.message);
    res.status(500).json({ message: 'Error fetching trending games' });
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
