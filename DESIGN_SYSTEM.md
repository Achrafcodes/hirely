# Hustl Design System

Current state as of commit a84bd45. Matches the codebase exactly.

---

## Color Tokens (`tailwind.config.js`)

| Token | Value | Usage |
|---|---|---|
| `base` | `#0C0C0C` | Page background |
| `surface` | `#141414` | Cards, panels |
| `surface-raised` | `#1C1C1C` | Hover states, dropdowns, modals |
| `surface-inset` | `#0A0A0A` | Input fields, code blocks |
| `border` | `#2A2A2A` | All 1px borders |
| `accent` | `#E8A030` | Primary CTAs, active states, logo mark |
| `accent-hover` | `#D4911F` | Hover state for accent elements |
| `accent-dim` | `#3D2E0F` | Accent background on dark surfaces (chips, tags) |
| `accent-text` | `#F5C76E` | Accent text on dark surfaces |
| `text-primary` | `#F4F4F5` | Headings, primary content |
| `text-secondary` | `#A1A1AA` | Supporting text |
| `text-disabled` | `#666672` | Placeholders, muted labels |
| `success` | `#16A34A` | Hired, active, positive states |
| `warning` | `#B45309` | Reviewed, pending states |
| `danger` | `#B91C1C` | Rejected, destructive actions |

### Light mode
Base: `#F8F7F5` (warm off-white). Surface: `#FFFFFF`. Surface-raised: `#F0EEE9`. Border: `#E4E1D9`. Accent text in light: `#C47A10` for contrast. Overrides live in `src/index.css` under `html.light`.

---

## Typography

### Font families
- **Display** — `"Instrument Serif"` serif. Landing page only. Never inside the app (dashboards, forms, modals). Loaded from Google Fonts.
- **Sans** — `"DM Sans"` — workhorse font for all UI: nav, buttons, body copy, inputs, headings inside the app.
- **Mono** — `"DM Mono"` — metadata and data only: company names, dates, job types, status labels, filter chips.

### Scale
| Class | Size | Font | Weight | Notes |
|---|---|---|---|---|
| `text-display` | `clamp(36px, 5vw, 56px)` | Instrument Serif | 400 | Landing page H1 only |
| `text-h1` | `28px` | DM Sans | 500 | Page titles |
| `text-h2` | `20px` | DM Sans | 500 | Section headings |
| `text-h3` | `16px` | DM Sans | 500 | Card headings |
| `text-body` | `15px` | DM Sans | 400 | Body copy, line-height 1.6 |
| `text-sm` | `13px` | DM Sans | 400 | Supporting text |
| `text-caption` | `11px` | DM Mono | 400 | Metadata, all-caps, letter-spacing 0.06em |

### Font hard rules
- Max font weight is 500 — no `font-semibold`, `font-bold`, `font-700`, or heavier
- `font-display` (Instrument Serif) never appears inside the app — landing page only
- `font-mono` is for data/metadata only — never headlines or body copy
- `uppercase` only on `font-mono` elements

---

## Shape Language

| Element | Border radius | Tailwind class |
|---|---|---|
| Buttons (primary, secondary, danger) | 5px | `rounded-md` |
| Filter chips, badges, tags | 4px | `rounded-sm` |
| Cards, panels | 8px | `rounded-lg` or `rounded` (DEFAULT) |
| Inputs, selects | 8px | `rounded-lg` (via `inputClass` in JobFilters) |
| Company avatars | 4px | `rounded-sm` |
| Logo mark (H-bolt box) | 8px | `rounded-lg` |
| Table rows in dashboards | 0 | no radius class |
| Icon buttons (save heart, theme toggle) | 4px | `rounded-sm` |

No `rounded-full` on interactive elements. `rounded-full` is only used for decorative dots (status indicators, animated ping halos).

---

## Component Patterns

### Primary button
```jsx
<button className="bg-accent hover:bg-accent-hover text-base font-medium px-5 py-2.5 rounded-md transition-all duration-150 active:scale-[0.97]">
```
Note: `text-base` (dark `#0C0C0C`) not `text-white` — amber is light, needs dark text.

### Secondary button
```jsx
<button className="border border-border text-text-secondary hover:border-accent hover:text-accent font-medium px-5 py-2.5 rounded-md transition-all duration-150">
```

### Danger button
```jsx
<button className="bg-danger/10 border border-danger/30 text-danger hover:bg-danger/20 rounded-md transition-all">
```

### Filter chip (default / active)
```jsx
// Default
<button className="px-3 py-1.5 rounded-sm font-mono text-caption uppercase tracking-wider bg-surface border border-border text-text-secondary hover:border-accent hover:text-accent">

// Active
<button className="px-3 py-1.5 rounded-sm font-mono text-caption uppercase tracking-wider bg-accent-dim text-accent-text border border-accent/50">
```

