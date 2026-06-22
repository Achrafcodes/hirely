require('./setup');
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');

const candidate = { name: 'Test User', email: 'candidate@test.com', password: 'password123', role: 'candidate' };
const employer  = { name: 'Test Corp',  email: 'employer@test.com',  password: 'password123', role: 'employer' };

async function registerAndVerify(data) {
  await request(app).post('/api/auth/register').send(data);
  await User.findOneAndUpdate({ email: data.email }, { isVerified: true });
}

// ── Register ─────────────────────────────────────────────────────────────────

describe('POST /api/auth/register', () => {
  it('registers a candidate and returns a JWT', async () => {
    const res = await request(app).post('/api/auth/register').send(candidate);
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('candidate');
    expect(res.body.user.password).toBeUndefined();
  });

  it('registers an employer and returns a JWT', async () => {
    const res = await request(app).post('/api/auth/register').send(employer);
    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe('employer');
  });

  it('returns 409 when email already in use', async () => {
    await request(app).post('/api/auth/register').send(candidate);
    const res = await request(app).post('/api/auth/register').send(candidate);
    expect(res.status).toBe(409);
  });

  it('returns 400 when required fields are missing', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'x@x.com' });
    expect(res.status).toBe(400);
  });

  it('rejects role: admin', async () => {
    const res = await request(app).post('/api/auth/register').send({ ...candidate, role: 'admin' });
    expect(res.status).toBe(400);
  });

  it('does not return password in response', async () => {
    const res = await request(app).post('/api/auth/register').send(candidate);
    expect(res.body.user).not.toHaveProperty('password');
  });
});

// ── Login ─────────────────────────────────────────────────────────────────────

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await registerAndVerify(candidate);
  });

  it('returns JWT on valid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: candidate.email, password: candidate.password });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('returns 403 for unverified account', async () => {
    await request(app).post('/api/auth/register').send({ ...candidate, email: 'unverified@test.com' });
    const res = await request(app).post('/api/auth/login').send({ email: 'unverified@test.com', password: candidate.password });
    expect(res.status).toBe(403);
    expect(res.body.unverified).toBe(true);
  });

  it('returns 401 on wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: candidate.email, password: 'wrongpass' });
    expect(res.status).toBe(401);
  });

  it('returns 401 on non-existent email', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'nobody@test.com', password: 'password123' });
    expect(res.status).toBe(401);
  });

  it('does not return password in response', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: candidate.email, password: candidate.password });
    expect(res.body.user).not.toHaveProperty('password');
  });

  it('handles NoSQL injection gracefully', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: { $gt: '' }, password: { $gt: '' } });
    expect(res.status).toBe(400);
  });
});

// ── Token / Protected routes ──────────────────────────────────────────────────

describe('GET /api/auth/me', () => {
  let token;

  beforeEach(async () => {
    await registerAndVerify(candidate);
    const res = await request(app).post('/api/auth/login').send({ email: candidate.email, password: candidate.password });
    token = res.body.token;
  });

  it('returns the user when token is valid', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe(candidate.email);
  });

  it('returns 401 with no token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('returns 401 with a malformed token', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer notavalidtoken');
    expect(res.status).toBe(401);
  });

  it('returns 401 with a tampered token', async () => {
    const [header, , sig] = token.split('.');
    const fakePayload = Buffer.from(JSON.stringify({ id: 'fakeid', role: 'admin' })).toString('base64');
    const tampered = `${header}.${fakePayload}.${sig}`;
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${tampered}`);
    expect(res.status).toBe(401);
  });
});
