<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Shortzy landing page notes

- Brand authority: `docs/brand/shortzy-brand-v3.2/` (tokens, logo, mascot rules). Product facts: `docs/SHORTZY_LLM_HANDOFF.md`.
- Write copy from `docs/brand/landing-messaging.md` and `.agents/brand-context.md`. No em dashes or en dashes. Never promise
  views or "offline" processing, and do not invent testimonials or numbers. Cost versus competitors only as the sourced
  per-minute comparison in Your AI ("Up to 10x less than credit plans", with its footnote showing the math; founder decision,
  14 Oct 2026). Do not name competitors on the page until the founder confirms their live prices.
- Page copy uses American spelling (color, centered, favorite, customize), matching the app UI. Numbers as numerals
  ("If only 6 hold up, you get 6").
- Positioning: pay once for Shortzy, connect your own AI (Gemini or Qwen today, Kimi coming soon) paid as you go, editing on
  your computer, from your own video or a YouTube link. Never imply that nothing leaves the computer: where the page explains
  how it works or what stays private, say that a prepared copy of the audio and video goes to the user's AI.
- Keep copy short: one idea per line, one supporting sentence per block, FAQ answers in one or two sentences.
- The hook names the outcome plainly: long videos into shorts ready to post on YouTube, Instagram and TikTok (Shortzy
  exports MP4s; it does not post for you).
- This is a wishlist (pre-launch) page: no trial and no price amount. Pricing is two separate things, never blurred: pay once
  and own Shortzy for life; then the user's own AI bills them per video. Avoid bare "pay as you go" next to "pay once". Never
  call Shortzy free. No credits, no gatekeeping: the user is in charge, not a plan. Links and the wishlist form endpoint live in
  `src/lib/site.ts`.
- Page order: Hero, Why Shortzy (three value blocks: pay once, up to 10x less per minute, on your computer), Who it's for (`#who-its-for`: creators, clippers, podcasters, influencers, and why shorts; no stats
  unless sourced), Problem, How it works, Specs, What's inside (`#features`), Your AI, FAQ, Wishlist, so the pay-once and
  your-bill story (Your AI ends on "How you pay" and its wishlist link) sits right before the objections and the ask. Nav
  labels: How it works, What's inside, Your AI, FAQ.
- Say Shortzy does the editing (on your computer), not "your computer does the editing". "Virality score" is the founder's
  name for Shortzy's own scoring logic (opening, momentum, payoff, clarity, relevance, audio and visual fit); always keep
  it framed as an AI estimate, never a views promise, and never say "go viral".
- Shortzy is marketed for Mac and Windows. Windows is not yet a verified build, so never claim feature parity. The logo is the
  app lockup (waving mascot + "shortzy."); beyond the logo the mascot appears only in How it works.
- Product imagery (the coded app screens in `src/components/mockups/app-demo/`, the coded estimate panel in What's inside and
  the assets in `public/product/`) is real app UI with a fictional sample workspace: keep the "Sample" labels and the
  score/cost qualifiers.
- Two sample costs exist, both real app fixtures. Name the model next to a sample cost and keep "estimate" and "your provider
  bills" with it:
  - "$0.43 to $1.33" for the 44:48 sample on Gemini Flash 3.8 (recommended; recorded usage $0.43): hero demo and How it works.
  - "$0.03 to $0.06" for a 24-minute sample on Qwen 3.8 Omni Flash: the What's inside cost panel.
  - The FAQ names both.
- Skills in `.claude/skills/` (sources and licenses noted there): brand-building skills, and founder skills (landing-page,
  competitor-matrix, pricing-strategy and others) whose outputs live in `founder/`: `founder/facts.md` (facts the founder
  stated), `founder/landing-page.md` (the sourced copy deck) and `founder/competitor-matrix.md` (competitor facts, never
  named on the page).
- Verify with `npm run lint` and `npm run build` (static export to `out/`).
