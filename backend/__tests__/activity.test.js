import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../server.js';
import Activity from '../models/Activity.js';

let mongod;

const registerAndLogin = async (user) => {
  const res = await request(app).post('/api/auth/register').send(user);
  return { token: res.body.token, userId: res.body.user?.id || res.body.user?._id };
};

beforeAll(async () => {
  process.env.JWT_SECRET = 'testsecret';
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
});

describe('Activity routes', () => {
  const user = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
    firstName: 'Test',
    lastName: 'User',
  };

  it('gets user activities after folder creation', async () => {
    const { token } = await registerAndLogin(user);

    // Create a folder to generate activity
    await request(app)
      .post('/api/folders')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test Folder' });

    const res = await request(app)
      .get('/api/activity/my-activities')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.activities).toBeDefined();
    expect(res.body.activities.length).toBeGreaterThan(0);
    expect(res.body.pagination).toBeDefined();
  });

  it('paginates activities correctly', async () => {
    const { token } = await registerAndLogin({ ...user, username: 'user2', email: 'user2@example.com' });

    // Create multiple folders
    for (let i = 0; i < 5; i++) {
      await request(app)
        .post('/api/folders')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: `Folder ${i}` });
    }

    const res = await request(app)
      .get('/api/activity/my-activities?limit=3&skip=0')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.activities.length).toBeLessThanOrEqual(3);
    expect(res.body.pagination.limit).toBe(3);
  });

  it('gets all activities', async () => {
    const { token } = await registerAndLogin({ ...user, username: 'admin', email: 'admin@example.com' });

    await request(app)
      .post('/api/folders')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Admin Folder' });

    const res = await request(app)
      .get('/api/activity/all')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.activities).toBeDefined();
  });

  it('filters activities by action type', async () => {
    const { token } = await registerAndLogin({ ...user, username: 'filter', email: 'filter@example.com' });

    await request(app)
      .post('/api/folders')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Filtered Folder' });

    const res = await request(app)
      .get('/api/activity/all?action=FOLDER_CREATE')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.activities.every((a) => a.action === 'FOLDER_CREATE')).toBe(true);
  });

  it('gets activity statistics', async () => {
    const { token } = await registerAndLogin({ ...user, username: 'stats', email: 'stats@example.com' });

    await request(app)
      .post('/api/folders')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Stats Folder' });

    const res = await request(app)
      .get('/api/activity/stats')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.stats).toBeDefined();
    expect(Array.isArray(res.body.stats)).toBe(true);
  });

  it('validates pagination parameters', async () => {
    const { token } = await registerAndLogin({ ...user, username: 'validate', email: 'validate@example.com' });

    const res = await request(app)
      .get('/api/activity/my-activities?limit=invalid')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
  });
});
