module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  // mongodb-memory-server downloads/starts a real mongod on first run
  testTimeout: 30000,
  collectCoverageFrom: [
    'routes/**/*.js',
    'services/igdbService.js',
    'middleware/**/*.js',
  ],
};
