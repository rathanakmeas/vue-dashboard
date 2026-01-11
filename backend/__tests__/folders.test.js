import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../server.js';
import Folder from '../models/Folder.js';

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

describe('Folder routes', () => {
  const userA = {
    username: 'alice',
    email: 'alice@example.com',
    password: 'password123',
    firstName: 'Alice',
    lastName: 'A'
  };

  const userB = {
    username: 'bob',
    email: 'bob@example.com',
    password: 'password123',
    firstName: 'Bob',
    lastName: 'B'
  };

  it('creates a folder and enforces validation', async () => {
    const { token } = await registerAndLogin(userA);

    const badRes = await request(app)
      .post('/api/folders')
      .set('Authorization', `Bearer ${token}`)
      .send({ description: 'no name' });
    expect(badRes.status).toBe(400);

    const res = await request(app)
      .post('/api/folders')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'My Folder', description: 'desc' });

    expect(res.status).toBe(201);
    expect(res.body.folder.name).toBe('My Folder');
  });

  it('paginates and filters folders', async () => {
    const { token } = await registerAndLogin({ ...userA, username: 'alice2', email: 'alice2@example.com' });

    await Promise.all(
      ['F1', 'F2', 'F3'].map((name) =>
        request(app)
          .post('/api/folders')
          .set('Authorization', `Bearer ${token}`)
          .send({ name })
      )
    );

    const res = await request(app)
      .get('/api/folders?page=1&pageSize=2')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(2);
    expect(res.body.total).toBe(3);
    expect(res.body.pageSize).toBe(2);
  });

  it('prevents non-owners from updating', async () => {
    const { token: tokenA } = await registerAndLogin({ ...userA, username: 'alice3', email: 'alice3@example.com' });
    const { token: tokenB } = await registerAndLogin({ ...userB, username: 'bob3', email: 'bob3@example.com' });

    const createRes = await request(app)
      .post('/api/folders')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ name: 'Owner Folder' });

    const folderId = createRes.body.folder._id;

    const updateRes = await request(app)
      .put(`/api/folders/${folderId}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ name: 'Hack' });

    expect(updateRes.status).toBe(403);
  });

  it('shares and unshares with another user', async () => {
    const { token: tokenA } = await registerAndLogin({ ...userA, username: 'alice4', email: 'alice4@example.com' });
    const { userId: userBId } = await registerAndLogin({ ...userB, username: 'bob4', email: 'bob4@example.com' });

    const createRes = await request(app)
      .post('/api/folders')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ name: 'Shareable' });

    const folderId = createRes.body.folder._id;
    const shareRes = await request(app)
      .post(`/api/folders/${folderId}/share`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ userId: userBId });

    expect(shareRes.status).toBe(200);
    expect(shareRes.body.folder.sharedWith.length).toBe(1);

    const unshareRes = await request(app)
      .post(`/api/folders/${folderId}/unshare`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ userId: userBId });

    expect(unshareRes.status).toBe(200);
    expect(unshareRes.body.folder.sharedWith.length).toBe(0);
  });

  it('deletes a folder', async () => {
    const { token } = await registerAndLogin({ ...userA, username: 'alice5', email: 'alice5@example.com' });

    const createRes = await request(app)
      .post('/api/folders')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'DeleteMe' });

    const folderId = createRes.body.folder._id;

    const delRes = await request(app)
      .delete(`/api/folders/${folderId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(delRes.status).toBe(200);
    const exists = await Folder.findById(folderId);
    expect(exists).toBeNull();
  });
});
