import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/index.js';

describe('CineMate Backend API Test Suite', () => {
  let authToken = '';
  const testUser = {
    username: `tester_${Date.now().toString().slice(-6)}`,
    email: `tester_${Date.now()}@example.com`,
    password: 'securePassword123',
  };

  it('1. GET /api/health should return ok status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.app).toBe('CineMate API');
  });

  it('2. POST /api/auth/register should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.username).toBe(testUser.username);
    authToken = res.body.token;
  });

  it('3. POST /api/auth/login should authenticate the user and return JWT', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        identifier: testUser.email,
        password: testUser.password,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
  });

  it('4. GET /api/movies/featured should return a spotlight title', async () => {
    const res = await request(app).get('/api/movies/featured');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.id).toBeDefined();
  });

  it('5. GET /api/movies/trending should return trending items', async () => {
    const res = await request(app).get('/api/movies/trending');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('6. GET /api/movies/search should filter items by title', async () => {
    const res = await request(app).get('/api/movies/search?q=Interstellar');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.results.length).toBeGreaterThan(0);
    expect(res.body.results[0].title).toContain('Interstellar');
  });

  it('7. GET /api/movies/moods should return available moods catalog', async () => {
    const res = await request(app).get('/api/movies/moods');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.some((m: any) => m.id === 'thriller_night')).toBe(true);
  });

  it('8. GET /api/movies/recommendations/mood should return transparent recommendations', async () => {
    const res = await request(app).get('/api/movies/recommendations/mood?mood=thriller_night');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].recommendationReason).toBeDefined();
    expect(res.body.data[0].matchScore).toBeGreaterThanOrEqual(60);
  });

  it('9. POST /api/watchlist should add title and prevent duplicates', async () => {
    const payload = {
      tmdbId: 155,
      mediaType: 'movie',
      title: 'The Dark Knight',
      posterPath: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
      voteAverage: 8.5,
      releaseDate: '2008-07-16',
    };

    // First add
    const res1 = await request(app)
      .post('/api/watchlist')
      .set('Authorization', `Bearer ${authToken}`)
      .send(payload);

    expect(res1.status).toBe(201);
    expect(res1.body.success).toBe(true);

    // Duplicate add should be rejected
    const res2 = await request(app)
      .post('/api/watchlist')
      .set('Authorization', `Bearer ${authToken}`)
      .send(payload);

    expect(res2.status).toBe(409);
  });

  it('10. POST /api/reviews should create a review and compute CineMate community score', async () => {
    const reviewPayload = {
      tmdbId: 155,
      mediaType: 'movie',
      title: 'The Dark Knight',
      rating: 9,
      content: 'Ledger gave an unforgettable, Oscar-winning performance.',
    };

    const createRes = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${authToken}`)
      .send(reviewPayload);

    expect(createRes.status).toBe(201);
    expect(createRes.body.success).toBe(true);

    const getRes = await request(app).get('/api/reviews/movie/155?type=movie');
    expect(getRes.status).toBe(200);
    expect(getRes.body.count).toBeGreaterThan(0);
    expect(getRes.body.communityAverage).toBeGreaterThanOrEqual(1);
  });

  // --- UPGRADED GLOBAL DATABASE & LANGUAGE TESTS ---

  it('11. GET /api/movies/languages should return supported regional languages', async () => {
    const res = await request(app).get('/api/movies/languages');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.some((l: any) => l.code === 'ta' && l.name === 'Tamil')).toBe(true);
    expect(res.body.data.some((l: any) => l.code === 'te' && l.name === 'Telugu')).toBe(true);
    expect(res.body.data.some((l: any) => l.code === 'ml' && l.name === 'Malayalam')).toBe(true);
    expect(res.body.data.some((l: any) => l.code === 'kn' && l.name === 'Kannada')).toBe(true);
    expect(res.body.data.some((l: any) => l.code === 'hi' && l.name === 'Hindi')).toBe(true);
  });

  it('12. GET /api/movies/search?q=Leo&language=ta should prominently find Tamil movie Leo (2023)', async () => {
    const res = await request(app).get('/api/movies/search?q=Leo&language=ta');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.results.length).toBeGreaterThan(0);

    const topResult = res.body.results[0];
    expect(topResult.title).toBe('Leo');
    expect(topResult.original_language).toBe('ta');
    expect(topResult.release_date).toContain('2023');
    expect(topResult.trailerKey).toBeDefined();
  });

  it('13. GET /api/movies/rankings?language=ta&type=top10 should return Top 10 Tamil movies with ranks', async () => {
    const res = await request(app).get('/api/movies/rankings?language=ta&type=top10');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.rankType).toBe('top10');
    expect(res.body.results.length).toBeGreaterThan(0);
    expect(res.body.results[0].rank).toBe(1);
    expect(res.body.results[0].original_language).toBe('ta');
  });

  it('14. GET /api/movies/rankings?language=te&type=top50 should return Top 50 Telugu movies with ranks', async () => {
    const res = await request(app).get('/api/movies/rankings?language=te&type=top50');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.rankType).toBe('top50');
    expect(res.body.results.length).toBeGreaterThan(0);
    expect(res.body.results[0].rank).toBe(1);
    expect(res.body.results[0].original_language).toBe('te');
  });

  it('15. GET /api/movies/discover?language=ml should discover Malayalam movies with pagination', async () => {
    const res = await request(app).get('/api/movies/discover?language=ml&page=1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.page).toBe(1);
    expect(res.body.results.length).toBeGreaterThan(0);
    expect(res.body.results.every((m: any) => m.original_language === 'ml')).toBe(true);
  });

  it('16. GET /api/movies/ott-releases?language=ta should return Tamil OTT releases with provider info', async () => {
    const res = await request(app).get('/api/movies/ott-releases?language=ta');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.results.length).toBeGreaterThan(0);
    expect(res.body.results[0].providers || res.body.results[0].ott_provider_name).toBeDefined();
  });
});
