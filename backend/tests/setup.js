// Deterministic env for every test run. Must be set before app.js is required,
// since it reads these at module load.
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-not-a-real-key';
process.env.TWITCH_CLIENT_ID = 'test-client-id';
process.env.TWITCH_CLIENT_SECRET = 'test-client-secret';
process.env.FRONTEND_URL = 'http://localhost:3000';

// Never send real email from a test, and keep the output readable.
jest.mock('../services/emailService', () => ({
  send: jest.fn().mockResolvedValue({ success: true }),
  sendWelcome: jest.fn().mockResolvedValue({ success: true }),
  sendPasswordReset: jest.fn().mockResolvedValue({ success: true }),
  sendTest: jest.fn().mockResolvedValue({ success: true }),
}));
