const request = require('supertest');
const db = require('./helpers/db');

// Stub the IGDB client so these tests never touch the network and never need
// Twitch credentials. The route logic is what is under test here.
jest.mock('../services/igdbService', () => {
  const actual = jest.requireActual('../services/igdbService');
  return {
    ...actual,
    searchGames: jest.fn(),
    getGameDetails: jest.fn(),
    getTrendingGames: jest.fn(),
    getUpcomingGames: jest.fn(),
    getTopRatedGames: jest.fn(),
    getGameBySteamId: jest.fn(),
    // keep the real mappers so response shape is genuinely exercised
    formatGameData: actual.formatGameData.bind(actual),
  };
});

const igdb = require('../services/igdbService');

let app;

const RAW = {
  id: 1022,
  name: 'The Legend of Zelda',
  cover: { url: '//images.igdb.com/igdb/image/upload/t_thumb/co1uii.jpg' },
  first_release_date: 508291200,
  rating: 80.5,
  genres: [{ name: 'Adventure' }],
  platforms: [{ name: 'NES' }],
  summary: 'A classic.',
};

beforeAll(async () => {
  await db.start();
  app = require('../app');
});
afterAll(async () => { await db.stop(); });
afterEach(async () => {
  await db.clear();
  jest.clearAllMocks();
});

describe('GET /api/games/search', () => {
  it('requires a query parameter', async () => {
    const res = await request(app).get('/api/games/search');
    expect(res.status).toBe(400);
    expect(igdb.searchGames).not.toHaveBeenCalled();
  });

  it('returns formatted results', async () => {
    igdb.searchGames.mockResolvedValue([RAW]);

    const res = await request(app).get('/api/games/search?query=zelda');
    expect(res.status).toBe(200);
    expect(res.body.results).toHaveLength(1);
    expect(res.body.results[0]).toMatchObject({ id: 1022, name: 'The Legend of Zelda' });
    expect(res.body.results[0].background_image).toMatch(/^https:/);
  });

  it('paginates via offset', async () => {
    igdb.searchGames.mockResolvedValue([]);
    await request(app).get('/api/games/search?query=zelda&page=3&page_size=10');

    const [, limit, offset] = igdb.searchGames.mock.calls[0];
    expect(Number(limit)).toBe(10);
    expect(Number(offset)).toBe(20); // (3 - 1) * 10
  });

  it('records search history for an authenticated user', async () => {
    igdb.searchGames.mockResolvedValue([RAW]);
    const reg = await request(app).post('/api/auth/register').send({
      username: 'searcher', email: 'searcher@example.com', password: 'TestPass123!',
    });
    const auth = `Bearer ${reg.body.token}`;

    await request(app).get('/api/games/search?query=metroid').set('Authorization', auth);

    const hist = await request(app).get('/api/games/user/search-history').set('Authorization', auth);
    expect(hist.body[0].query).toBe('metroid');
  });

  it('still succeeds for an anonymous user', async () => {
    igdb.searchGames.mockResolvedValue([RAW]);
    const res = await request(app).get('/api/games/search?query=zelda');
    expect(res.status).toBe(200);
  });

  it('returns 500 when IGDB fails', async () => {
    igdb.searchGames.mockRejectedValue(new Error('IGDB down'));
    const res = await request(app).get('/api/games/search?query=zelda');
    expect(res.status).toBe(500);
  });
});

describe('GET /api/games/:id', () => {
  it('returns a formatted game', async () => {
    igdb.getGameDetails.mockResolvedValue(RAW);
    const res = await request(app).get('/api/games/1022');
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('The Legend of Zelda');
  });

  it('returns 404 when the game does not exist', async () => {
    igdb.getGameDetails.mockResolvedValue(null);
    const res = await request(app).get('/api/games/999999999');
    expect(res.status).toBe(404);
  });
});

describe('GET /api/games/upcoming/list', () => {
  it('returns results and passes the hype score through', async () => {
    igdb.getUpcomingGames.mockResolvedValue([{ ...RAW, hypes: 1012 }]);
    const res = await request(app).get('/api/games/upcoming/list');

    expect(res.status).toBe(200);
    expect(res.body.results[0].hypes).toBe(1012);
    expect(res.body.count).toBe(1);
  });

  it('returns 500 when IGDB fails', async () => {
    igdb.getUpcomingGames.mockRejectedValue(new Error('boom'));
    expect((await request(app).get('/api/games/upcoming/list')).status).toBe(500);
  });
});

describe('GET /api/games/top-rated/list', () => {
  it('passes the year filter through to the service', async () => {
    igdb.getTopRatedGames.mockResolvedValue([{ ...RAW, rating_count: 1594 }]);
    await request(app).get('/api/games/top-rated/list?since=2024&page_size=5');

    const [limit, , since] = igdb.getTopRatedGames.mock.calls[0];
    expect(Number(limit)).toBe(5);
    expect(since).toBe(2024);
  });

  it('passes null when no year is given', async () => {
    igdb.getTopRatedGames.mockResolvedValue([]);
    await request(app).get('/api/games/top-rated/list');
    expect(igdb.getTopRatedGames.mock.calls[0][2]).toBeNull();
  });

  it('exposes the vote count', async () => {
    igdb.getTopRatedGames.mockResolvedValue([{ ...RAW, rating_count: 1594 }]);
    const res = await request(app).get('/api/games/top-rated/list');
    expect(res.body.results[0].rating_count).toBe(1594);
  });
});

describe('GET /api/games/steam/:steamId', () => {
  it('resolves a Steam App ID to a game', async () => {
    igdb.getGameBySteamId.mockResolvedValue({ ...RAW, id: 126290, name: 'Far Cry 6' });

    const res = await request(app).get('/api/games/steam/2369390?name=Far%20Cry%206');
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Far Cry 6');
    expect(igdb.getGameBySteamId).toHaveBeenCalledWith('2369390', 'Far Cry 6');
  });

  it('returns 404 when nothing matches', async () => {
    igdb.getGameBySteamId.mockResolvedValue(null);
    expect((await request(app).get('/api/games/steam/1')).status).toBe(404);
  });

  it('passes null when no name hint is supplied', async () => {
    igdb.getGameBySteamId.mockResolvedValue(RAW);
    await request(app).get('/api/games/steam/2369390');
    expect(igdb.getGameBySteamId).toHaveBeenCalledWith('2369390', null);
  });
});

describe('GET /api/games/user/search-history', () => {
  it('requires authentication', async () => {
    expect((await request(app).get('/api/games/user/search-history')).status).toBe(401);
  });
});
