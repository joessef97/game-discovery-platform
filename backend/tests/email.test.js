const request = require('supertest');
const db = require('./helpers/db');

jest.mock('../services/emailService', () => ({
  sendTest: jest.fn().mockResolvedValue({ success: true, id: 'email-id' }),
  sendWelcome: jest.fn().mockResolvedValue({ success: true }),
}));

let app;
beforeAll(async () => { await db.start(); app = require('../app'); });
afterAll(async () => { await db.stop(); });
afterEach(async () => { await db.clear(); jest.clearAllMocks(); });

describe('email test endpoint', () => {
  it('requires authentication', async () => {
    expect((await request(app).post('/api/email/test').send({})).status).toBe(401);
  });

  it('always sends only to the authenticated account email', async () => {
    const registered = await request(app).post('/api/auth/register').send({ username: 'mailuser', email: 'mailuser@example.com', password: 'TestPass123!' });
    const response = await request(app).post('/api/email/test').set('Authorization', `Bearer ${registered.body.token}`).send({ to: 'attacker@example.com' });
    expect(response.status).toBe(200);
    expect(require('../services/emailService').sendTest).toHaveBeenCalledWith({ to: 'mailuser@example.com' });
  });

  it('does not expose a public test endpoint', async () => {
    expect((await request(app).post('/api/email/test-public').send({ to: 'x@example.com', secret: 'gamehub-test' })).status).toBe(404);
  });
});
