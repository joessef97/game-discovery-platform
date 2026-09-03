const request = require('supertest');
const db = require('./helpers/db');

let app;

async function signUp(overrides = {}) {
  const res = await request(app).post('/api/auth/register').send({
    username: 'favuser',
    email: 'favuser@example.com',
    password: 'TestPass123!',
    ...overrides,
  });
  return res.body.token;
}

const GAME = { gameId: 1022, gameName: 'The Legend of Zelda', gameImage: 'https://x/y.jpg' };

beforeAll(async () => {
  await db.start();
  app = require('../app');
});
afterAll(async () => { await db.stop(); });
afterEach(async () => { await db.clear(); });

describe('favorites', () => {
  it('requires authentication on every route', async () => {
    expect((await request(app).get('/api/favorites')).status).toBe(401);
    expect((await request(app).post('/api/favorites').send(GAME)).status).toBe(401);
    expect((await request(app).delete('/api/favorites/1022')).status).toBe(401);
    expect((await request(app).get('/api/favorites/check/1022')).status).toBe(401);
  });

  it('adds, lists, checks and removes a game', async () => {
    const token = await signUp();
    const auth = `Bearer ${token}`;

    const add = await request(app).post('/api/favorites').set('Authorization', auth).send(GAME);
    expect(add.status).toBe(201);

    const list = await request(app).get('/api/favorites').set('Authorization', auth);
    expect(list.body).toHaveLength(1);
    expect(list.body[0].gameName).toBe(GAME.gameName);

    const check = await request(app).get('/api/favorites/check/1022').set('Authorization', auth);
    expect(check.body).toEqual({ isFavorite: true });

    const del = await request(app).delete('/api/favorites/1022').set('Authorization', auth);
    expect(del.status).toBe(200);

    const after = await request(app).get('/api/favorites').set('Authorization', auth);
    expect(after.body).toEqual([]);
  });

  it('rejects a duplicate', async () => {
    const token = await signUp();
    const auth = `Bearer ${token}`;
    await request(app).post('/api/favorites').set('Authorization', auth).send(GAME);

    const res = await request(app).post('/api/favorites').set('Authorization', auth).send(GAME);
    expect(res.status).toBe(400);
  });

  it('requires gameId, name and image', async () => {
    const token = await signUp();
    const res = await request(app)
      .post('/api/favorites')
      .set('Authorization', `Bearer ${token}`)
      .send({ gameId: 1 });
    expect(res.status).toBe(400);
  });

  it('returns 404 when removing something not saved', async () => {
    const token = await signUp();
    const res = await request(app)
      .delete('/api/favorites/424242')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });

  it('keeps users isolated from each other', async () => {
    const a = await signUp();
    const b = await signUp({ username: 'other', email: 'other@example.com' });

    await request(app).post('/api/favorites').set('Authorization', `Bearer ${a}`).send(GAME);

    const list = await request(app).get('/api/favorites').set('Authorization', `Bearer ${b}`);
    expect(list.body).toEqual([]);
  });

  it('orders newest first', async () => {
    const token = await signUp();
    const auth = `Bearer ${token}`;

    await request(app).post('/api/favorites').set('Authorization', auth).send(GAME);
    await request(app)
      .post('/api/favorites')
      .set('Authorization', auth)
      .send({ gameId: 2, gameName: 'Second', gameImage: 'https://x/2.jpg' });

    const list = await request(app).get('/api/favorites').set('Authorization', auth);
    expect(list.body[0].gameName).toBe('Second');
  });
});
