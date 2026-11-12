const request = require('supertest');
const db = require('./helpers/db');

jest.mock('../services/emailService', () => ({
  sendTest: jest.fn().mockResolvedValue({ success: true, id: 'email-id' }),
  sendWelcome: jest.fn().mockResolvedValue({ success: true }),
  sendEmailVerification: jest.fn().mockResolvedValue({ success: true }),
}));

let app;
beforeAll(async () => { await db.start(); app = require('../app'); });
afterAll(async () => { await db.stop(); });
afterEach(async () => { await db.clear(); jest.clearAllMocks(); });

describe('email test endpoint', () => {
  it('requires authentication', async () => {
    expect((await request(app).post('/api/email/test').send({})).status).toBe(401);
  });

  it('blocks test mail until the account email is verified', async () => {
    const registered = await request(app).post('/api/auth/register').send({ username: 'unverified', email: 'unverified@example.com', password: 'TestPass123!' });
    const response = await request(app).post('/api/email/test').set('Authorization', `Bearer ${registered.body.token}`).send({});
    expect(response.status).toBe(403);
    expect(require('../services/emailService').sendTest).not.toHaveBeenCalled();
  });

  it('verifies the registered email, then sends test mail only there', async () => {
    const registered = await request(app).post('/api/auth/register').send({ username: 'mailuser', email: 'mailuser@example.com', password: 'TestPass123!' });
    expect(registered.body.user.emailVerified).toBe(false);
    const verificationUrl = require('../services/emailService').sendEmailVerification.mock.calls[0][0].verificationUrl;
    const token = verificationUrl.split('/').pop();
    expect((await request(app).get(`/api/auth/verify-email/${token}`)).status).toBe(200);

    const response = await request(app).post('/api/email/test').set('Authorization', `Bearer ${registered.body.token}`).send({ to: 'attacker@example.com' });
    expect(response.status).toBe(200);
    expect(require('../services/emailService').sendTest).toHaveBeenCalledWith({ to: 'mailuser@example.com' });
  });

  it('does not expose a public test endpoint', async () => {
    expect((await request(app).post('/api/email/test-public').send({ to: 'x@example.com', secret: 'gamehub-test' })).status).toBe(404);
  });

  it('resends a fresh verification link to the account address', async () => {
    const registered = await request(app).post('/api/auth/register').send({ username: 'resenduser', email: 'resenduser@example.com', password: 'TestPass123!' });
    const response = await request(app).post('/api/auth/resend-verification').set('Authorization', `Bearer ${registered.body.token}`).send({});
    expect(response.status).toBe(200);
    const verificationUrl = require('../services/emailService').sendEmailVerification.mock.calls.slice(-1)[0][0].verificationUrl;
    expect(verificationUrl).toContain('/verify-email/');
  });});
