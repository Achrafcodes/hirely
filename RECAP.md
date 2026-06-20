# Hirely Job Board — Full Session Recap

---

## UI & Design

### Landing Page
- Built a complete landing page from scratch: Hero with gradient orbs + animations, Featured Jobs grid, animated stat counters, "Get hired in 3 steps" with SVG icons, For Employers split panel, Trusted By section, and a final CTA
- Fixed step icons — replaced emojis with SVG icons so they inherit the theme accent color
- Fixed the connector line in "Get hired in 3 steps" showing through the "Apply in minutes" card in light mode (two-part fix: gradient + CSS stacking order)

### Light/Dark Theme
- Built a `ThemeContext` with `localStorage` persistence, toggling `html.light` class on the document
- Why CSS variables failed: Tailwind compiles colors at build time, so the dev server served stale values — switched to `!important` overrides in `index.css` instead
- Added a theme toggle button in the Navbar (sun/moon icons)
- Fixed hover states in light mode — `hover:bg-surface-raised` compiled to the dark hex so all button hovers were black; added hover-state CSS overrides

### Responsive / Mobile
- Full hamburger menu with a slide-in drawer, backdrop overlay, body scroll lock, and auto-close on route change
- Used `clamp()` for fluid typography so headlines don't overflow on 390px screens
- Fixed scroll-reveal animations that stayed invisible on mobile full-page screenshots — added a viewport-on-mount check alongside `IntersectionObserver`

### Other Components
- `JobFilters.jsx` — rounded-xl wrapper, pill Search/Reset buttons
- `JobForm.jsx` — removed old `Button` dependency, consistent rounded styling
- `JobsPage.jsx` — fade-in entrance + staggered card animations
- `Footer.jsx` — 4-column grid, social icons, responsive 2-col on mobile
- `Layout.jsx` — flex column so footer always sticks to bottom

---

## Infrastructure

### Docker
- Created `docker-compose.yml` with a named `mongo_data` volume so MongoDB data persists across container restarts
- `restart: unless-stopped` so it auto-starts on boot

### Git & GitHub
- Initialized the repo, created `.gitignore` (excludes `node_modules`, `.env`, `uploads/*`, `.claude/`)
- Added `.gitkeep` to preserve the uploads folder structure
- Created the initial commit with 65 files
- Set up SSH key (`~/.ssh/id_ed25519`) for GitHub push

---

## Performance & SEO (Lighthouse Audit)

- **`vite.config.js`** — added `manualChunks` (function form, required by Vite 8/rolldown) to split vendor (React/router: 231KB) and axios (44KB) into separate cached chunks
- **`index.html`** — fixed title ("frontend" → "Hirely — Find Work That Matters"), added meta description, Open Graph tags, moved Google Fonts from CSS `@import` (render-blocking) to `<link rel="preconnect">` + `<link rel="stylesheet">` (parallel, non-blocking)
- **`public/robots.txt`** — created with `Allow: /`
- **Contrast fix** — `text-disabled` was `#52525B` on `#0A0A0B` = 2.56:1 (WCAG AA requires 4.5:1); bumped to `#838391` (5.28:1) in dark mode, `#6F6F80` (4.72:1) in light mode

---

## Security Audit & Fixes

**Tested 21 attack vectors. Found 6 real vulnerabilities, all fixed:**

| Vulnerability | Before | After |
|---|---|---|
| NoSQL injection on login | Server crash (DoS) | Type-guarded — `{"$gt":""}` rejected before touching DB |
| Unhandled async errors | Any bad input crashed the process | `asyncHandler` wrapper on all routes passes errors to Express error handler |
| Role escalation (`role:"admin"`) | Server crash + Mongoose error leaked | Explicit allowlist check before DB call |
| CORS fully open | Any origin allowed | Restricted to `CLIENT_URL` env var (localhost:5173 + 5174) |
| No rate limiting on login | Unlimited brute-force | 10 attempts / 15-minute window per IP |
| Uploaded files public | Anyone with the URL could download résumés | JWT required to access `/uploads/*` |
| Negative salary | Saved to DB | Validated ≥ 0 in create and update |

**New files added:** `middleware/asyncHandler.js`, `middleware/loginRateLimiter.js`

**Confirmed safe:** JWT alg:none attack, IDOR on job ownership, role crossing (candidate → employer), duplicate applications, password hash in responses, stack trace leaking, `.env` via HTTP

---

## README

Created `README.md` at the project root covering: tech stack, getting started (Docker + backend + frontend), project structure tree, feature summary, full API reference for all 3 route groups, and Docker commands.
