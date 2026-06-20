# Hirely — Pre-Launch QA Test Plan

> **Status:** Plan only — no tests have been executed yet.
> Execute only after explicit go-ahead.

---

## 1. AUTH & AUTHORIZATION

### Register
- [ ] Register a new **Candidate** with all valid fields → receives JWT, lands on candidate dashboard
- [ ] Register a new **Employer** with all valid fields → receives JWT, lands on employer dashboard
- [ ] Register with an **email already in use** → returns `409`, clear error message shown in UI
- [ ] Register with **missing required fields** (name, email, password, role) → returns `400`, form shows which field is missing
- [ ] Register with `role: "admin"` or any value outside `[employer, candidate]` → returns `400`, server does not crash
- [ ] Register with non-string inputs (e.g. `email: {"$gt":""}`) → returns `400`, server does not crash
- [ ] Password is **not returned** in the register response body

### Login
- [ ] Login with correct credentials → receives JWT with `exp` claim set (7-day window)
- [ ] Login with **wrong password** → returns `401 Invalid credentials` (not which field is wrong)
- [ ] Login with **non-existent email** → same generic `401` (no account enumeration)
- [ ] Login with non-string inputs (e.g. `{"email":{"$gt":""}}`) → returns `400`, server does not crash
- [ ] After **10 failed login attempts** from the same IP within 15 min → `429 Too many login attempts`
- [ ] After the 15-minute window expires → rate limit resets, login attempts succeed again
- [ ] Password hash is **not returned** in the login response body

### Token & Session
- [ ] JWT payload contains `id` and `exp` — decode and confirm 7-day expiry
- [ ] Request with **no Authorization header** → `401 No token provided`
- [ ] Request with a **malformed / truncated token** → `401 Invalid or expired token`
- [ ] Request with a **tampered payload** (modified role claim, re-encoded without valid signature) → `401`
- [ ] Request with **`alg: none`** in token header → `401` (library rejects it)
- [ ] There is **no token refresh endpoint** — confirm the UI handles token expiry gracefully (redirects to login, does not silently fail)

### Logout
- [ ] Clicking logout clears the JWT from `AuthContext` and `localStorage`
- [ ] After logout, navigating back (browser back button) to a protected page redirects to `/login`
- [ ] After logout, the old token is **not re-used** by any in-flight request

### Role-Based Route Protection — Frontend
- [ ] Logged-in **Candidate** visiting `/dashboard/employer` → redirected to `/dashboard/candidate`
- [ ] Logged-in **Employer** visiting `/dashboard/candidate` → redirected to `/dashboard/employer`
- [ ] **Guest** visiting `/profile`, `/dashboard/*` → redirected to `/login`
- [ ] Logged-in user visiting `/login` or `/register` → redirected to their dashboard (GuestRoute)

### Role-Based Route Protection — API (direct curl / Postman)
- [ ] **Candidate token** → `POST /api/jobs` → `403 Access denied`
- [ ] **Candidate token** → `DELETE /api/jobs/:id` → `403 Access denied`
- [ ] **Employer token** → `POST /api/jobs/:id/apply` → `403 Access denied`
- [ ] **Employer token** → `GET /api/applications/me` → `403 Access denied`
- [ ] **No token** → `GET /api/auth/me` → `401`
- [ ] **No token** → `POST /api/jobs` → `401`

---

## 2. CORE FLOWS

### Employer Flow
- [ ] **Post a job** with all fields (title, description, location, type, skills, salary) → job appears in public `/jobs` listing immediately
- [ ] **Post a job** with only required fields (title, description, location, type) → saved successfully, optional fields absent in response
- [ ] **Edit a job** — change title, description, location, type, skills, salary → all changes persisted and reflected in listing
- [ ] **Edit a job you don't own** (use Employer B's token on Employer A's job ID) → `403 Not your job`
- [ ] **View applicants** for a job with no applications → empty list, not an error
- [ ] **View applicants** for a job with applications → list shows candidate name, email, resume link, application date, current status
- [ ] **Change application status** → cycle through `applied → reviewed → interview → rejected → hired` → each change persisted and visible in candidate dashboard
- [ ] **Change status with invalid value** → `400 Invalid status`
- [ ] **Delete a job** → removed from public listing and employer dashboard immediately
- [ ] **Delete a job with active applications** → job deleted, applications remain in DB (not orphaned or erroring), candidate dashboard handles the dangling reference gracefully
- [ ] **Delete a job you don't own** → `403 Not your job`

