# Hustl — Job Board

A full-stack job board where candidates can browse and apply for jobs, and employers can post listings and manage applicants.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, TailwindCSS, React Router |
| Backend | Node.js, Express |
| Database | MongoDB (Mongoose) |
| Auth | JWT + bcrypt |
| File uploads | Multer (PDF résumés) |
| Infrastructure | Docker (MongoDB) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- Docker (for MongoDB)

### 1. Start MongoDB

```bash
docker compose up -d
```

This starts MongoDB on port `27017` with a persistent named volume (`mongo_data`). Data survives container restarts.

### 2. Backend

```bash
cd backend
cp .env.example .env   # edit JWT_SECRET and MONGO_URI if needed
npm install
npm run dev            # runs on http://localhost:5000
```

`.env` variables:

| Variable | Default | Description |
|---|---|---|
| `PORT` | `5000` | Express server port |
| `MONGO_URI` | `mongodb://localhost:27017/job-board` | MongoDB connection string |
| `JWT_SECRET` | — | Secret for signing JWTs — change this |
| `NODE_ENV` | `development` | Environment |

### 3. Frontend

```bash
cd frontend
npm install
npm run dev            # runs on http://localhost:5173
```

---

## Project Structure

```
job-board/
├── docker-compose.yml       # MongoDB with persistent volume
├── backend/
│   ├── server.js
│   ├── config/db.js
│   ├── models/              # User, Job, Application
│   ├── controllers/         # auth, job, application logic
│   ├── routes/              # /api/auth, /api/jobs, /api/applications
│   ├── middleware/          # JWT auth, role guard, multer upload
│   └── uploads/             # uploaded résumés (PDF)
└── frontend/
    └── src/
        ├── api/             # Axios client + endpoint helpers
        ├── context/         # AuthContext, ThemeContext
        ├── components/
        │   ├── layout/      # Navbar, Footer, Layout
        │   └── jobs/        # JobCard, JobFilters, JobForm
        └── pages/           # LandingPage, JobsPage, JobDetail,
                             # LoginPage, RegisterPage, Dashboard,
                             # ProfilePage
```

---

## Features

**Candidates**
- Browse and search/filter job listings
- Apply with a PDF résumé upload
- Track application status from a dashboard

**Employers**
- Post and manage job listings
- Review applicants and update application status

**UI**
- Dark / light theme toggle (persisted in `localStorage`)
- Fully responsive with a mobile drawer menu
- Scroll-reveal animations and animated stat counters

---

## API Endpoints

### Auth — `/api/auth`
| Method | Path | Description |
|---|---|---|
| POST | `/register` | Register (candidate or employer) |
| POST | `/login` | Login, returns JWT |
| GET | `/me` | Get current user (auth required) |

### Jobs — `/api/jobs`
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | — | List jobs (filter by title, location, type, skills) |
| GET | `/:id` | — | Get single job |
| POST | `/` | Employer | Create job |
| PUT | `/:id` | Employer | Update job |
| DELETE | `/:id` | Employer | Delete job |

### Applications — `/api/applications`
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/` | Candidate | Apply to a job (multipart, PDF résumé) |
| GET | `/my` | Candidate | My applications |
| GET | `/job/:jobId` | Employer | Applications for a job |
| PUT | `/:id/status` | Employer | Update application status |

---

## Docker

```bash
# Start MongoDB
docker compose up -d

# Stop (data is preserved in the mongo_data volume)
docker compose down

# Wipe data completely
docker compose down -v
```
