const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod;

// Boot an in-memory MongoDB and point the app at it. MONGODB_URI must be set
// before app.js is required, since connectDB() reads it at call time.
async function start() {
  mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongod.getUri();
  return process.env.MONGODB_URI;
}

async function stop() {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
  // app.js caches the connection on `global`; clear it so a later suite reconnects
  global._mongooseCache = undefined;
}

async function clear() {
  const { collections } = mongoose.connection;
  await Promise.all(Object.values(collections).map((c) => c.deleteMany({})));
}

module.exports = { start, stop, clear };
