/**
 * Single place for links and launch details that are still being decided.
 * Change these values; every button and mention on the page follows.
 */
export const site = {
  name: "Shortzy",
  tagline: "Long video in. Shorts out.",
  description:
    "Shortzy is a Mac app that finds the strongest moments in your podcasts, interviews and tutorials, then cuts, frames and captions them into vertical shorts. Your files stay on your computer. Your AI key stays yours.",
  url: "https://shortzy.app", // TODO: replace with the real domain

  cta: {
    trial: {
      label: "Try Shortzy free for 7 days",
      shortLabel: "Try free for 7 days",
      // TODO: point at the download / checkout flow once it exists.
      href: "#pricing",
    },
    howItWorks: {
      label: "See how Shortzy works",
      // TODO: owner will supply the final destination (e.g. a demo video).
      href: "#how-it-works",
    },
  },

  trialDays: 7,

  /**
   * Price shown after the trial. Leave null until pricing is final;
   * the page then avoids quoting a number.
   */
  priceAfterTrial: null as string | null,

  requirements: "macOS 14 or later on Apple Silicon",
  storageHint: "about 20 GB free to start",
} as const;

export const nav = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Your AI", href: "#your-ai" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
] as const;
