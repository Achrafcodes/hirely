require('./setup');
const request = require('supertest');
const app = require('../server');

const employerData  = { name: 'Acme Corp',  email: 'employer@test.com',  password: 'password123', role: 'employer' };
const candidate1Data = { name: 'Alice',      email: 'alice@test.com',     password: 'password123', role: 'candidate' };
const candidate2Data = { name: 'Bob',        email: 'bob@test.com',       password: 'password123', role: 'candidate' };

const validJob = { title: 'Engineer', description: 'Build things.', location: 'Remote', type: 'full-time' };

async function register(data) {
  const res = await request(app).post('/api/auth/register').send(data);
  return { token: res.body.token, id: res.body.user._id };
}

async function applyToJob(jobId, candidateToken) {
  return request(app)
    .post(`/api/jobs/${jobId}/apply`)
    .set('Authorization', `Bearer ${candidateToken}`)
    .field('coverLetter', 'I am a great fit.')
    .attach('resume', Buffer.from('%PDF-1.4 fake'), { filename: 'cv.pdf', contentType: 'application/pdf' });
}

// ── Apply ─────────────────────────────────────────────────────────────────────

describe('POST /api/jobs/:id/apply', () => {
  let employerToken, candidateToken, jobId;

  beforeEach(async () => {
    ({ token: employerToken } = await register(employerData));
    ({ token: candidateToken } = await register(candidate1Data));
    const jobRes = await request(app).post('/api/jobs').set('Authorization', `Bearer ${employerToken}`).send(validJob);
    jobId = jobRes.body.job._id;

    // Mock multer upload so tests don't hit Cloudinary
    jest.mock('../middleware/upload', () => {
      const multer = require('multer');
      const storage = multer.memoryStorage();
      return multer({ storage });
    });
  });

  it('employer cannot apply to a job — 403', async () => {
    const res = await request(app)
      .post(`/api/jobs/${jobId}/apply`)
      .set('Authorization', `Bearer ${employerToken}`)
      .field('coverLetter', 'test');
    expect(res.status).toBe(403);
  });

  it('unauthenticated request returns 401', async () => {
    const res = await request(app).post(`/api/jobs/${jobId}/apply`).field('coverLetter', 'test');
    expect(res.status).toBe(401);
  });

  it('returns 404 for non-existent job', async () => {
    const fakeId = '64f000000000000000000000';
    const res = await request(app)
      .post(`/api/jobs/${fakeId}/apply`)
      .set('Authorization', `Bearer ${candidateToken}`)
      .field('coverLetter', 'test');
    expect(res.status).toBe(404);
  });
});

// ── Application management ────────────────────────────────────────────────────

describe('GET /api/applications/me', () => {
  let candidateToken, employerToken;

  beforeEach(async () => {
    ({ token: candidateToken } = await register(candidate1Data));
    ({ token: employerToken }  = await register(employerData));
  });

  it('candidate can fetch their own applications', async () => {
    const res = await request(app).get('/api/applications/me').set('Authorization', `Bearer ${candidateToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.applications)).toBe(true);
  });

  it('employer cannot access candidate applications — 403', async () => {
    const res = await request(app).get('/api/applications/me').set('Authorization', `Bearer ${employerToken}`);
    expect(res.status).toBe(403);
  });

  it('unauthenticated returns 401', async () => {
    const res = await request(app).get('/api/applications/me');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/jobs/:id/applicants', () => {
  let token1, token2, jobId;

  beforeEach(async () => {
    ({ token: token1 } = await register(employerData));
    ({ token: token2 } = await register({ ...employerData, email: 'emp2@test.com' }));
    const jobRes = await request(app).post('/api/jobs').set('Authorization', `Bearer ${token1}`).send(validJob);
    jobId = jobRes.body.job._id;
  });

  it('job owner can view applicants', async () => {
    const res = await request(app).get(`/api/jobs/${jobId}/applicants`).set('Authorization', `Bearer ${token1}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.applications)).toBe(true);
  });

  it('non-owner employer gets 403', async () => {
    const res = await request(app).get(`/api/jobs/${jobId}/applicants`).set('Authorization', `Bearer ${token2}`);
    expect(res.status).toBe(403);
  });
});

// ── Status update ─────────────────────────────────────────────────────────────

describe('PATCH /api/applications/:id/status', () => {
  let employerToken, candidateToken, appId, jobId;

  beforeEach(async () => {
    ({ token: employerToken }  = await register(employerData));
    ({ token: candidateToken } = await register(candidate1Data));

    const jobRes = await request(app).post('/api/jobs').set('Authorization', `Bearer ${employerToken}`).send(validJob);
    jobId = jobRes.body.job._id;

    // Directly seed an application via DB helper since Cloudinary upload is external
    const Application = require('../models/Application');
    const Job = require('../models/Job');
    const User = require('../models/User');
    const candidateDoc = await User.findOne({ email: candidate1Data.email });
    const jobDoc = await Job.findById(jobId);
    const app_ = await Application.create({ job: jobDoc._id, candidate: candidateDoc._id, resumeUrl: 'http://example.com/cv.pdf' });
    appId = app_._id.toString();
  });

  it('employer can update application status', async () => {
    const res = await request(app)
      .patch(`/api/applications/${appId}/status`)
      .set('Authorization', `Bearer ${employerToken}`)
      .send({ status: 'reviewed' });
    expect(res.status).toBe(200);
    expect(res.body.application.status).toBe('reviewed');
  });

  it('rejects invalid status value', async () => {
    const res = await request(app)
      .patch(`/api/applications/${appId}/status`)
      .set('Authorization', `Bearer ${employerToken}`)
      .send({ status: 'promoted' });
    expect(res.status).toBe(400);
  });

  it('candidate cannot update application status', async () => {
    const res = await request(app)
      .patch(`/api/applications/${appId}/status`)
      .set('Authorization', `Bearer ${candidateToken}`)
      .send({ status: 'hired' });
    expect(res.status).toBe(403);
  });
});

// ── Withdraw ──────────────────────────────────────────────────────────────────

describe('DELETE /api/applications/:id', () => {
  let token1, token2, appId;

  beforeEach(async () => {
    const { token: empToken } = await register(employerData);
    ({ token: token1 } = await register(candidate1Data));
    ({ token: token2 } = await register(candidate2Data));

    const jobRes = await request(app).post('/api/jobs').set('Authorization', `Bearer ${empToken}`).send(validJob);
    const jobId = jobRes.body.job._id;

    const Application = require('../models/Application');
    const User = require('../models/User');
    const candidateDoc = await User.findOne({ email: candidate1Data.email });
    const app_ = await Application.create({ job: jobId, candidate: candidateDoc._id, resumeUrl: 'http://example.com/cv.pdf' });
    appId = app_._id.toString();
  });

  it('candidate can withdraw their own application', async () => {
    const res = await request(app).delete(`/api/applications/${appId}`).set('Authorization', `Bearer ${token1}`);
    expect(res.status).toBe(200);
  });

  it('different candidate cannot withdraw another\'s application', async () => {
    const res = await request(app).delete(`/api/applications/${appId}`).set('Authorization', `Bearer ${token2}`);
    expect(res.status).toBe(403);
  });
});
