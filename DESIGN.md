# Design System — Hirely Job Board

Dark-mode first. "Bold modern startup" — Linear/Notion register: confident, clean, restrained.
No animations in v1. Every visual decision below is the single source of truth.

---

## Color Tokens

| Token | Hex | Use |
|---|---|---|
| `base` | `#0A0A0B` | Page background |
| `surface` | `#141415` | Cards, panels, inputs |
| `surface-raised` | `#1C1C1E` | Modals, skill chips, select options |
| `border` | `#27272A` | All borders and dividers |
| `accent` | `#6366F1` | Primary CTAs, focus rings, active nav, links, badges |
| `accent-hover` | `#4F46E5` | Accent on hover |
| `text-primary` | `#F4F4F5` | Headlines, body copy, input values |
| `text-secondary` | `#A1A1AA` | Labels, meta, placeholder support text |
| `text-disabled` | `#52525B` | Disabled inputs, placeholder text, timestamps |
| `success` | `#16A34A` | Hired / accepted status |
| `warning` | `#B45309` | Reviewed / pending status |
| `danger` | `#B91C1C` | Rejected status, error states |

**Rule:** `accent` is the only color used for interactive emphasis. Status colors are always rendered at reduced opacity (10–20% bg tint + full-opacity text) to stay muted.

---

## Typography

Single typeface: **Inter** (Google Fonts, weights 400/500/600/700).

| Token | Size | Weight | Line height | Letter spacing |
|---|---|---|---|---|
| `display` | 3.5rem | 700 | 1.1 | -0.04em |
| `h1` | 2.25rem | 700 | 1.15 | -0.03em |
| `h2` | 1.5rem | 600 | 1.25 | -0.025em |
| `h3` | 1.125rem | 600 | 1.35 | -0.01em |
| `body` | 0.9375rem | 400 | 1.6 | 0 |
| `sm` | 0.8125rem | 400 | 1.5 | 0 |
| `caption` | 0.75rem | 400 | 1.4 | 0.01em |

Headlines use tighter letter-spacing and heavier weights (600–700) to feel confident.

---

## Spacing

4px base unit. Uses Tailwind's default scale (`1` = 4px, `2` = 8px, `3` = 12px, `4` = 16px, `6` = 24px, `8` = 32px, `12` = 48px, `16` = 64px, `24` = 96px).

---

## Border Radius

**One value: 8px everywhere.** Tailwind's `rounded` = 8px (overridden from default 4px).
Exception: `rounded-full` for status badges/pills and avatar circles only.

---

## Elevation / Shadows

| Token | Value | Use |
|---|---|---|
| `shadow-card` | `0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)` | All cards and panels |
| `shadow-modal` | `0 8px 32px rgba(0,0,0,0.6)` | Modals and floating elements |

Shadows are subtle — depth is communicated by background color steps (base → surface → surface-raised), not heavy drop shadows.

---

## Components

### Button
Three variants:
- **primary** — `bg-accent` / `hover:bg-accent-hover` / white text
- **secondary** — `bg-surface border-border` / `hover:border-accent hover:text-accent`
- **ghost** — no background / `hover:text-primary hover:bg-surface`
- **danger** — `bg-danger/10 border-danger/40 text-danger`

All variants: `active:scale-[0.97]`, `transition-all duration-150`, `disabled:opacity-40`.

### Input
- Background: `surface`, border: `border` → `text-disabled` on hover → `accent` focus ring
- Error state: `border-danger` + red caption below
- Focus: `ring-2 ring-accent ring-offset-1 ring-offset-base`

### Badge
Renders status or job-type tags as `rounded-full` pills with a tinted background:
- `applied` → indigo tint
- `reviewed` / `pending` → warning tint
- `interview` → success tint
- `rejected` → danger tint
- `hired` → success tint (stronger)
- Job types → neutral `surface-raised`
- `remote` → indigo tint (matches accent)

### JobCard
Signature element: **left-border reveal on hover** — a 3px `accent`-colored left border slides in from width 0 on hover (`.job-card-border::before`). This signals selection, not excitement. The title transitions to `text-accent` simultaneously. No border-glow, no lift shadow.

---

## Layout

Max content width: `max-w-6xl` (72rem) centered with `px-4 sm:px-6` gutters.
Navbar: sticky, `bg-base/80 backdrop-blur-sm` frosted glass, `h-14`.
Page content: `py-8` top padding below navbar.
Card grids: single-column flex with `gap-3` between cards (no grid — cards are full-width list items).
