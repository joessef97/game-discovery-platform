// Vercel serverless entry point.
// Every /api/* request is routed here by vercel.json; the Express app handles
// its own routing from there.
module.exports = require('../backend/app');
