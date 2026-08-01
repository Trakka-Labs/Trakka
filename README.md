# Trakka

Trakka is a web-based logistics management platform that helps logistics businesses create, manage, track, and complete deliveries while giving customers real-time visibility into their packages through a unique WhatsApp tracking link.

This project contains the React/Vite frontend and a standalone NestJS backend
under `backend/`. Local testing uses a persistent SQLite database and does not
require Docker, PostgreSQL, Redis, or seeded accounts.

## Setup

Install both projects:

```bash
npm install
npm --prefix backend install
```

Start the backend in one terminal:

```bash
npm run dev:backend
```

From inside `backend/`, the equivalent compiled-server workflow is:

```bash
npm start
```

`npm start` runs current backend source for local development. To verify the
compiled production output, use `npm run build && npm run start:compiled`.

Start the frontend in another:

```bash
npm run dev
```

Vite proxies `/api/*` to `http://127.0.0.1:8080`. Register a new business
through the UI; no demo credentials or seeded operational data exist. Local
records persist in `backend/data/trakka-local.sqlite`.

### Create a test delivery in the browser

With the frontend and backend running, create a delivery without filling the
form manually:

```bash
npm run delivery:create
```

The Playwright script at `automation/create-delivery.js` launches a visible
Chrome window, shows each form action as it happens, submits randomized valid
test data, and prints the new tracking ID. Deliveries are created for the
business signed into the automation browser. On the first run, sign into the
business that should receive the deliveries; that session is then reused from
`.cache/trakka-delivery-browser/`. The script never creates a separate
automation business.

Useful options:

```bash
npm run delivery:create -- --count=5
TRAKKA_APP_URL=http://127.0.0.1:5174 npm run delivery:create
TRAKKA_EMAIL=owner@example.com TRAKKA_PASSWORD='your-password' npm run delivery:create
TRAKKA_ACTION_DELAY_MS=600 TRAKKA_SUCCESS_HOLD_MS=5000 npm run delivery:create
```

When `TRAKKA_EMAIL` and `TRAKKA_PASSWORD` are provided, the script switches to
that account even if another session was previously saved. Without credentials,
it opens the login page and waits up to five minutes for interactive sign-in.

Optional delivery overrides include `TRAKKA_PICKUP_ADDRESS`,
`TRAKKA_DROPOFF_ADDRESS`, `TRAKKA_RECIPIENT_NAME`,
`TRAKKA_RECIPIENT_PHONE`, `TRAKKA_PACKAGE_DESCRIPTION`,
`TRAKKA_DECLARED_VALUE`, and `TRAKKA_DELIVERY_FEE`.

Google sign-in/sign-up requires a Google Web Client ID in `backend/.env` and
starting the API with `npm --prefix backend run start:env`. Full setup:
[`backend/docs/GOOGLE_AUTH.md`](backend/docs/GOOGLE_AUTH.md).

Validation commands:

```bash
npm run lint
npm run build
npm --prefix backend run typecheck
npm --prefix backend test
```

## Structure

```
src/
  components/
    ui/          → shared primitives (Button, Card, Badge, Logo, RouteTicker, Reveal, ScrollProgressBar, SectionHeading, Container)
    sections/    → landing-page content
    Navbar.jsx
    Footer.jsx
  hooks/         → useScrollReveal, useActiveSection, usePrefersReducedMotion, useCountUp
  index.css      → design tokens (colors, type) + base styles
  lib/api.js     → local/remote backend client
  App.jsx        → route assembly
```

## Design system

- Colors, fonts defined as CSS variables in `src/index.css` under `@theme` (Tailwind v4 CSS-first config — no `tailwind.config.js`).
- Fonts: Inter for display/body text and JetBrains Mono for tracking IDs, labels, and tabular data, following `docs/DESIGN.md`.
- Signature visual: `RouteTicker` component — the live route/dot motif, used in the Hero and as a section divider.

## Notes

- No fabricated stats or testimonials — copy reflects Trakka's actual early-stage/pilot status, per product decisions made with the founder.
- PWA icons remain in `public/`, but automatic service-worker generation is currently disabled until the Workbox dependency chain has a clean security audit.
- Replace `public/icon-192.png`, `icon-512.png`, `apple-touch-icon.png`, and `favicon.svg` with final brand assets when ready — current versions are placeholder-quality programmatic renders, not final logo art.
