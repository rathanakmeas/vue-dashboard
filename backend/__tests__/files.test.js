import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../server.js';
import File from '../models/File.js';
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

describe('File routes', () => {
  const userA = {
    username: 'alice',
    email: 'alice@example.com',
    password: 'password123',
    firstName: 'Alice',
    lastName: 'A',
  };

  const userB = {
    username: 'bob',
    email: 'bob@example.com',
    password: 'password123',
    firstName: 'Bob',
    lastName: 'B',
  };

  it('uploads a file to a folder', async () => {
    const { token } = await registerAndLogin(userA);

    const folderRes = await request(app)
      .post('/api/folders')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Docs' });

    const folderId = folderRes.body.folder._id;

    const fileRes = await request(app)
      .post(`/api/files/${folderId}/upload`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'test.pdf',
        fileUrl: 'https://example.com/test.pdf',
        fileSize: 1024,
        fileType: 'application/pdf',
      });

    expect(fileRes.status).toBe(201);
    expect(fileRes.body.file.name).toBe('test.pdf');
    expect(fileRes.body.file.folderId).toBe(folderId);
  });

  it('enforces validation on file upload', async () => {
    const { token } = await registerAndLogin({ ...userA, username: 'alice2', email: 'alice2@example.com' });

    const folderRes = await request(app)
      .post('/api/folders')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Docs' });

    const folderId = folderRes.body.folder._id;

    const badRes = await request(app)
      .post(`/api/files/${folderId}/upload`)
      .set('Authorization', `Bearer ${token}`)
      .send({ fileUrl: 'https://example.com/test.pdf' }); // missing name

    expect(badRes.status).toBe(400);
  });

  it('gets files in a folder', async () => {
    const { token } = await registerAndLogin({ ...userA, username: 'alice3', email: 'alice3@example.com' });

    const folderRes = await request(app)
      .post('/api/folders')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Images' });

    const folderId = folderRes.body.folder._id;

    await request(app)
      .post(`/api/files/${folderId}/upload`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'img1.jpg', fileUrl: 'https://example.com/img1.jpg' });

    await request(app)
      .post(`/api/files/${folderId}/upload`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'img2.jpg', fileUrl: 'https://example.com/img2.jpg' });

    const filesRes = await request(app)
      .get(`/api/files/${folderId}/files`)
      .set('Authorization', `Bearer ${token}`);

    expect(filesRes.status).toBe(200);
    expect(filesRes.body.files.length).toBe(2);
  });

  it('prevents non-owners from uploading to folder', async () => {
    const { token: tokenA } = await registerAndLogin({ ...userA, username: 'alice4', email: 'alice4@example.com' });
    const { token: tokenB } = await registerAndLogin({ ...userB, username: 'bob4', email: 'bob4@example.com' });

    const folderRes = await request(app)
      .post('/api/folders')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ name: 'Private' });

    const folderId = folderRes.body.folder._id;

    const uploadRes = await request(app)
      .post(`/api/files/${folderId}/upload`)
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ name: 'hack.txt', fileUrl: 'https://example.com/hack.txt' });

    expect(uploadRes.status).toBe(403);
  });

  it('allows shared folder access for reading files', async () => {
    const { token: tokenA } = await registerAndLogin({ ...userA, username: 'alice5', email: 'alice5@example.com' });
    const { token: tokenB, userId: userBId } = await registerAndLogin({
      ...userB,
      username: 'bob5',
      email: 'bob5@example.com',
    });

    const folderRes = await request(app)
      .post('/api/folders')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ name: 'Shared' });

    const folderId = folderRes.body.folder._id;

    await request(app)
      .post(`/api/files/${folderId}/upload`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ name: 'shared.txt', fileUrl: 'https://example.com/shared.txt' });

    await request(app)
      .post(`/api/folders/${folderId}/share`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ userId: userBId });

    const filesRes = await request(app)
      .get(`/api/files/${folderId}/files`)
      .set('Authorization', `Bearer ${tokenB}`);

    expect(filesRes.status).toBe(200);
    expect(filesRes.body.files.length).toBe(1);
  });

  it('updates a file name', async () => {
    const { token } = await registerAndLogin({ ...userA, username: 'alice6', email: 'alice6@example.com' });

    const folderRes = await request(app)
      .post('/api/folders')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Docs' });

    const folderId = folderRes.body.folder._id;

    const fileRes = await request(app)
      .post(`/api/files/${folderId}/upload`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'old.txt', fileUrl: 'https://example.com/old.txt' });

    const fileId = fileRes.body.file._id;

    const updateRes = await request(app)
      .put(`/api/files/${fileId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'new.txt' });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.file.name).toBe('new.txt');
  });

  it('deletes a file', async () => {
    const { token } = await registerAndLogin({ ...userA, username: 'alice7', email: 'alice7@example.com' });

    const folderRes = await request(app)
      .post('/api/folders')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Trash' });

    const folderId = folderRes.body.folder._id;

    const fileRes = await request(app)
      .post(`/api/files/${folderId}/upload`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'delete.txt', fileUrl: 'https://example.com/delete.txt' });

    const fileId = fileRes.body.file._id;

    const delRes = await request(app).delete(`/api/files/${fileId}`).set('Authorization', `Bearer ${token}`);

    expect(delRes.status).toBe(200);

    const exists = await File.findById(fileId);
    expect(exists).toBeNull();
  });
});
