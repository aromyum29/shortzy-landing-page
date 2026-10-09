/*
 * Sample project shown in the product demos. Titles, reasons and scores come
 * from the real Shortzy results screen (QA build, sample workspace). Scores
 * are editorial AI estimates, never predictions of views.
 */

export const DEMO_PROJECT = {
  title: "The creator economy: build trust before you sell",
  length: "44:48",
};

export const CLIPS: { title: string; reason: string; score: number; poster: string }[] = [
  { title: "Trust is the growth strategy nobody can copy", reason: "Clear payoff", score: 94, poster: "/product/clips/podcast-clip-1.webp" },
  { title: "Your first 1,000 followers need one thing", reason: "Curiosity hook", score: 91, poster: "/product/clips/podcast-clip-2.webp" },
  { title: "Stop turning every post into a pitch", reason: "Relatable mistake", score: 88, poster: "/product/clips/podcast-clip-3.webp" },
  { title: "The smallest audience can be your best one", reason: "Strong contrast", score: 86, poster: "/product/clips/podcast-clip-1-late.webp" },
  { title: "Make one idea work harder for you", reason: "Practical", score: 83, poster: "/product/clips/podcast-clip-2-late.webp" },
  { title: "Consistency starts with a smaller promise", reason: "Memorable close", score: 81, poster: "/product/clips/podcast-clip-3-late.webp" },
];

/** Timeline segments: [start, width] as a fraction of the source, with rank. */
export const SEGMENTS: { at: number; w: number; rank: number }[] = [
  { at: 0.06, w: 0.034, rank: 3 },
  { at: 0.19, w: 0.028, rank: 1 },
  { at: 0.335, w: 0.032, rank: 5 },
  { at: 0.515, w: 0.024, rank: 2 },
  { at: 0.665, w: 0.03, rank: 6 },
  { at: 0.835, w: 0.032, rank: 4 },
];

export function waveform(n: number, seed = 1) {
  return Array.from({ length: n }, (_, i) => {
    const v =
      0.5 +
      0.28 * Math.sin(i * 0.37 * seed) +
      0.16 * Math.sin(i * 1.73 + seed) +
      0.08 * Math.sin(i * 4.1);
    return Math.round(Math.max(0.12, Math.min(1, v)) * 1000) / 1000;
  });
}
