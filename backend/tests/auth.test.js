const request = require('supertest');
const jwt = require('jsonwebtoken');
const db = require('./helpers/db');

let app;

const VALID = {
  username: 'authuser',
  email: 'authuser@example.com',
  password: 'TestPass123!',
};

beforeAll(async () => {
  await db.start();
  app = require('../app');
});

afterAll(async () => {
  await db.stop();
});

afterEach(async () => {
  await db.clear();
});

describe('POST /api/auth/register', () => {
  it('creates an account and returns a usable token', async () => {
    const res = await request(app).post('/api/auth/register').send(VALID);

    expect(res.status).toBe(201);
    expect(res.body.user).toMatchObject({ username: VALID.username, email: VALID.email });

    const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET);
    expect(decoded.userId).toBe(res.body.user.id);
  });

  it('never returns the password', async () => {
    const res = await request(app).post('/api/auth/register').send(VALID);
    expect(JSON.stringify(res.body)).not.toContain(VALID.password);
    expect(res.body.user.password).toBeUndefined();
  });

  it('rejects a duplicate email', async () => {
    await request(app).post('/api/auth/register').send(VALID);
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...VALID, username: 'different' });

    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it('rejects an invalid email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...VALID, email: 'not-an-email' });
    expect(res.status).toBe(400);
  });

  it('rejects a too-short password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...VALID, password: '123' });
    expect(res.status).toBe(400);
  });

  it('stores the password hashed, not in plain text', async () => {
    await request(app).post('/api/auth/register').send(VALID);

    const User = require('../models/User');
    const user = await User.findOne({ email: VALID.email }).select('+password');
    expect(user.password).not.toBe(VALID.password);
    expect(user.password).toMatch(/^\$2[aby]\$/); // bcrypt hash
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/register').send(VALID);
  });

  it('accepts correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: VALID.email, password: VALID.password });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
  });

  it('rejects a wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: VALID.email, password: 'WrongPassword1!' });
    expect(res.status).toBe(401);
  });

  it('rejects an unknown email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: VALID.password });
    expect(res.status).toBe(401);
  });

  it('does not reveal whether the email exists', async () => {
    const unknown = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: VALID.password });
    const wrongPass = await request(app)
      .post('/api/auth/login')
      .send({ email: VALID.email, password: 'WrongPassword1!' });

    // Same status and message either way, so the response is not a user oracle
    expect(unknown.status).toBe(wrongPass.status);
    expect(unknown.body.message).toBe(wrongPass.body.message);
  });

  it('is case-insensitive on the email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: VALID.email.toUpperCase(), password: VALID.password });
    expect(res.status).toBe(200);
  });
});

describe('GET /api/auth/me', () => {
  it('returns the current user for a valid token', async () => {
    const reg = await request(app).post('/api/auth/register').send(VALID);
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${reg.body.token}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe(VALID.email);
    expect(res.body.password).toBeUndefined();
  });

  it('rejects a missing token', async () => {
    expect((await request(app).get('/api/auth/me')).status).toBe(401);
  });

  it('rejects a token signed with the wrong secret', async () => {
    const forged = jwt.sign({ userId: '507f1f77bcf86cd799439011' }, 'wrong-secret');
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${forged}`);
    expect(res.status).toBe(401);
  });

  it('rejects an expired token', async () => {
    const expired = jwt.sign(
      { userId: '507f1f77bcf86cd799439011' },
      process.env.JWT_SECRET,
      { expiresIn: '-1s' }
    );
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${expired}`);
    expect(res.status).toBe(401);
  });
});

describe('POST /api/auth/forgot-password', () => {
  it('requires an email', async () => {
    const res = await request(app).post('/api/auth/forgot-password').send({});
    expect(res.status).toBe(400);
  });

  it('does not reveal whether an account exists', async () => {
    await request(app).post('/api/auth/register').send(VALID);

    const known = await request(app).post('/api/auth/forgot-password').send({ email: VALID.email });
    const unknown = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'nobody@example.com' });

    expect(known.status).toBe(unknown.status);
  });
});

describe('GET /api/health', () => {
  it('reports OK', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('OK');
  });
});

describe('unknown routes', () => {
  it('returns a JSON 404', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.message).toBeTruthy();
  });
});
