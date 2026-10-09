# Shortzy landing page

Wishlist (pre-launch) site for **Shortzy**, the clipping app for Mac and Windows that turns long videos into shorts.
Pay once for Shortzy, connect your own AI (Gemini or Qwen) billed as you go, and let your computer do the editing.
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
| `wishlistFormAction` | `null` (form says signups aren't connected yet) | POST endpoint that accepts an `email` field (Formspree, Tally, Loops, ConvertKit...). Set it before the page goes public: until then no "Join the wishlist" button collects anything |
| `url` | `https://shortzy.app` | Real domain (used for share-card URLs) |
| `headline`, `description` | Positioning line and meta description | Change with the copy deck; page title and share text follow. The hero (`hero.tsx`) and `public/og.png` carry the headline too |

Shortzy is a one-time purchase, but the amount is not set, so the page shows no price anywhere.

## Page structure

The positioning hooks (pay once, your own AI paid as you go, editing on your computer, your video or a YouTube link)
land in the first sections, then the feature tour. Your AI and your bill comes last, ending on "How you pay" and its
wishlist link, so the pay-once story sits right before the FAQ and the ask. Nav links, in page order: How it works,
What's inside, Your AI, FAQ.

| # | Section | File | Job |
| --- | --- | --- | --- |
|  | Nav | `src/components/sections/nav.tsx` | Sticky, primary CTA always visible, links in page order |
| 1 | Hero | `hero.tsx`, `mockups/app-demo/` | Headline, the three hook chips, both CTAs, and the auto-looping app demo |
| 2 | Problem | `problem.tsx` | The choice today: hours of editing, or another monthly bill. Shortzy as the third way |
| 3 | How it works | `how-it-works.tsx` | Pinned five-step scroll that renders the hero demo's coded app screens (same sample workspace), with a lane showing what runs on your computer and what goes to your AI |
| 4 | Spec strip | `specs.tsx` | The output at a glance. Honest facts in place of logos or testimonials (none exist yet) |
| 5 | What's inside | `features.tsx` (`#features`) | Interactive caption presets, ranked with reasons, fewer but better, framing that follows the face, and a coded cost estimate panel |
| 6 | Your AI | `your-ai.tsx` | Your own Gemini or Qwen account: a flow diagram of what goes where and a "How you pay" receipt (Shortzy once, AI billed by your provider, no markup) ending on the wishlist link |
| 7 | FAQ | `faq.tsx` | Objections, cost first. Nine questions at most |
| 8 | Wishlist signup | `final-cta.tsx` | Email form (`#wishlist`) with the risk reversal under it |
|  | Footer | `footer.tsx` | Brand tagline, links, trademarks |

### Hero demo

`src/components/mockups/app-demo/` is an auto-looping click-through recreation of the real Shortzy app with a fictional
sample workspace: adding a video, choosing the clip settings, checking the AI cost estimate, processing, then ranked,
captioned clips. One master clock drives a pure, seekable frame model (`timeline.ts`), so the demo is deterministic.
It pauses on click or tap (and through a visually hidden button for keyboard users), when it scrolls out of view and
when the tab is hidden. Reduced motion shows a still frame. Add `?demo=<ms>` to the URL to freeze it at a
given time, which is handy for screenshots and reviews.

## Product visuals

The app's screens are recreated in code from the Shortzy Landing Page UI Kit (real frontend screens captured from the
QA build, 9 Oct 2026), with the app's own tokens and its Inter typeface:

- `src/components/mockups/app-demo/`: the hero demo's screens. How it works renders the same coded screens through a
  camera that frames one part of the app per step.
- The What's inside cost card is a small coded copy of the app's estimate card at a readable size.

Assets in `public/product/`, optimized to WebP:

- `screens/`: the original UI kit captures (Library, Customize, Ranked clips, results grid, cost estimate). Kept for
  reference; the page no longer renders them.
- `illustrations/`: spot illustrations used by the app screens.
- `clips/`: real 9:16 rendered shorts (WebM + MP4) and poster frames.
- `stills/`: source-video stills used in the caption and framing demos.

