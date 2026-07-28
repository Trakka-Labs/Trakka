# Trakka Landing Page

React + Vite + Tailwind CSS v4 (PWA-enabled) landing page for Trakka.

## Setup

```bash
npm install
npm run dev      # local dev server
npm run build    # production build → dist/
npm run preview  # preview the production build
```

## Structure

```
src/
  components/
    ui/          → shared primitives (Button, Card, Badge, Logo, RouteTicker, Reveal, ScrollProgressBar, SectionHeading, Container)
    sections/    → Hero, ProblemStatement, Features, HowItWorks, ProductShowcase, WhyTrakka, Pricing, FAQ, FinalCTA
    Navbar.jsx
    Footer.jsx
  hooks/         → useScrollReveal, useActiveSection, usePrefersReducedMotion, useCountUp
  index.css      → design tokens (colors, type) + base styles
  App.jsx        → section assembly
```

## Design system

- Colors, fonts defined as CSS variables in `src/index.css` under `@theme` (Tailwind v4 CSS-first config — no `tailwind.config.js`).
- Fonts: Space Grotesk (display), Inter (body), JetBrains Mono (data/telemetry — trip IDs, ETAs, stats).
- Signature visual: `RouteTicker` component — the live route/dot motif, used in the Hero and as a section divider.

## Notes

- No fabricated stats or testimonials — copy reflects Trakka's actual early-stage/pilot status, per product decisions made with the founder.
- PWA manifest + service worker configured via `vite-plugin-pwa` in `vite.config.js`.
- Replace `public/icon-192.png`, `icon-512.png`, `apple-touch-icon.png`, and `favicon.svg` with final brand assets when ready — current versions are placeholder-quality programmatic renders, not final logo art.
