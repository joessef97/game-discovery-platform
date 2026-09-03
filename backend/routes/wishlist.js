const express = require('express');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/wishlist
// @desc    Get user's wishlisted games
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('wishlist');
    res.json(user.wishlist || []);
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ message: 'Error fetching wishlist' });
  }
});

// @route   POST /api/wishlist
// @desc    Add game to wishlist
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { gameId, gameName, gameImage } = req.body;

    if (!gameId || !gameName) {
      return res.status(400).json({ message: 'Game ID and name are required' });
    }

    const user = await User.findById(req.user._id);

    // Check if game is already in the wishlist
    const existing = user.wishlist.find(item => item.gameId === parseInt(gameId));
    if (existing) {
      return res.status(400).json({ message: 'Game is already in wishlist' });
    }

    user.wishlist.unshift({
      gameId: parseInt(gameId),
      gameName,
      gameImage: gameImage || ''
    });

    await user.save();

    res.status(201).json({
      message: 'Game added to wishlist',
      item: user.wishlist[0]
    });
  } catch (error) {
    console.error('Add wishlist error:', error);
    res.status(500).json({ message: 'Error adding game to wishlist' });
  }
});

// @route   DELETE /api/wishlist/:gameId
// @desc    Remove game from wishlist
// @access  Private
router.delete('/:gameId', authMiddleware, async (req, res) => {
  try {
    const { gameId } = req.params;
    const user = await User.findById(req.user._id);

    const index = user.wishlist.findIndex(item => item.gameId === parseInt(gameId));

    if (index === -1) {
      return res.status(404).json({ message: 'Game not found in wishlist' });
    }

    user.wishlist.splice(index, 1);
    await user.save();

    res.json({ message: 'Game removed from wishlist' });
  } catch (error) {
    console.error('Remove wishlist error:', error);
    res.status(500).json({ message: 'Error removing game from wishlist' });
  }
});

// @route   GET /api/wishlist/check/:gameId
// @desc    Check if game is in wishlist
// @access  Private
router.get('/check/:gameId', authMiddleware, async (req, res) => {
  try {
    const { gameId } = req.params;
    const user = await User.findById(req.user._id).select('wishlist');

    const isWishlisted = user.wishlist.some(item => item.gameId === parseInt(gameId));

    res.json({ isWishlisted });
  } catch (error) {
    console.error('Check wishlist error:', error);
    res.status(500).json({ message: 'Error checking wishlist status' });
  }
});

module.exports = router;
