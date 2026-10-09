# Shortzy landing page: positioning, voice and messaging

Built with the installed brand-building skills (`brand-positioning`, `brand-voice`, `brand-messaging`)
on top of `.agents/brand-context.md`, and updated on 9 Oct 2026 for the founder's ownership positioning
(sourced copy deck: `founder/landing-page.md`; competitor facts: `founder/competitor-matrix.md`).
The landing page copy in `src/` is written from this file. Update this first when the message changes, then update the page.

## 1. Positioning (brand-positioning)

**Stated category:** AI clip generator.
**Actual category (what buyers compare against):** cloud clipping tools sold as a monthly plan with credits, minutes
or clip allowances, and doing it by hand in an editor.
**Opportunity category:** *the clipping app you buy once.* Most of the category is cloud software rented by the
month and metered in credits. Shortzy is a desktop app you pay for once, it uses the creator's own AI account billed
as they go, and the editing runs on their own computer.

**The four hooks** (in this order of weight)
1. **Pay once.** Shortzy is a one-time purchase. No subscription, no credits, no allowance that resets. A month you
   don't clip costs you nothing in Shortzy fees. The amount is not set yet, so the page never shows one.
2. **Your own AI, paid as you go.** Connect your own Gemini or Qwen account (Kimi coming soon). Your provider bills you
   for what you use, at their rates, and Shortzy adds no markup. You see an estimated cost before anything runs.
3. **Edited on your computer.** Shortzy's own clipping logic and your AI find the moments; your Mac or Windows PC
   trims, frames, captions and exports them into a folder you choose. Originals are never changed.
4. **Your video or a YouTube link.** Add a file from your computer or paste a public YouTube link.

**Positioning statement**
For creators who already publish long videos and are tired of renting a clipping tool by the month, Shortzy is the
clipping app for Mac and Windows that you buy once. It works with your own AI, billed by your provider as you go, and
does the editing on your own computer.

**Public version:** Turn long videos into shorts. Pay once, it's yours.

