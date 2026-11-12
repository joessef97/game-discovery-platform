const express = require('express');
const authMiddleware = require('../middleware/auth');
const emailService = require('../services/emailService');

const router = express.Router();

router.post('/test', authMiddleware, async (req, res) => {
  try {
    const result = await emailService.sendTest({ to: req.user.email });
    if (!result.success) {
      return res.status(500).json({ success: false, message: 'Failed to send test email.' });
    }
    return res.json({ success: true, message: `Test email sent to ${req.user.email}.`, emailId: result.id });
  } catch (error) {
    console.error('Email test error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error sending test email.' });
  }
});

module.exports = router;
