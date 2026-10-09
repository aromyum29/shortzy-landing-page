<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Shortzy landing page notes

- Brand authority: `docs/brand/shortzy-brand-v3.2/` (tokens, logo, mascot rules). Product facts: `docs/SHORTZY_LLM_HANDOFF.md`.
- Write copy from `docs/brand/landing-messaging.md` and `.agents/brand-context.md`. No em dashes or en dashes. Never promise
  views, "offline" processing, or savings versus competitors, and never name competitors. Do not invent testimonials or numbers.
- Positioning: pay once for Shortzy, connect your own AI (Gemini or Qwen today, Kimi coming soon) paid as you go, editing on
  your computer, from your own video or a YouTube link. To find moments, a prepared copy of the audio and video goes to the
  AI provider the user chose; say so wherever local editing is claimed.
- This is a wishlist (pre-launch) page: no trial and no price amount. Shortzy is a one-time purchase: 'Pay once' messaging is
  fine, never call Shortzy free; AI usage is billed by the user's own provider. Links and the wishlist form endpoint live in
  `src/lib/site.ts`.
- Shortzy is marketed for Mac and Windows. Windows is not yet a verified build, so never claim feature parity. The logo is the
  app lockup (waving mascot + "shortzy."); beyond the logo the mascot appears only in How it works.
- Product imagery in `public/product/` is real app UI with a fictional sample workspace: keep the "sample" labels and the
  score/cost qualifiers. Name the model on any sample cost ("$0.03 to $0.06 for a 24-minute video on Qwen 3.8 Omni Flash").
- Skills in `.claude/skills/` (sources and licences noted there): brand-building skills, and founder skills (landing-page,
  competitor-matrix, pricing-strategy and others) whose outputs live in `founder/`: `founder/facts.md` (facts the founder
  stated), `founder/landing-page.md` (the sourced copy deck) and `founder/competitor-matrix.md` (competitor facts, never
  named on the page).
- Verify with `npm run lint` and `npm run build` (static export to `out/`).
