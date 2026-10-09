# Shortzy landing page

Marketing site for **Shortzy**, the Mac app that turns long videos into shorts.
Fully front end: `npm run build` produces a static site in `out/` that can be hosted anywhere (Vercel, Netlify, S3, any static host).

## Run it

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # static export to ./out
npm run lint
```

## Things to fill in

All of these live in [`src/lib/site.ts`](src/lib/site.ts). Every button on the page reads from there.

| Setting | Now | Needs |
| --- | --- | --- |
| `cta.wishlist.href` | `#wishlist` (the signup form) | Leave as is, or point at an external signup page |
| `cta.howItWorks.href` | `#how-it-works` (the scroll demo) | Final destination for "See how Shortzy works", e.g. a demo video |
| `wishlistFormAction` | `null` (form says signups aren't connected yet) | POST endpoint that accepts an `email` field (Formspree, Tally, Loops, ConvertKit...) |
| `url` | `https://shortzy.app` | Real domain (used for share-card URLs) |

## Page structure

| Section | File | Job |
| --- | --- | --- |
| Nav | `src/components/sections/nav.tsx` | Sticky, primary CTA always visible |
| Hero | `hero.tsx`, `mockups/product-showcase.tsx` | Promise + both CTAs + real app screens and a playing short |
| Spec strip | `specs.tsx` | Honest facts in place of logos or testimonials (none exist yet) |
| Problem | `problem.tsx` | The by-hand routine vs. three steps |
| How it works | `how-it-works.tsx` | Scroll-driven demo: a long timeline's moments become ranked 9:16 shorts |
| Features | `features.tsx` | Interactive caption presets, scoring, framing, fewer-but-better, cost upfront |
| Your AI | `your-ai.tsx` | Bring-your-own-key model and exactly what leaves the Mac |
| FAQ | `faq.tsx` | Objection handling |
| Wishlist signup, footer | `final-cta.tsx`, `footer.tsx` | Email form (`#wishlist`) |

## Product visuals

Product visuals come from the Shortzy Landing Page UI Kit (real frontend screens captured from the QA build,
9 Oct 2026), optimised into `public/product/`:

- `screens/`: Library, Customize, Ranked clips (hero carousel), plus crops of the results grid and cost estimate.
- `clips/`: real 9:16 rendered shorts (WebM + MP4) and poster frames, used in the hero phone, How it works and Features.
- `stills/`: source-video stills used in the caption and framing demos.

The workspace, people, titles, scores and costs in these assets are fictional QA fixtures. The page labels them as a
sample workspace and keeps the qualifiers (scores are AI estimates, costs are samples). Do not present them as customer
results or a price promise.

Motion: the hero window cycles the real screens with a slow scroll (pausable, stops off screen), the phone plays the
matching clip, the window settles flat on scroll, and sections fade in once. "What's inside" is scroll-scrubbed
(headline words rise out of their lines, cards rise and settle, bars fill and slots pop as you scroll, with spring
smoothing). Reduced motion shows static screens and
posters.

## Brand

- Brand pack v3.2 (authoritative): `docs/brand/shortzy-brand-v3.2/`. Tokens are mapped in `src/app/globals.css`,
  including shadcn's semantic variables, so any shadcn or 21st.dev component picks up the brand.
- Logo: the app's lockup, waving mascot + "shortzy." (`components/brand/logo.tsx`). Beyond the logo, mascot poses appear only in How it works.
- The four mascot poses are used as supplied (`public/brand/`). Mascots are 720px WebP exports of the original PNGs (only near-invisible edge haze was removed; artwork unchanged).
- Positioning, voice and messaging: `docs/brand/landing-messaging.md`, built with the brand-building skills
  in `.claude/skills/` on top of `.agents/brand-context.md`.
- Typography: Bricolage Grotesque (display), Instrument Sans (body), DM Mono (labels and timecodes). The desktop app keeps
  the brand's system sans stack; these are web-only marketing faces, swappable in `src/app/layout.tsx`.
- Copy rules: no em dashes, no views guarantees, "local-first" never presented as "offline". Marketed for Mac and Windows.

## Stack

Next.js 16 (App Router, static export), React 19, Tailwind CSS v4, shadcn/ui conventions (`components.json`,
`src/components/ui`), Motion for animation, lucide-react icons.

The hero follows the layout of 21st.dev's Solace UI "Hero Section 6" (navbar, blur-in headline, CTAs, desktop
screenshot with an overlapping phone). The registry was not reachable from the build environment, so the component
was rebuilt from scratch in the Shortzy brand rather than installed.

## Accessibility

Checked with axe-core (WCAG 2.1 A/AA): no violations at 1440px and 390px. Keyboard focus uses the brand ring
(3px maroon, 4px offset). Reduced motion turns the scroll demo into a static, fully expanded version and drops
transform animations. No horizontal scrolling at 375px.
