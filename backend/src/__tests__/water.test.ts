process.env.DB_PATH = ':memory:';

import request from 'supertest';
import app from '../app';

let token: string;

beforeAll(async () => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ email: 'water@test.com', password: 'password123' });
  token = res.body.token;
});

function auth() {
  return { Authorization: `Bearer ${token}` };
}

describe('Water Routes', () => {
  describe('POST /api/water', () => {
    it('should add a water entry', async () => {
      const res = await request(app)
        .post('/api/water')
        .set(auth())
        .send({ amount_ml: 250, note: 'morning glass' });
      expect(res.status).toBe(201);
      expect(res.body.entry.amount_ml).toBe(250);
      expect(res.body.entry.note).toBe('morning glass');
      expect(res.body.entry.id).toBeDefined();
    });

    it('should add entry without note', async () => {
      const res = await request(app).post('/api/water').set(auth()).send({ amount_ml: 500 });
      expect(res.status).toBe(201);
      expect(res.body.entry.amount_ml).toBe(500);
      expect(res.body.entry.note).toBeNull();
    });

    it('should reject invalid amount', async () => {
      const res = await request(app).post('/api/water').set(auth()).send({ amount_ml: -100 });
      expect(res.status).toBe(400);
    });

    it('should reject missing amount', async () => {
      const res = await request(app).post('/api/water').set(auth()).send({ note: 'no amount' });
      expect(res.status).toBe(400);
    });

    it('should reject unauthenticated requests', async () => {
      const res = await request(app).post('/api/water').send({ amount_ml: 250 });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/water/today', () => {
    it("should return today's entries", async () => {
      const res = await request(app).get('/api/water/today').set(auth());
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.entries)).toBe(true);
      expect(res.body.entries.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('PUT /api/water/:id', () => {
    it('should update an existing entry', async () => {
      // Get today's entries to find one to edit
      const todayRes = await request(app).get('/api/water/today').set(auth());
      const entryId = todayRes.body.entries[0].id;

      const res = await request(app)
        .put(`/api/water/${entryId}`)
        .set(auth())
        .send({ amount_ml: 300, note: 'updated' });
      expect(res.status).toBe(200);
      expect(res.body.entry.amount_ml).toBe(300);
      expect(res.body.entry.note).toBe('updated');
    });

    it('should reject update with invalid amount', async () => {
      const todayRes = await request(app).get('/api/water/today').set(auth());
      const entryId = todayRes.body.entries[0].id;

      const res = await request(app)
        .put(`/api/water/${entryId}`)
        .set(auth())
        .send({ amount_ml: 0 });
      expect(res.status).toBe(400);
    });

    it('should return 404 for non-existent entry', async () => {
      const res = await request(app).put('/api/water/99999').set(auth()).send({ amount_ml: 100 });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/water/:id', () => {
    it('should delete an existing entry', async () => {
      // Add an entry to delete
      const addRes = await request(app).post('/api/water').set(auth()).send({ amount_ml: 100 });
      const entryId = addRes.body.entry.id;

      const res = await request(app).delete(`/api/water/${entryId}`).set(auth());
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 for non-existent entry', async () => {
      const res = await request(app).delete('/api/water/99999').set(auth());
      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/water/weekly', () => {
    it('should return 7 days of data', async () => {
      const res = await request(app).get('/api/water/weekly').set(auth());
      expect(res.status).toBe(200);
      expect(res.body.weekly).toHaveLength(7);
      res.body.weekly.forEach((day: { date: string; total_ml: number }) => {
        expect(day).toHaveProperty('date');
        expect(day).toHaveProperty('total_ml');
      });
    });

    it('should include today with logged amounts', async () => {
      const res = await request(app).get('/api/water/weekly').set(auth());
      const today = new Date().toISOString().split('T')[0];
      const todayData = res.body.weekly.find((d: { date: string }) => d.date === today);
      expect(todayData).toBeDefined();
      expect(todayData.total_ml).toBeGreaterThan(0);
    });
  });

  describe('GET /api/water/streak', () => {
    it('should return a streak count', async () => {
      const res = await request(app).get('/api/water/streak').set(auth());
      expect(res.status).toBe(200);
      expect(typeof res.body.streak).toBe('number');
    });
  });

  describe('PUT /api/water/goal', () => {
    it('should update the daily goal', async () => {
      const res = await request(app)
        .put('/api/water/goal')
        .set(auth())
        .send({ daily_goal_ml: 3000 });
      expect(res.status).toBe(200);
      expect(res.body.daily_goal_ml).toBe(3000);
    });

    it('should reject invalid goal', async () => {
      const res = await request(app)
        .put('/api/water/goal')
        .set(auth())
        .send({ daily_goal_ml: -500 });
      expect(res.status).toBe(400);
    });

    it('should reject missing goal', async () => {
      const res = await request(app).put('/api/water/goal').set(auth()).send({});
      expect(res.status).toBe(400);
    });
  });

  describe('Data isolation', () => {
    it('should not show entries from another user', async () => {
      // Register a second user
      const regRes = await request(app)
        .post('/api/auth/register')
        .send({ email: 'other@test.com', password: 'password123' });
      const otherToken = regRes.body.token;

      // Second user should have no entries
      const res = await request(app)
        .get('/api/water/today')
        .set({ Authorization: `Bearer ${otherToken}` });
      expect(res.status).toBe(200);
      expect(res.body.entries).toHaveLength(0);
    });
  });
});
