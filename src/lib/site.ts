/**
 * Single place for links and launch details that are still being decided.
 * Change these values; every button and mention on the page follows.
 */
export const site = {
  name: "Shortzy",
  /** Brand tagline (footer). The hero and the share card lead with the positioning line instead. */
  tagline: "Long video in. Shorts out.",
  /**
   * The positioning line: page title, share text and share-card alt text. The hero sets the same words
   * in two styled lines in hero.tsx, and public/og.png shows them too, so change all three together.
   */
  headline: "Turn long videos into shorts. Pay once, it's yours.",
  /** Meta and share description (158 characters, from founder/landing-page.md). */
  description:
    "Turn your own videos or YouTube links into captioned shorts on your Mac or Windows PC. Pay once, no subscription. Bring your Gemini or Qwen AI, pay as you go.",
  url: "https://shortzy.app", // TODO: replace with the real domain

  cta: {
    wishlist: {
      label: "Join the wishlist",
      shortLabel: "Join the wishlist",
      href: "#wishlist",
    },
    howItWorks: {
      label: "See how Shortzy works",
      // TODO: owner will supply the final destination (e.g. a demo video).
      href: "#how-it-works",
    },
  },

  /**
   * Where wishlist emails are POSTed (field name "email"), e.g. a Formspree,
   * Tally, Loops or ConvertKit form endpoint. Null until a provider is chosen:
   * the form then says signups aren't connected yet instead of faking success.
   * Set this before the page goes public, or no "Join the wishlist" button collects anything.
   */
  wishlistFormAction: null as string | null,

  /**
   * Pricing model: a one-time purchase. The amount is not set, and this is a
   * wishlist page, so no amount is shown anywhere. AI usage is billed by the
   * user's own provider, never by Shortzy.
   */
  pricing: "one-time purchase",

  requirements: "Mac (macOS 14+, Apple Silicon) or Windows",
  storageHint: "about 20 GB of disk space",
} as const;

/** Section links, in page order. */
export const nav = [
  { label: "How it works", href: "#how-it-works" },
  { label: "What's inside", href: "#features" },
  { label: "Your AI", href: "#your-ai" },
  { label: "FAQ", href: "#faq" },
] as const;
