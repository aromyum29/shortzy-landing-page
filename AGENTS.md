<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Shortzy landing page notes

- Brand authority: `docs/brand/shortzy-brand-v3.2/` (tokens, logo, mascot rules). Product facts: `docs/SHORTZY_LLM_HANDOFF.md`.
- Write copy from `docs/brand/landing-messaging.md` and `.agents/brand-context.md`. No em dashes. Never promise views,
  "offline" processing, or savings versus competitors. Do not invent testimonials or numbers.
- This is a wishlist (pre-launch) page: no trial or pricing. Links and the wishlist form endpoint live in `src/lib/site.ts`.
- Shortzy is marketed for Mac and Windows. The mascot appears only in the How it works section; elsewhere use the logo.
- Brand-building skills are installed in `.claude/skills/` (source and licence noted there).
- Verify with `npm run lint` and `npm run build` (static export to `out/`).
