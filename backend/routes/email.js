/**
 * routes/email.js — Email test & utility routes
 *
 * POST /api/email/test   — Send a test email (requires auth)
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const authMiddleware = require('../middleware/auth');
const emailService = require('../services/emailService');

const router = express.Router();

// ── POST /api/email/test ─────────────────────────────────
// Sends a test email to the authenticated user's address
router.post('/test', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const to = req.body.to || user.email;

    console.log(`🔧 Test email requested by ${user.username} → ${to}`);

    const result = await emailService.sendTest({ to });

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.error === 'RESEND_API_KEY not configured'
          ? 'RESEND_API_KEY is not set in your .env file. Add your key from https://resend.com/api-keys'
          : `Failed to send email: ${JSON.stringify(result.error)}`,
        error: result.error,
      });
    }

    return res.json({
      success: true,
      message: `Test email sent to ${to}! Check your inbox.`,
      emailId: result.id,
    });
  } catch (err) {
    console.error('Email test error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// ── POST /api/email/test-public ──────────────────────────
// Public test endpoint (no auth required) — for quick verification
router.post('/test-public', [
  body('to').isEmail().withMessage('Valid email required'),
  body('secret').equals(process.env.TEST_EMAIL_SECRET || 'gamehub-test').withMessage('Invalid secret'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }

  const { to } = req.body;
  const result = await emailService.sendTest({ to });

  if (!result.success) {
    return res.status(500).json({
      success: false,
      message: result.error === 'RESEND_API_KEY not configured'
        ? 'RESEND_API_KEY is not configured in .env'
        : `Email failed: ${JSON.stringify(result.error)}`,
    });
  }

  return res.json({ success: true, message: `Test email sent to ${to}`, emailId: result.id });
});

module.exports = router;
