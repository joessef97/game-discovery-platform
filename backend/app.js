const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes      = require('./routes/auth');
const gameRoutes      = require('./routes/games');
const favoriteRoutes  = require('./routes/favorites');
const emailRoutes     = require('./routes/email');
const wishlistRoutes  = require('./routes/wishlist');

const app = express();

// ── MongoDB (serverless-safe) ─────────────────────────────
// On Vercel each invocation may reuse a warm container but re-run this module.
// Cache the connection promise on `global` so we open one pool per container
// instead of a new connection per request, which would exhaust Atlas limits.
let cached = global._mongooseCache;
if (!cached) cached = global._mongooseCache = { conn: null, promise: null };

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not set');
    cached.promise = mongoose
      .connect(process.env.MONGODB_URI, {
        // Fail fast rather than hanging until the function times out
        serverSelectionTimeoutMS: 8000,
        // Queueing commands before connect() resolves hides failures in serverless
        bufferCommands: false,
        maxPoolSize: 10,
      })
      .then((m) => {
        console.log('✅ Connected to MongoDB');
        return m;
      })
      .catch((err) => {
        // Reset so the next invocation retries instead of reusing a failed promise
        cached.promise = null;
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

// ── CORS ──────────────────────────────────────────────────
// Frontend and API share an origin on Vercel, so same-origin calls send no
// Origin header and pass through. The allowlist still covers local dev and any
// separately-hosted frontend.
const allowedOrigins = [
  ...(process.env.FRONTEND_URL || 'http://localhost:3000').split(',').map(o => o.trim()),
  'http://localhost:3000',
  'http://localhost:3001',
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    // Allow this deployment's own Vercel URLs (incl. preview deployments)
    if (/^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin)) return cb(null, true);
    cb(new Error(`CORS policy: origin ${origin} not allowed`));
  },
  credentials: true,
}));

// ── Rate limiting ─────────────────────────────────────────
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: 'Too many requests from this IP, please try again later.',
  // Serverless sits behind a proxy; use the forwarded client IP
  standardHeaders: true,
  legacyHeaders: false,
}));

// ── Body parsing ──────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Ensure a DB connection before any route that needs one ─
app.use(async (_req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    res.status(503).json({ message: 'Database unavailable' });
  }
});

// ── Routes ────────────────────────────────────────────────
app.use('/api/auth',      authRoutes);
app.use('/api/games',     gameRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/email',     emailRoutes);
app.use('/api/wishlist',  wishlistRoutes);

// ── Health check ──────────────────────────────────────────
app.get('/api/health', (_req, res) =>
  res.json({ status: 'OK', message: 'GameHub API is running' })
);

// ── 404 ───────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));

// ── Error handler ─────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

module.exports = app;
module.exports.connectDB = connectDB;