### Candidate Flow
- [ ] **Browse jobs** on `/jobs` — all active jobs load, paginated correctly
- [ ] **Search by keyword** → results match title/description
- [ ] **Filter by location** → results match
- [ ] **Filter by job type** → results match
- [ ] **Filter by skills** → results match
- [ ] **Combine multiple filters** → results satisfy all criteria simultaneously
- [ ] **Reset filters** → all jobs return, all filter inputs cleared
- [ ] **Search returns no results** → empty state message shown, not a blank page or JS error
- [ ] **View job detail** → all fields displayed (title, company, location, salary, skills, description)
- [ ] **Apply to a job** with a valid PDF resume → `201`, application appears in candidate dashboard with status `applied`
- [ ] **Apply to the same job twice** → `409 Already applied to this job`
- [ ] **Apply without uploading a file and no resume on profile** → `400 No resume provided`
- [ ] **Apply using the resume already on profile** (no file uploaded) → accepted if profile has `resumeUrl`
- [ ] **Track application status** in dashboard → status updates made by employer are reflected here
- [ ] **Withdraw an application** → removed from candidate dashboard
- [ ] **Withdraw another candidate's application** (wrong candidate token) → `403 Not your application`

### Edge Cases
- [ ] Apply to a **closed job** → `400 Job is closed`
- [ ] Apply to a **non-existent job ID** → `404 Job not found`
- [ ] Employer views applicants for a **job they don't own** → `403`
- [ ] Candidate views job detail of a **deleted job** → `404` handled gracefully in UI (not a white screen)
- [ ] Two candidates apply to the same job simultaneously → both applications created, no race condition

---

## 3. FORMS & VALIDATION

### Register / Login Forms
- [ ] Submit with **all fields empty** → each required field shows an inline error
- [ ] **Email field** — invalid format (e.g. `notanemail`) → validation error before submission
- [ ] **Password field** — check if there is a minimum length enforced (UI and API)
- [ ] **Name field** — 1 character → accepted; 500 characters → check if trimmed or rejected
- [ ] **XSS payload in name** (`<script>alert(1)</script>`) → stored safely, rendered as text in UI (React escapes by default — confirm no `dangerouslySetInnerHTML` in use)

### Job Post / Edit Form
- [ ] Submit with **all required fields empty** → validation error per field
- [ ] **Title** — 1 character → accepted; 1000 characters → check if there is a max enforced
- [ ] **Description** — very long text (10,000+ characters) → check if stored and rendered without breaking layout
- [ ] **Salary fields** — negative number → `400 salaryMin must be a non-negative number`
- [ ] **Salary fields** — non-numeric string → API rejects or sanitizes
- [ ] **Salary fields** — decimal values (e.g. `50000.5`) → accepted or rounded
- [ ] **`salaryMin > salaryMax`** → check if there is cross-field validation (currently there is not — note as a gap if missing)
- [ ] **XSS payload in title/description** → stored safely, rendered as text
- [ ] **Job type** — value outside the enum (`full-time`, `part-time`, `contract`, `remote`) → `400`
- [ ] **Skills array** — empty array → job saved without skills section
- [ ] **Skills array** — 50+ skills → check if there is a max enforced

### Apply / Resume Upload Form
- [ ] Upload a **valid PDF** → accepted
- [ ] Upload a **DOCX file** → accepted
- [ ] Upload a **JPG / PNG** → `400 Only PDF and Word documents are allowed`
- [ ] Upload a **JS file renamed to `.pdf`** (extension spoofing) → check behavior (currently only extension-checked, not magic bytes — note as a gap)
- [ ] Upload a **file over 5MB** → `400` (Multer limit enforced)
- [ ] Upload a **0-byte empty file** → check behavior
- [ ] Submit the form **with no file selected** and no profile resume → `400 No resume provided`
- [ ] **Cover letter field** — XSS payload → rendered safely
- [ ] **Cover letter field** — very long text → check if truncated or stored in full

### Profile Update Form
- [ ] Update **skills** — add, remove, reorder → changes persisted
- [ ] Update **bio** — XSS payload → stored safely
- [ ] Update **website** — invalid URL → check if validated
- [ ] Attempt to update **email or role** via `PATCH /api/auth/me` → confirm these fields are not in the allowed list and cannot be changed

---

## 4. RESPONSIVE & CROSS-BROWSER

### 390px — Mobile
- [ ] Landing page hero text uses `clamp()` — no horizontal overflow or text cutoff
- [ ] Navbar shows hamburger icon, not desktop nav links
- [ ] Hamburger menu opens the slide-in drawer from the right
- [ ] Drawer closes when: a nav link is tapped, the backdrop is tapped, the X button is tapped
- [ ] Body scroll is locked while drawer is open
- [ ] Jobs page: single-column card layout, filters usable
- [ ] Job detail page: all content readable, apply button accessible
- [ ] All forms: inputs full-width, labels visible, submit button reachable without horizontal scroll
- [ ] Dashboards: tables/lists scroll horizontally or stack without overflow

### 768px — Tablet
- [ ] Navbar transitions correctly between mobile and desktop breakpoint
- [ ] Landing page featured jobs grid: 2-column layout
- [ ] Stats section: 2×2 grid
- [ ] "For Employers" section: stacked (not side-by-side)
- [ ] Forms: comfortable width, not too wide or too narrow

### 1440px — Desktop
- [ ] All sections constrained to `max-w-6xl` — no content stretching edge-to-edge
- [ ] 3-column steps layout visible
- [ ] "For Employers" split panel visible side-by-side

