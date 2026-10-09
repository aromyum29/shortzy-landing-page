/**
 * Single place for links and launch details that are still being decided.
 * Change these values; every button and mention on the page follows.
 */
export const site = {
  name: "Shortzy",
  tagline: "Long video in. Shorts out.",
  description:
    "Shortzy is a desktop app for Mac and Windows that finds the strongest moments in your podcasts, interviews and tutorials, then cuts, frames and captions them into vertical shorts. Your files stay on your computer. Your AI key stays yours.",
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
   */
  wishlistFormAction: null as string | null,

  requirements: "Mac (macOS 14+, Apple Silicon) or Windows",
  storageHint: "about 20 GB free to start",
} as const;

export const nav = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Your AI", href: "#your-ai" },
  { label: "FAQ", href: "#faq" },
] as const;
