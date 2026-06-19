# Job Board — v1 Design

## 1. MongoDB Schemas

### User

```
User {
  _id:         ObjectId
  name:        String, required
  email:       String, required, unique
  password:    String, required          // bcrypt hash
  role:        String, enum: ['employer', 'candidate'], required

  // candidate-only fields
  skills:      [String]                  // e.g. ['React', 'Node.js']
  location:    String
  bio:         String
  resumeUrl:   String                    // stored path or cloud URL

  // employer-only fields
  companyName: String
  companyDesc: String
  website:     String

  createdAt:   Date, default: now
}
```

**Indexes:**
- `email` — unique index (login lookups)

---

### Job

```
Job {
  _id:          ObjectId
  employer:     ObjectId, ref: 'User', required
  title:        String, required
  description:  String, required
  location:     String, required
  type:         String, enum: ['full-time', 'part-time', 'contract', 'remote'], required
  skills:       [String]                 // tags candidates filter on
  salaryMin:    Number
  salaryMax:    Number
  status:       String, enum: ['active', 'closed'], default: 'active'

  createdAt:    Date, default: now
  updatedAt:    Date
}
```

**Indexes:**
- `{ title: 'text', description: 'text' }` — compound text index for keyword search
- `{ location: 1 }` — for location filter
- `{ type: 1 }` — for job-type filter
- `{ skills: 1 }` — for skills filter (multikey index on array field)
- `{ employer: 1, status: 1 }` — employer dashboard queries
- `{ status: 1, createdAt: -1 }` — default sort for candidate browse

---

### Application

```
Application {
  _id:         ObjectId
  job:         ObjectId, ref: 'Job', required
  candidate:   ObjectId, ref: 'User', required
  resumeUrl:   String, required          // snapshot at time of apply
  coverLetter: String
  status:      String,
               enum: ['applied', 'reviewed', 'interview', 'rejected', 'hired'],
               default: 'applied'

  appliedAt:   Date, default: now
  updatedAt:   Date
}
```

**Indexes:**
- `{ job: 1, candidate: 1 }` — unique compound index (prevents duplicate applications)
- `{ candidate: 1, appliedAt: -1 }` — candidate "my applications" listing
- `{ job: 1, status: 1 }` — employer filters applicants by status

---

## 2. API Endpoint Map

### Auth — `/api/auth`

| Method | Path | Auth | Request Body | Response |
|--------|------|------|--------------|----------|
| POST | `/register` | None | `{ name, email, password, role, ...roleFields }` | `{ token, user: { _id, name, email, role } }` |
| POST | `/login` | None | `{ email, password }` | `{ token, user: { _id, name, email, role } }` |
| GET | `/me` | Any JWT | — | `{ _id, name, email, role, ...profileFields }` |
| PATCH | `/me` | Any JWT | `{ name?, location?, skills?, bio?, resumeUrl?, companyName?, ... }` | `{ updated user }` |

---

### Jobs — `/api/jobs`

| Method | Path | Auth | Request Body / Query | Response |
|--------|------|------|----------------------|----------|
| GET | `/` | None | `?q=&location=&type=&skills=&page=&limit=` | `{ jobs: [...], total, page, pages }` |
| GET | `/:id` | None | — | `{ job }` |
| POST | `/` | Employer | `{ title, description, location, type, skills?, salaryMin?, salaryMax? }` | `{ job }` |
| PUT | `/:id` | Employer (own job) | `{ title?, description?, location?, type?, skills?, salaryMin?, salaryMax?, status? }` | `{ job }` |
| DELETE | `/:id` | Employer (own job) | — | `{ message }` |
| GET | `/:id/applicants` | Employer (own job) | `?status=&page=&limit=` | `{ applications: [{ ...app, candidate: { name, email, skills } }], total }` |

---

### Applications — `/api/applications`

| Method | Path | Auth | Request Body | Response |
|--------|------|------|--------------|----------|
| POST | `/jobs/:id/apply` | Candidate | `{ coverLetter? }` + `multipart/form-data` resume file | `{ application }` |
| GET | `/me` | Candidate | `?status=&page=&limit=` | `{ applications: [{ ...app, job: { title, company, location } }], total }` |
| PATCH | `/:id/status` | Employer (owns the job) | `{ status }` | `{ application }` |
| DELETE | `/:id` | Candidate (own application) | — | `{ message }` |

---

### Query param details for `GET /api/jobs`

| Param | Type | Behavior |
|-------|------|----------|
| `q` | string | MongoDB `$text` search on title + description |
| `location` | string | Case-insensitive regex match |
| `type` | string | Exact enum match |
| `skills` | comma-separated string | `$all` match on skills array |
| `page` | number, default 1 | Pagination |
| `limit` | number, default 20 | Page size (max 50) |

---

## 3. Backend Folder Structure

```
server/
├── config/
│   └── db.js                  # Mongoose connect, env-driven URI
│
├── models/
│   ├── User.js
│   ├── Job.js
│   └── Application.js
│
├── middleware/
│   ├── auth.js                # verifyToken — attaches req.user from JWT
│   └── requireRole.js         # requireRole('employer') / requireRole('candidate')
│
├── controllers/
│   ├── authController.js      # register, login, getMe, updateMe
│   ├── jobController.js       # createJob, getJobs, getJob, updateJob, deleteJob, getApplicants
│   └── applicationController.js  # applyToJob, getMyApplications, updateStatus, withdrawApplication
│
├── routes/
│   ├── auth.js
│   ├── jobs.js
│   └── applications.js
│
├── uploads/                   # multer temp dir (or swap for S3/Cloudinary)
│
├── .env                       # MONGO_URI, JWT_SECRET, PORT, NODE_ENV
├── .env.example
└── server.js                  # Express app bootstrap, route mounting, error handler
```

### Middleware chain examples

```
POST /api/jobs
  → auth.js (verifyToken)
  → requireRole('employer')
  → jobController.createJob

GET /api/jobs/:id/applicants
  → auth.js
  → requireRole('employer')
  → jobController.getApplicants  // also checks job.employer === req.user._id

POST /api/jobs/:id/apply
  → auth.js
  → requireRole('candidate')
  → multer (resume upload)
  → applicationController.applyToJob
```

### Error response shape (all endpoints)

```json
{ "message": "Human-readable error string" }
```

HTTP status codes used: 200, 201, 400 (validation), 401 (unauthenticated), 403 (wrong role / not owner), 404, 409 (duplicate application), 500.
