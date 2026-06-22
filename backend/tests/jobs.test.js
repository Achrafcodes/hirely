require('./setup');
const request = require('supertest');
const app = require('../server');

const employerData  = { name: 'Acme Corp', email: 'employer@test.com', password: 'password123', role: 'employer' };
const employer2Data = { name: 'Other Co',  email: 'employer2@test.com', password: 'password123', role: 'employer' };
const candidateData = { name: 'Job Seeker', email: 'candidate@test.com', password: 'password123', role: 'candidate' };

const validJob = {
  title: 'Senior Engineer',
  description: 'Build great things.',
  location: 'Remote',
  type: 'full-time',
};

async function register(data) {
  const res = await request(app).post('/api/auth/register').send(data);
  return res.body.token;
}

// ── Create job ────────────────────────────────────────────────────────────────

describe('POST /api/jobs', () => {
  let employerToken, candidateToken;

  beforeEach(async () => {
    employerToken  = await register(employerData);
    candidateToken = await register(candidateData);
  });

  it('employer can create a job', async () => {
    const res = await request(app).post('/api/jobs').set('Authorization', `Bearer ${employerToken}`).send(validJob);
    expect(res.status).toBe(201);
    expect(res.body.job.title).toBe(validJob.title);
  });

  it('candidate cannot create a job — 403', async () => {
    const res = await request(app).post('/api/jobs').set('Authorization', `Bearer ${candidateToken}`).send(validJob);
    expect(res.status).toBe(403);
  });

  it('unauthenticated request returns 401', async () => {
    const res = await request(app).post('/api/jobs').send(validJob);
    expect(res.status).toBe(401);
  });

  it('returns 400 when required fields are missing', async () => {
    const res = await request(app).post('/api/jobs').set('Authorization', `Bearer ${employerToken}`).send({ title: 'No desc' });
    expect(res.status).toBe(400);
  });

  it('rejects invalid job type', async () => {
    const res = await request(app).post('/api/jobs').set('Authorization', `Bearer ${employerToken}`).send({ ...validJob, type: 'gig' });
    expect(res.status).toBe(400);
  });

  it('rejects negative salaryMin', async () => {
    const res = await request(app).post('/api/jobs').set('Authorization', `Bearer ${employerToken}`).send({ ...validJob, salaryMin: -1 });
    expect(res.status).toBe(400);
  });
});

// ── List jobs ─────────────────────────────────────────────────────────────────

describe('GET /api/jobs', () => {
  let employerToken;

  beforeEach(async () => {
    employerToken = await register(employerData);
    await request(app).post('/api/jobs').set('Authorization', `Bearer ${employerToken}`).send(validJob);
    await request(app).post('/api/jobs').set('Authorization', `Bearer ${employerToken}`).send({ ...validJob, title: 'Another Role', type: 'contract' });
  });

  it('returns list of active jobs', async () => {
    const res = await request(app).get('/api/jobs');
    expect(res.status).toBe(200);
    expect(res.body.jobs.length).toBeGreaterThanOrEqual(1);
  });

  it('filters by type', async () => {
    const res = await request(app).get('/api/jobs?type=contract');
    expect(res.status).toBe(200);
    res.body.jobs.forEach((j) => expect(j.type).toBe('contract'));
  });

  it('returns pagination metadata', async () => {
    const res = await request(app).get('/api/jobs?limit=1&page=1');
    expect(res.body).toHaveProperty('total');
    expect(res.body).toHaveProperty('pages');
  });
});

// ── Update / Delete job (ownership) ──────────────────────────────────────────

describe('PUT /api/jobs/:id — ownership', () => {
  let token1, token2, jobId;

  beforeEach(async () => {
    token1 = await register(employerData);
    token2 = await register(employer2Data);
    const res = await request(app).post('/api/jobs').set('Authorization', `Bearer ${token1}`).send(validJob);
    jobId = res.body.job._id;
  });

  it('owner can update their job', async () => {
    const res = await request(app).put(`/api/jobs/${jobId}`).set('Authorization', `Bearer ${token1}`).send({ title: 'Updated Title' });
    expect(res.status).toBe(200);
    expect(res.body.job.title).toBe('Updated Title');
  });

  it('non-owner gets 403', async () => {
    const res = await request(app).put(`/api/jobs/${jobId}`).set('Authorization', `Bearer ${token2}`).send({ title: 'Stolen' });
    expect(res.status).toBe(403);
  });
});

describe('DELETE /api/jobs/:id — ownership', () => {
  let token1, token2, jobId;

  beforeEach(async () => {
    token1 = await register(employerData);
    token2 = await register(employer2Data);
    const res = await request(app).post('/api/jobs').set('Authorization', `Bearer ${token1}`).send(validJob);
    jobId = res.body.job._id;
  });

  it('owner can delete their job', async () => {
    const res = await request(app).delete(`/api/jobs/${jobId}`).set('Authorization', `Bearer ${token1}`);
    expect(res.status).toBe(200);
  });

  it('non-owner gets 403', async () => {
    const res = await request(app).delete(`/api/jobs/${jobId}`).set('Authorization', `Bearer ${token2}`);
    expect(res.status).toBe(403);
  });

  it('candidate cannot delete a job', async () => {
    const candidateToken = await register(candidateData);
    const res = await request(app).delete(`/api/jobs/${jobId}`).set('Authorization', `Bearer ${candidateToken}`);
    expect(res.status).toBe(403);
  });
});
