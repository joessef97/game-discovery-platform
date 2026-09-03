// Local development entry point.
// The Express app itself lives in app.js so it can also be mounted as a
// serverless function on Vercel (see /api/index.js).
require('dotenv').config();

const app = require('./app');
const { connectDB } = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);

// Connect eagerly in local dev so connection problems surface at boot
// rather than on the first request.
connectDB().catch(err =>
  console.error('❌ MongoDB connection error:', err.message)
);
