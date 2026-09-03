const request = require('supertest');
const db = require('./helpers/db');

let app;

// Register a user and return its auth token.
async function signUp(overrides = {}) {
  const body = {
    username: 'wishuser',
    email: 'wishuser@example.com',
    password: 'TestPass123!',
    ...overrides,
  };
  const res = await request(app).post('/api/auth/register').send(body);
  expect(res.status).toBe(201);
  return res.body.token;
}

const ZELDA = { gameId: 1022, gameName: 'The Legend of Zelda', gameImage: 'https://x/y.jpg' };

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

describe('GET /api/wishlist', () => {
  it('rejects an unauthenticated request', async () => {
    const res = await request(app).get('/api/wishlist');
    expect(res.status).toBe(401);
  });

  it('rejects a malformed token', async () => {
    const res = await request(app)
      .get('/api/wishlist')
      .set('Authorization', 'Bearer not-a-real-token');
    expect(res.status).toBe(401);
  });

  it('starts empty for a new user', async () => {
    const token = await signUp();
    const res = await request(app).get('/api/wishlist').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe('POST /api/wishlist', () => {
  it('adds a game and returns it', async () => {
    const token = await signUp();
    const res = await request(app)
      .post('/api/wishlist')
      .set('Authorization', `Bearer ${token}`)
      .send(ZELDA);

    expect(res.status).toBe(201);
    expect(res.body.item).toMatchObject({
      gameId: ZELDA.gameId,
      gameName: ZELDA.gameName,
    });
  });

  it('rejects a duplicate with 400', async () => {
    const token = await signUp();
    await request(app).post('/api/wishlist').set('Authorization', `Bearer ${token}`).send(ZELDA);

    const res = await request(app)
      .post('/api/wishlist')
      .set('Authorization', `Bearer ${token}`)
      .send(ZELDA);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already/i);
  });

  it('requires gameId and gameName', async () => {
    const token = await signUp();
    const res = await request(app)
      .post('/api/wishlist')
      .set('Authorization', `Bearer ${token}`)
      .send({ gameId: 5 });

    expect(res.status).toBe(400);
  });

  it('coerces a string gameId to a number', async () => {
    const token = await signUp();
    await request(app)
      .post('/api/wishlist')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...ZELDA, gameId: '1022' });

    const res = await request(app).get('/api/wishlist').set('Authorization', `Bearer ${token}`);
    expect(res.body[0].gameId).toBe(1022);
  });

  it('defaults a missing image to an empty string', async () => {
    const token = await signUp();
    const res = await request(app)
      .post('/api/wishlist')
      .set('Authorization', `Bearer ${token}`)
      .send({ gameId: 7, gameName: 'No Art' });

    expect(res.status).toBe(201);
    expect(res.body.item.gameImage).toBe('');
  });
});

describe('DELETE /api/wishlist/:gameId', () => {
  it('removes an existing entry', async () => {
    const token = await signUp();
    await request(app).post('/api/wishlist').set('Authorization', `Bearer ${token}`).send(ZELDA);

    const del = await request(app)
      .delete(`/api/wishlist/${ZELDA.gameId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(del.status).toBe(200);

    const list = await request(app).get('/api/wishlist').set('Authorization', `Bearer ${token}`);
    expect(list.body).toEqual([]);
  });

  it('returns 404 for a game that is not on the list', async () => {
    const token = await signUp();
    const res = await request(app)
      .delete('/api/wishlist/999999')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});

describe('GET /api/wishlist/check/:gameId', () => {
  it('reports membership accurately', async () => {
    const token = await signUp();

    const before = await request(app)
      .get(`/api/wishlist/check/${ZELDA.gameId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(before.body).toEqual({ isWishlisted: false });

    await request(app).post('/api/wishlist').set('Authorization', `Bearer ${token}`).send(ZELDA);

    const after = await request(app)
      .get(`/api/wishlist/check/${ZELDA.gameId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(after.body).toEqual({ isWishlisted: true });
  });
});

describe('wishlist isolation', () => {
  it("one user's wishlist is invisible to another", async () => {
    const tokenA = await signUp();
    const tokenB = await signUp({ username: 'userb', email: 'userb@example.com' });

    await request(app).post('/api/wishlist').set('Authorization', `Bearer ${tokenA}`).send(ZELDA);

    const b = await request(app).get('/api/wishlist').set('Authorization', `Bearer ${tokenB}`);
    expect(b.body).toEqual([]);
  });

  it('is stored separately from favorites', async () => {
    const token = await signUp();
    await request(app).post('/api/wishlist').set('Authorization', `Bearer ${token}`).send(ZELDA);

    const favs = await request(app).get('/api/favorites').set('Authorization', `Bearer ${token}`);
    expect(favs.body).toEqual([]);
  });
});
