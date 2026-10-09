/*
 * Sample workspace shown in the hero demo. Every value is the QA build's own
 * fixture for the "creator economy" project (Gemini, Flash 3.8, whole 44:48
 * video, 6 clips). Scores are editorial AI estimates, never predictions of
 * views, and costs are always shown with an estimate or billing qualifier.
 */

export const PROJECT = {
  title: "The creator economy: build trust before you sell",
  file: "The creator economy: build trust before you sell.mp4",
  length: "44:48",
  size: "648.5 MB",
  resolution: "1920 × 1080",
  still: "/product/stills/podcast.webp",
};

export const AI = {
  provider: "Gemini",
  model: "Flash 3.8",
  logo: "/brand/providers/gemini.png",
};

/** The planning calculator's estimate for this project, and the recorded usage after the run. */
export const COST = {
  estimate: "$0.43 to $1.33",
  recorded: "$0.43",
};

export const OUTPUT = {
  clips: "6 clips",
  shape: "9:16 · Vertical",
  length: "30 to 60 seconds",
  style: "Bold pop",
};

export const STEPS = ["Upload", "Customize", "Analyze", "AI cost estimation", "Confirmation", "Final result"];

/** Library cards before the demo project is created (newest first). */
export const LIBRARY: { title: string; length: string; status: "source" | "clips"; date: string; still: string }[] = [
  { title: "5 AI workflows that give your week back", length: "30:35", status: "source", date: "7 Oct", still: "tutorial" },
  { title: "What I wish I knew before hiring my first team", length: "39:02", status: "clips", date: "2 Oct", still: "interview" },
  { title: "Pricing your expertise without second-guessing", length: "35:50", status: "clips", date: "25 Sept", still: "podcast" },
  { title: "AI agents explained without the buzzwords", length: "27:34", status: "clips", date: "18 Sept", still: "tutorial" },
  { title: "The customer conversation that changed our product", length: "48:17", status: "clips", date: "4 Sept", still: "interview" },
  { title: "A creative routine you can actually stick to", length: "32:08", status: "clips", date: "21 Aug", still: "podcast" },
  { title: "Build your first useful automation in 20 minutes", length: "21:25", status: "clips", date: "7 Aug", still: "tutorial" },
  { title: "Bootstrapping a business that fits your life", length: "50:12", status: "clips", date: "10 Jul", still: "interview" },
];

/** Results in rank order, with the fixture's own reason sentences. */
export const CLIPS: { title: string; score: number; reason: string; poster: string }[] = [
  {
    title: "Trust is the growth strategy nobody can copy",
    score: 94,
    reason: "A clear opening claim, a concrete example, and a complete takeaway.",
    poster: "/product/clips/podcast-clip-1.webp",
  },
  {
    title: "Your first 1,000 followers need one thing",
    score: 91,
    reason: "Specific audience advice with a strong curiosity hook and a practical finish.",
    poster: "/product/clips/podcast-clip-2.webp",
  },
  {
    title: "Stop turning every post into a pitch",
    score: 88,
    reason: "A relatable mistake followed by a useful alternative.",
    poster: "/product/clips/podcast-clip-3.webp",
  },
  {
    title: "The smallest audience can be your best one",
    score: 86,
    reason: "An unexpected contrast with a self-contained explanation.",
    poster: "/product/clips/podcast-clip-1-late.webp",
  },
  {
    title: "Make one idea work harder for you",
    score: 83,
    reason: "A simple repeatable technique, well suited to a short tutorial.",
    poster: "/product/clips/podcast-clip-2-late.webp",
  },
  {
    title: "Consistency starts with a smaller promise",
    score: 81,
    reason: "A memorable closing line and an actionable next step.",
    poster: "/product/clips/podcast-clip-3-late.webp",
  },
];

/** Clip 1 media: WebM (VP9) and MP4 (H.264) side by side. */
export const CLIP_VIDEO = {
  webm: "/product/clips/podcast-clip-1.webm",
  mp4: "/product/clips/podcast-clip-1.mp4",
};