### Active filter tag (dismissible)
```jsx
<span className="flex items-center gap-1.5 px-2 py-1 rounded-sm font-mono text-caption uppercase bg-accent-dim text-accent-text border border-accent/30">
```

### Badge
`rounded-sm border px-2 py-0.5 font-mono text-caption uppercase tracking-wider`
- `applied` / `remote`: `bg-accent-dim text-accent-text border-accent/30`
- `reviewed`: `bg-warning/10 text-warning border-warning/20`
- `interview` / `active`: `bg-success/10 text-success border-success/20`
- `rejected`: `bg-danger/10 text-danger border-danger/20`
- `hired`: `bg-success/20 text-success border-success/30`
- `closed`: `bg-text-disabled/10 text-text-disabled border-text-disabled/20`
- `full-time` / `part-time` / `contract`: `bg-surface-raised text-text-secondary border-border`

### Job card
- Container: `bg-surface rounded-lg border border-border shadow-card p-4`
- Hover: amber border via `.featured-card:hover` in `index.css` (`border-color: #E8A030`)
- Company avatar: `w-9 h-9 rounded-sm bg-surface-raised border border-border`
- Title: `text-sm font-medium text-text-primary group-hover:text-accent`
- Company name + metadata: `font-mono text-caption text-text-secondary uppercase`
- Skill chips: `font-mono text-caption uppercase px-2 py-0.5 rounded-sm bg-surface-raised border border-border`
- "New" badge: `font-mono text-[10px] uppercase tracking-wider bg-accent-dim text-accent-text px-2 py-0.5 rounded-sm`
- Type badge: `font-mono text-caption uppercase bg-surface-raised text-text-secondary border border-border px-2 py-0.5 rounded-sm`

### Featured card hover (signature micro-interaction)
`.featured-card` in `index.css` — border transitions to `#E8A030` in 150ms on hover. Applied to job cards, employer dashboard job rows, how-it-works steps, testimonials, for-employers panel.

---

## Motion

| Pattern | Value | Where |
|---|---|---|
| Page entry | `animate-fade-in-up` (0.55s ease) | Every page root div |
| Button press | `active:scale-[0.97]` | All primary/secondary buttons |
| Card hover | `border-color 0.15s ease` via `.featured-card` | Job cards, landing cards |
| Skeleton pulse | `animate-pulse bg-surface-raised` | All skeleton loaders |
| Scroll reveal | `.reveal` → `.reveal.visible` (0.6s) | Landing page sections |

---

## Landing Page Structure

1. **Hero** — Instrument Serif display headline with one italic amber word. Two-column: copy left, 3 live job cards right (fetched from real DB). No gradient, no particles, no illustration.
2. **Stats** — 4-up grid with hairline borders (`bg-border` gaps), animated counters on scroll.
3. **How it works** — 3 step cards, numbered `01 / 02 / 03` in DM Mono amber.
4. **For employers** — Two-column panel: copy + CTA left, feature checklist right.
5. **Testimonials** — 3-col grid, 5-star in amber.
6. **Final CTA** — Centered panel, no gradient background.

Rule: No gradient backgrounds. No animated particles. No hero illustrations. Section labels use `font-mono text-caption text-accent uppercase`.

---

## Skeleton System (`src/components/ui/Skeleton.jsx`)

- `Skeleton` — base pulse block: `bg-surface-raised rounded animate-pulse`
- `JobCardSkeleton` / `JobListSkeleton` — job grid or list
- `CompanyCardSkeleton` / `CompanyListSkeleton` — companies grid
- `DetailSkeleton` — job/company detail page header
- `RowSkeleton` / `RowListSkeleton` — employer dashboard, applicants, applications

---

## Files to Know

| File | Role |
|---|---|
| `frontend/tailwind.config.js` | All color tokens, font families, font sizes, border radii, shadows, keyframes |
| `frontend/src/index.css` | Google Fonts import, `.featured-card` hover, `.reveal` scroll animation, light mode overrides |
| `frontend/src/components/ui/Badge.jsx` | Status + type badge variants |
| `frontend/src/components/ui/Button.jsx` | Reusable button with `primary / secondary / ghost / danger` variants |
| `frontend/src/components/ui/Skeleton.jsx` | All skeleton loader components |
| `frontend/src/components/jobs/JobCard.jsx` | Job card used everywhere |
| `frontend/src/components/jobs/JobFilters.jsx` | Search + filter bar on /jobs |
| `frontend/src/components/layout/Navbar.jsx` | Sticky header + mobile drawer |
| `frontend/src/pages/LandingPage.jsx` | Full landing page |
