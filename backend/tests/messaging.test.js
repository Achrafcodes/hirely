require('./setup');
const request = require('supertest');
const app = require('../server');

const employerData  = { name: 'Acme Corp',  email: 'employer@test.com',  password: 'password123', role: 'employer' };
const candidateData = { name: 'Jane Dev',   email: 'candidate@test.com', password: 'password123', role: 'candidate' };
const candidate2Data = { name: 'Bob Dev',   email: 'candidate2@test.com', password: 'password123', role: 'candidate' };

async function register(data) {
  const res = await request(app).post('/api/auth/register').send(data);
  return { token: res.body.token, user: res.body.user };
}

// ── Conversations ──────────────────────────────────────────────────────────────

describe('POST /api/conversations', () => {
  it('employer can create a conversation with a candidate', async () => {
    const employer   = await register(employerData);
    const candidate  = await register(candidateData);

    const res = await request(app)
      .post('/api/conversations')
      .set('Authorization', `Bearer ${employer.token}`)
      .send({ recipientId: candidate.user._id });

    expect(res.status).toBe(200);
    expect(res.body.conversationId).toBeDefined();
  });

  it('candidate can create a conversation with an employer', async () => {
    const employer  = await register(employerData);
    const candidate = await register(candidateData);

    const res = await request(app)
      .post('/api/conversations')
      .set('Authorization', `Bearer ${candidate.token}`)
      .send({ recipientId: employer.user._id });

    expect(res.status).toBe(200);
    expect(res.body.conversationId).toBeDefined();
  });

  it('returns the same conversationId on duplicate create', async () => {
    const employer  = await register(employerData);
    const candidate = await register(candidateData);

    const first = await request(app)
      .post('/api/conversations')
      .set('Authorization', `Bearer ${employer.token}`)
      .send({ recipientId: candidate.user._id });

    const second = await request(app)
      .post('/api/conversations')
      .set('Authorization', `Bearer ${employer.token}`)
      .send({ recipientId: candidate.user._id });

    expect(first.body.conversationId).toBe(second.body.conversationId);
  });

  it('returns 404 for non-existent recipient', async () => {
    const employer = await register(employerData);

    const res = await request(app)
      .post('/api/conversations')
      .set('Authorization', `Bearer ${employer.token}`)
      .send({ recipientId: '000000000000000000000001' });

    expect(res.status).toBe(404);
  });

  it('returns 400 if employer tries to message another employer', async () => {
    const employer  = await register(employerData);
    const employer2 = await register({ ...employerData, email: 'employer2@test.com' });

    const res = await request(app)
      .post('/api/conversations')
      .set('Authorization', `Bearer ${employer.token}`)
      .send({ recipientId: employer2.user._id });

    expect(res.status).toBe(400);
  });

  it('returns 401 without token', async () => {
    const candidate = await register(candidateData);
    const res = await request(app).post('/api/conversations').send({ recipientId: candidate.user._id });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/conversations', () => {
  it('returns conversations for the current user', async () => {
    const employer  = await register(employerData);
    const candidate = await register(candidateData);

    await request(app)
      .post('/api/conversations')
      .set('Authorization', `Bearer ${employer.token}`)
      .send({ recipientId: candidate.user._id });

    const res = await request(app)
      .get('/api/conversations')
      .set('Authorization', `Bearer ${employer.token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].participant.name).toBe(candidateData.name);
  });

  it('does not return other users conversations', async () => {
    const employer   = await register(employerData);
    const candidate  = await register(candidateData);
    const candidate2 = await register(candidate2Data);

    await request(app)
      .post('/api/conversations')
      .set('Authorization', `Bearer ${employer.token}`)
      .send({ recipientId: candidate.user._id });

    const res = await request(app)
      .get('/api/conversations')
      .set('Authorization', `Bearer ${candidate2.token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(0);
  });

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/conversations');
    expect(res.status).toBe(401);
  });
});

// ── Messages ──────────────────────────────────────────────────────────────────

describe('POST /api/messages', () => {
  it('employer can send a message', async () => {
    const employer  = await register(employerData);
    const candidate = await register(candidateData);

    const conv = await request(app)
      .post('/api/conversations')
      .set('Authorization', `Bearer ${employer.token}`)
      .send({ recipientId: candidate.user._id });

    const res = await request(app)
      .post('/api/messages')
      .set('Authorization', `Bearer ${employer.token}`)
      .send({ conversationId: conv.body.conversationId, content: 'Hello!' });

    expect(res.status).toBe(201);
    expect(res.body.message.content).toBe('Hello!');
    expect(res.body.message.sender.name).toBe(employerData.name);
  });

  it('candidate can reply', async () => {
    const employer  = await register(employerData);
    const candidate = await register(candidateData);

    const conv = await request(app)
      .post('/api/conversations')
      .set('Authorization', `Bearer ${employer.token}`)
      .send({ recipientId: candidate.user._id });

    await request(app)
      .post('/api/messages')
      .set('Authorization', `Bearer ${employer.token}`)
      .send({ conversationId: conv.body.conversationId, content: 'Hello!' });

    const res = await request(app)
      .post('/api/messages')
      .set('Authorization', `Bearer ${candidate.token}`)
      .send({ conversationId: conv.body.conversationId, content: 'Hi there!' });

    expect(res.status).toBe(201);
    expect(res.body.message.content).toBe('Hi there!');
  });

  it('outsider cannot send a message to a conversation they are not part of', async () => {
    const employer   = await register(employerData);
    const candidate  = await register(candidateData);
    const candidate2 = await register(candidate2Data);

    const conv = await request(app)
      .post('/api/conversations')
      .set('Authorization', `Bearer ${employer.token}`)
      .send({ recipientId: candidate.user._id });

    const res = await request(app)
      .post('/api/messages')
      .set('Authorization', `Bearer ${candidate2.token}`)
      .send({ conversationId: conv.body.conversationId, content: 'Sneaky!' });

    expect(res.status).toBe(403);
  });

  it('returns 400 when content is empty', async () => {
    const employer  = await register(employerData);
    const candidate = await register(candidateData);

    const conv = await request(app)
      .post('/api/conversations')
      .set('Authorization', `Bearer ${employer.token}`)
      .send({ recipientId: candidate.user._id });

    const res = await request(app)
      .post('/api/messages')
      .set('Authorization', `Bearer ${employer.token}`)
      .send({ conversationId: conv.body.conversationId, content: '   ' });

    expect(res.status).toBe(400);
  });

  it('returns 401 without token', async () => {
    const res = await request(app).post('/api/messages').send({ conversationId: 'x', content: 'hi' });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/messages', () => {
  it('returns message history for a conversation', async () => {
    const employer  = await register(employerData);
    const candidate = await register(candidateData);

    const conv = await request(app)
      .post('/api/conversations')
      .set('Authorization', `Bearer ${employer.token}`)
      .send({ recipientId: candidate.user._id });

    await request(app)
      .post('/api/messages')
      .set('Authorization', `Bearer ${employer.token}`)
      .send({ conversationId: conv.body.conversationId, content: 'Message 1' });

    await request(app)
      .post('/api/messages')
      .set('Authorization', `Bearer ${candidate.token}`)
      .send({ conversationId: conv.body.conversationId, content: 'Message 2' });

    const res = await request(app)
      .get(`/api/messages?conversationId=${conv.body.conversationId}`)
      .set('Authorization', `Bearer ${employer.token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0].content).toBe('Message 1');
    expect(res.body[1].content).toBe('Message 2');
  });

  it('marks received messages as read', async () => {
    const employer  = await register(employerData);
    const candidate = await register(candidateData);

    const conv = await request(app)
      .post('/api/conversations')
      .set('Authorization', `Bearer ${employer.token}`)
      .send({ recipientId: candidate.user._id });

    await request(app)
      .post('/api/messages')
      .set('Authorization', `Bearer ${employer.token}`)
      .send({ conversationId: conv.body.conversationId, content: 'You have mail' });

    // Candidate reads the conversation
    await request(app)
      .get(`/api/messages?conversationId=${conv.body.conversationId}`)
      .set('Authorization', `Bearer ${candidate.token}`);

    // Unread count for candidate should now be 0
    const unread = await request(app)
      .get('/api/conversations/unread')
      .set('Authorization', `Bearer ${candidate.token}`);

    expect(unread.body.unread).toBe(0);
  });

  it('outsider cannot read messages from a conversation', async () => {
    const employer   = await register(employerData);
    const candidate  = await register(candidateData);
    const candidate2 = await register(candidate2Data);

    const conv = await request(app)
      .post('/api/conversations')
      .set('Authorization', `Bearer ${employer.token}`)
      .send({ recipientId: candidate.user._id });

    const res = await request(app)
      .get(`/api/messages?conversationId=${conv.body.conversationId}`)
      .set('Authorization', `Bearer ${candidate2.token}`);

    expect(res.status).toBe(403);
  });

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/messages?conversationId=x');
    expect(res.status).toBe(401);
  });
});

// ── Unread count ──────────────────────────────────────────────────────────────

describe('GET /api/conversations/unread', () => {
  it('returns correct unread count after receiving messages', async () => {
    const employer  = await register(employerData);
    const candidate = await register(candidateData);

    const conv = await request(app)
      .post('/api/conversations')
      .set('Authorization', `Bearer ${employer.token}`)
      .send({ recipientId: candidate.user._id });

    await request(app)
      .post('/api/messages')
      .set('Authorization', `Bearer ${employer.token}`)
      .send({ conversationId: conv.body.conversationId, content: 'msg 1' });

    await request(app)
      .post('/api/messages')
      .set('Authorization', `Bearer ${employer.token}`)
      .send({ conversationId: conv.body.conversationId, content: 'msg 2' });

    const res = await request(app)
      .get('/api/conversations/unread')
      .set('Authorization', `Bearer ${candidate.token}`);

    expect(res.status).toBe(200);
    expect(res.body.unread).toBe(2);
  });

  it('returns 0 when no unread messages', async () => {
    const employer = await register(employerData);
    const res = await request(app)
      .get('/api/conversations/unread')
      .set('Authorization', `Bearer ${employer.token}`);

    expect(res.status).toBe(200);
    expect(res.body.unread).toBe(0);
  });
});
