const express = require('express');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/favorites
// @desc    Get user's favorite games
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('favorites');
    res.json(user.favorites || []);
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ message: 'Error fetching favorites' });
  }
});

// @route   POST /api/favorites
// @desc    Add game to favorites
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { gameId, gameName, gameImage } = req.body;

    if (!gameId || !gameName || !gameImage) {
      return res.status(400).json({ message: 'Game ID, name, and image are required' });
    }

    const user = await User.findById(req.user._id);

    // Check if game is already in favorites
    const existingFavorite = user.favorites.find(fav => fav.gameId === parseInt(gameId));
    if (existingFavorite) {
      return res.status(400).json({ message: 'Game is already in favorites' });
    }

    // Add to favorites
    user.favorites.unshift({
      gameId: parseInt(gameId),
      gameName,
      gameImage
    });

    await user.save();

    res.status(201).json({ 
      message: 'Game added to favorites',
      favorite: user.favorites[0]
    });
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({ message: 'Error adding game to favorites' });
  }
});

// @route   DELETE /api/favorites/:gameId
// @desc    Remove game from favorites
// @access  Private
router.delete('/:gameId', authMiddleware, async (req, res) => {
  try {
    const { gameId } = req.params;
    const user = await User.findById(req.user._id);

    // Find and remove the favorite
    const favoriteIndex = user.favorites.findIndex(fav => fav.gameId === parseInt(gameId));
    
    if (favoriteIndex === -1) {
      return res.status(404).json({ message: 'Game not found in favorites' });
    }

    user.favorites.splice(favoriteIndex, 1);
    await user.save();

    res.json({ message: 'Game removed from favorites' });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({ message: 'Error removing game from favorites' });
  }
});

// @route   GET /api/favorites/check/:gameId
// @desc    Check if game is in favorites
// @access  Private
router.get('/check/:gameId', authMiddleware, async (req, res) => {
  try {
    const { gameId } = req.params;
    const user = await User.findById(req.user._id).select('favorites');
    
    const isFavorite = user.favorites.some(fav => fav.gameId === parseInt(gameId));
    
    res.json({ isFavorite });
  } catch (error) {
    console.error('Check favorite error:', error);
    res.status(500).json({ message: 'Error checking favorite status' });
  }
});

module.exports = router;