### Theme
- [ ] **Dark → Light → Dark** toggle works on every page without full reload
- [ ] Theme preference persists after **page refresh** (read from `localStorage` on mount)
- [ ] **No flash of wrong theme** on initial load — `localStorage` is read before first render
- [ ] All interactive elements (buttons, inputs, links, cards) have correct colors in both themes
- [ ] Hover states in **light mode** are not black/unreadable
- [ ] Glow orbs and hero gradient are reduced in light mode (not overpowering)

### Cross-Browser
- [ ] Chrome (latest) — full functional pass
- [ ] Firefox (latest) — check `clamp()`, `backdrop-blur`, CSS grid
- [ ] Safari (latest) — check `-webkit-font-smoothing`, flex/grid edge cases
- [ ] Mobile Safari on iOS — check `vh` units, tap target sizes

---

## 5. PERFORMANCE & RELIABILITY

### Loading States
- [ ] Jobs list shows a **loading skeleton or spinner** while fetching — not a blank page
- [ ] Job detail page shows a **loading state** before data arrives
- [ ] Dashboard shows a **loading state** while applications/jobs are fetched
- [ ] On **throttled 3G** (Chrome DevTools → Network → Slow 3G): all loading states visible, no broken layout during fetch

### Backend Down / 500 Errors
- [ ] Simulate backend down (stop the server): frontend shows a friendly error message, not a blank page or unhandled JS exception in console
- [ ] API returns `500` on jobs list → error message shown, not a crash
- [ ] API returns `500` on job apply → error message shown, form remains usable
- [ ] API returns `500` on login → error message shown, form is not frozen
- [ ] **No sensitive error details** (stack traces, file paths) leaked from the API in any scenario

### Pagination & Large Lists
- [ ] Load **100+ jobs** into the DB — paginated list loads page 1 correctly
- [ ] Navigate to page 2, 3, last page — correct jobs shown each time
- [ ] **Search + pagination**: filter results paginate correctly (not mixing filtered and unfiltered results across pages)
- [ ] **Employer dashboard** with 50+ job listings — all load, no timeout
- [ ] **Applicants page** with 100+ applications — paginated correctly

### Build & Bundle
- [ ] `npm run build` completes without errors or warnings
- [ ] Production bundle: vendor chunk ~231KB gzip, app chunk ~72KB gzip — no unexpected size regressions
- [ ] `vite preview` — built app works identically to dev server

---

## 6. REGRESSION ON KNOWN FIXES

### Security Fixes (from audit — must all still hold)
- [ ] **NoSQL injection**: `POST /api/auth/login` with `{"email":{"$gt":""},"password":{"$gt":""}}` → `400 Invalid credentials`, server stays up
- [ ] **Role escalation**: `POST /api/auth/register` with `role:"admin"` → `400 role must be employer or candidate`, server stays up
- [ ] **CORS**: request from `Origin: https://evil.com` → `403`, no `Access-Control-Allow-Origin: *` header in response
- [ ] **Rate limiting**: 11+ login attempts from same IP within 15 min → `429 Too many login attempts`
- [ ] **Uploads auth**: `GET /uploads/<any-filename>` without Authorization header → `401 Unauthorized`
- [ ] **Uploads auth**: `GET /uploads/<filename>` with a valid JWT → `200` (confirm legitimate access still works)
- [ ] **Negative salary**: `PUT /api/jobs/:id` with `salaryMin: -1` → `400 salaryMin must be a non-negative number`
- [ ] **asyncHandler**: any route that throws an unexpected error → Express error handler returns `500 Internal server error`, process does not crash

### UI Regression Fixes
- [ ] **Light mode hover states**: hover over navbar links, buttons, and job cards in light mode → no black backgrounds, text readable
- [ ] **Step connector line**: "Get hired in 3 steps" section in light mode → indigo line is NOT visible through the "Apply in minutes" card
- [ ] **Scroll-reveal on mobile**: all sections on the landing page are visible on a full-page screenshot (no blank sections from unreached IntersectionObserver thresholds)
- [ ] **Theme flash on load**: hard-refresh the page while in light mode → page renders in light mode immediately, no dark flash

---

## Notes & Known Gaps

| Gap | Severity | Notes |
|---|---|---|
| No token refresh endpoint | Medium | Tokens expire after 7 days with no silent refresh — user gets logged out |
| File MIME type not verified by magic bytes | Low | Extension-only check; a file renamed `.pdf` passes. Browser serves with correct `Content-Type` so XSS risk is low |
| No `salaryMin ≤ salaryMax` cross-validation | Low | API accepts `salaryMin: 100000, salaryMax: 1000` without error |
| `role: "admin"` blocked at controller but not schema level | Info | Mongoose enum would also reject it — belt and suspenders is fine |
| Uploaded files require auth but URL is exposed in API responses | Medium | Any authenticated user who intercepts another user's application response gets the resume URL |
| No email verification on register | Medium | Anyone can register with any email address |
| No password complexity requirements | Low | API accepts single-character passwords |
| Rate limiter is in-memory | Low | Resets on server restart; not shared across multiple server instances |
