const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const emailService = require('../services/emailService');

const router = express.Router();

// ── helpers ──────────────────────────────────────────────
const generateToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

const safeUser = (user) => ({
  id: user._id,
  username: user.username,
  email: user.email,
  avatar: user.avatar,
  createdAt: user.createdAt,
  emailVerified: Boolean(user.emailVerified),
});
// ── validation chains ────────────────────────────────────
const registerValidators = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be 3–20 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers and underscores'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

const loginValidators = [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

// ── POST /api/auth/register ──────────────────────────────
router.post('/register', registerValidators, async (req, res) => {
  // express-validator errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
  }

  try {
    const { username, email, password } = req.body;

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      return res.status(400).json({
        message: existing.email === email ? 'Email already registered' : 'Username already taken',
      });
    }

    const crypto = require('crypto');
    const rawVerificationToken = crypto.randomBytes(32).toString('hex');
    const user = new User({
      username, email, password,
      emailVerified: false,
      emailVerificationToken: crypto.createHash('sha256').update(rawVerificationToken).digest('hex'),
      emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    await user.save();

    const token = generateToken(user._id);

    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email/${rawVerificationToken}`;
    emailService.sendEmailVerification({ to: user.email, username: user.username, verificationUrl })
      .catch(err => console.error('Verification email failed:', err.message));

    return res.status(201).json({
      message: 'Account created successfully',
      token,
      user: safeUser(user),
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ message: 'Server error during registration' });
  }
});

// ── POST /api/auth/login ─────────────────────────────────
router.post('/login', loginValidators, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
  }

  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const valid = await user.comparePassword(password);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    return res.json({
      message: 'Login successful',
      token,
      user: safeUser(user),
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error during login' });
  }
});


// Email verification tokens are hashed at rest, single-use, and expire after 24 hours.
router.get('/verify-email/:token', async (req, res) => {
  try {
    const crypto = require('crypto');
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({ emailVerificationToken: hashedToken, emailVerificationExpires: { $gt: new Date() } })
      .select('+emailVerificationToken +emailVerificationExpires');
    if (!user) return res.status(400).json({ message: 'Verification link is invalid or has expired.' });

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });
    emailService.sendWelcome({ to: user.email, username: user.username })
      .catch(err => console.error('Welcome email failed:', err.message));
    return res.json({ message: 'Email verified. You can now use GameHub email features.' });
  } catch (err) {
    console.error('Email verification error:', err.message);
    return res.status(500).json({ message: 'Server error verifying email.' });
  }
});

router.post('/resend-verification', authMiddleware, async (req, res) => {
  try {
    if (req.user.emailVerified) return res.json({ message: 'Email is already verified.' });
    const crypto = require('crypto');
    const rawToken = crypto.randomBytes(32).toString('hex');
    req.user.emailVerificationToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    req.user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await req.user.save({ validateBeforeSave: false });
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email/${rawToken}`;
    const result = await emailService.sendEmailVerification({ to: req.user.email, username: req.user.username, verificationUrl });
    if (!result.success) return res.status(503).json({ message: 'Could not send a verification email. Try again later.' });
    return res.json({ message: 'A new verification email has been sent to your account address.' });
  } catch (err) {
    console.error('Resend verification error:', err.message);
    return res.status(500).json({ message: 'Server error sending verification email.' });
  }
});// ── GET /api/auth/me ─────────────────────────────────────
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json(user);
  } catch (err) {
    console.error('Get me error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// ── POST /api/auth/forgot-password ───────────────────────
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Always return success to prevent email enumeration attacks
    if (!user) {
      return res.json({ message: 'If that email exists, a reset link has been sent.' });
    }

    // Generate secure random token
    const crypto = require('crypto');
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    user.resetPasswordToken   = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${rawToken}`;

    // Send password reset email via Resend
    const emailResult = await emailService.sendPasswordReset({
      to: user.email,
      username: user.username,
      resetUrl,
    });

    if (!emailResult.success) {
      console.error('Password reset email delivery failed for account.');
    }
    return res.json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// ── POST /api/auth/reset-password/:token ─────────────────
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const crypto = require('crypto');
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken:   hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    }).select('+resetPasswordToken +resetPasswordExpires');

    if (!user) {
      return res.status(400).json({ message: 'Reset link is invalid or has expired.' });
    }

    // Update password and clear reset token
    user.password             = password;
    user.resetPasswordToken   = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Return a new JWT so user is logged in immediately
    const token = generateToken(user._id);
    return res.json({
      message: 'Password reset successful!',
      token,
      user: safeUser(user),
    });
  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