**Proof points** (each true of the current build or the founder's stated plan)
- One-time purchase, no subscription and no credits (founder decision, `founder/facts.md`; amount not set).
- Bring your own Gemini or Qwen key, stored in the system credential store (macOS Keychain, Windows Credential
  Manager). Kimi shows as coming soon.
- Estimated AI cost shown as a range before generation. The estimate makes no paid AI call. Sample in the app:
  $0.03 to $0.06 for a 24-minute video on Qwen 3.8 Omni Flash (always name the model; the provider's bill is final).
- Local workspace folder for projects, previews and exports. Bundled video tools, on-device face tracking.
- 1 to 10 clips per video, usually 30 to 60 seconds, 9:16 vertical.
- Four caption presets (Bold pop, Word highlight, Condensed, Clean box) plus no captions.
- Clips ranked by an editorial score with reasons (opening, momentum, payoff, clarity, relevance, audio and visual fit).
- Returns fewer clips when there are fewer strong moments, and explains why.

**The honest catch, said plainly:** to find the moments, a prepared copy of the audio and video goes to the AI
provider the user chose, under that provider's terms. YouTube imports and AI analysis need an internet connection.

**What Shortzy refuses to be**
- Not a subscription and not a credit-pack reseller.
- Not a views guarantee. Scores explain a pick; they do not predict an algorithm.
- Not a cloud render farm.
- Not for people who want one-click posting to every platform (yet).

## 2. Voice (brand-voice)

Unchanged. **Voice essence:** Shortzy sounds like a sharp friend who edits video for a living: warm, direct and honest
about what the software can and cannot do.

| Dimension | Where Shortzy sits | Example |
| --- | --- | --- |
| Formality | Casual, never sloppy | "Paste a link. Pick how many clips. Go make coffee." |
| Energy | Calm confidence | "Six strong moments found. You asked for eight, so here's why we stopped." |
| Humour | Light, from the mascot and the situation | "Your next short is already recorded." |
| Expertise | Accessible first, detail on request | "Your AI account" above the fold (then: "the field is labelled API key") |

**Words we use:** find, cut, clip, short, moment, hook, payoff, review, export, your computer, your account, pay once,
pay as you go, estimate, folder, captions, framing.

**Words we avoid:** revolutionary, supercharge, unlock, effortless, seamless, magic, game-changing, 10x, guaranteed,
go viral, in seconds, AI-powered (as filler), cutting-edge, leverage, delve, utilize, robust, empower, elevate, just
(as filler).

**Style rules**
- Short sentences. One idea per sentence.
- Sentence case for headings. No title case.
- No em dashes or en dashes. Use a full stop, a comma or a middle dot. Ranges use "to" (30 to 60 seconds).
- Contractions are fine. Exclamation marks almost never.
- Numbers as numerals (1 to 10 clips, 30 to 60 seconds).
- Every claim must be true of the current build or the founder's stated plan. If it is planned, say "coming".
- Whenever "pay once" appears, keep "pay your AI as you go" (or the provider billing) in the same view, so it never
  reads as no running cost.

## 3. Messaging hierarchy (brand-messaging)

**Core message:** Pay once for Shortzy, pay your own AI as you go, and let your computer turn the long videos you
already make into shorts worth posting.

**Brand tagline (kept):** Long video in. Shorts out. It is the whole product in five words and stays in the footer and
brand pack. The hero now leads with the positioning line below.

**Level 1 · Hero headline:** Turn long videos into shorts. Pay once, it's yours.
A/B challenger for people already paying for clipping plans: "Turn long videos into shorts. No credits to run out."
(keep "Pay your AI as you go" in the same viewport).

**Level 2 · Supporting line:** Add your video or a YouTube link. Shortzy and your Gemini or Qwen account find the
moments. Your computer edits them. Pay your AI as you go.

**Hero chips:** Pay once, no credits · Your own AI, pay as you go · Edits on your Mac or Windows PC

**Level 3 · Key messages**
1. **Pay once, keep it.** No plan to renew, no credits to ration, no allowance that resets.
2. **Your AI, your bill, no markup.** Connect Gemini or Qwen and pay the provider directly, at their rates. You see
   the estimate before anything runs.
3. **Strong moments, edited locally.** Shortzy's clipping logic and your AI look for a clear hook and a complete
   payoff. Your computer trims, frames and captions them. Ask for 10 and only 6 hold up? You get 6, and a reason.
4. **No editing or API skills needed.** Guided setup checks the connection, with plain-language help and sensible
   defaults.

## 4. Conversion structure

The new hooks land in the first sections; the feature tour comes after them.

1. **Hero:** headline, supporting line, three hook chips, primary CTA "Join the wishlist", secondary CTA "See how
   Shortzy works". The product shot is an auto-looping click-through of the real app with a sample workspace.
2. **Problem ("The choice today"):** hours of editing by hand, or another monthly bill with a credit meter. Shortzy is
   the third card: pay once, your own AI as you go, your computer does the editing. The honest note (a prepared copy
   goes to the AI provider you chose) is carried by How it works step 3, Your AI and the FAQ.
3. **How it works:** the pinned five-step scroll (add a video, pick and see the cost, Shortzy and your AI find the
   moments, your computer makes the shorts, review and export). The only section with the mascot.
4. **Spec strip:** the output at a glance (1 to 10 clips, 9:16, 4 caption styles, MP4 or ZIP), plus "your own video
   or a YouTube link". Honest facts in place of logos or testimonials (none exist yet).
5. **Your AI, your bill:** your own account, billed by your provider with no markup, estimate first, and exactly what
   goes where. This is the "pay once" block; there is no pricing section because there is no amount.
6. **Features ("What's inside"):** captions, ranked with reasons, fewer but better, framing that follows the face,
   cost before you click.
7. **FAQ:** cost first (how much it costs, what the AI part costs, do I need an AI account), then privacy, app or
   website, Windows, views, YouTube rights, the wishlist. Nine questions at most.
8. **Final CTA:** "Your next short is already recorded." Sub: "Shortzy is coming to Mac and Windows. Pay once, then
   pay your AI as you go." Under the form: "Only your email. No payment to join. Leave any time."

## 5. Things we never say
- "Go viral", "guaranteed views", or any score presented as a prediction.
- "Offline", "fully offline" or "nothing leaves your computer".
- That Shortzy is free, or "free for life". Shortzy is paid once. "Costs nothing" is only for the estimate, or for no
  Shortzy fees after the purchase.
- "Cheaper than X", "saves you money" or any savings claim against other tools.
- Competitor names. Describe the category ("monthly plans", "credits, minutes or clips") instead.
- "Unlimited" anything. AI usage is billed by the provider, and limits come from the video and the provider.
- "Works with any AI". Gemini and Qwen today, Kimi coming soon.
- A price amount, until the founder sets one.
- Invented testimonials, user counts, logos or ratings.