The workspace, people, titles, scores and costs are fictional QA fixtures. The page labels them "Sample" and keeps the
qualifiers (scores are AI estimates, costs are estimates, your provider bills). Two sample costs appear, both real app
fixtures, and each names its model:

- "$0.43 to $1.33" for the 44:48 sample on Gemini Flash 3.8 (recommended; recorded usage $0.43): hero demo and How it
  works.
- "$0.03 to $0.06" for a 24-minute sample on Qwen 3.8 Omni Flash: the What's inside cost panel.

The FAQ names both. Do not present them as customer results or a price promise.

## Motion

- Springs are critically damped (`{ type: "spring", bounce: 0, visualDuration }`) or use the brand ease
  `[0.2, 0.8, 0.2, 1]`: calm, quick, no overshoot.
- Hero: the headline blurs in word by word and the app demo loops (see above).
- Problem, How it works and "What's inside" are scroll-scrubbed: every effect is tied to scroll position and smoothed
  with a spring, so things glide into place and reverse if you scroll back. How it works pins its stage while the five
  steps play.
- Other sections fade in once as they enter.
- Reduced motion (`MotionConfig reducedMotion="user"` plus explicit at-rest values) shows static screens, posters and
  fully expanded steps.
- Gotchas: scroll-linked opacity may run as a native ScrollTimeline created once, so keep offsets monotonic within
  [0, 1] and never change a `useTransform` output range after mount; `useTransform` binds its source once (remount with
  a key if the source changes).

## Brand

- Brand pack v3.2 (authoritative): `docs/brand/shortzy-brand-v3.2/`. Tokens are mapped in `src/app/globals.css`,
  including shadcn's semantic variables, so any shadcn or 21st.dev component picks up the brand.
- Logo: the app's lockup, waving mascot + "shortzy." (`components/brand/logo.tsx`). Beyond the logo, mascot poses appear only in How it works.
- The four mascot poses are used as supplied (`public/brand/`). Mascots are 720px WebP exports of the original PNGs (only near-invisible edge haze was removed; artwork unchanged).
- Positioning, voice and messaging: `docs/brand/landing-messaging.md`, built with the brand-building skills on top of
  `.agents/brand-context.md`. The sourced copy deck is `founder/landing-page.md`.
- Typography: Bricolage Grotesque (display), Instrument Sans (body), DM Mono (labels and timecodes). The desktop app keeps
  the brand's system sans stack; these are web-only marketing faces, swappable in `src/app/layout.tsx`.
- Copy rules: no em or en dashes, no views guarantees, local editing never presented as "offline", never call Shortzy
  free (it is paid once), no savings claims and no competitor names. American spelling (color, centered, customize),
  matching the app UI. Marketed for Mac and Windows.

## Skills and credits

- Brand-building skills in `.claude/skills/` from
  [arnabbagxd/Brand-building-skills](https://github.com/arnabbagxd/Brand-building-skills).
- Founder skills (landing-page, competitor-matrix, pricing-strategy, go-to-market and others) in `.claude/skills/` from
  [emotixco/claude-skills-founder](https://github.com/emotixco/claude-skills-founder) (v2.1.4, MIT license in
  `.claude/skills/FOUNDER_SKILLS_LICENSE`). Their outputs live in `founder/`: `facts.md`, `landing-page.md` (copy deck)
  and `competitor-matrix.md`.

## Stack

Next.js 16 (App Router, static export), React 19, Tailwind CSS v4, shadcn/ui conventions (`components.json`,
`src/components/ui`), Motion for animation, lucide-react icons.

## Accessibility

Checked with axe-core (WCAG 2.1 A/AA) at 1440px and 390px. Keyboard focus uses the brand ring (3px maroon, 4px
offset). Interactive targets are at least 44px. Reduced motion turns the scroll demo into a static, fully expanded
version and drops transform animations. No horizontal scrolling at 375px.
