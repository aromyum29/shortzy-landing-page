"use client";

import { motion, type Variants } from "motion/react";
import { ArrowRight, Check, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ProductShowcase } from "@/components/mockups/product-showcase";
import { site } from "@/lib/site";

const EASE = [0.2, 0.8, 0.2, 1] as const;

const word: Variants = {
  hidden: { opacity: 0, y: 18, filter: "blur(12px)" },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.55, delay: 0.04 + i * 0.045, ease: EASE },
  }),
};

const rise: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: (d: number) => ({ opacity: 1, y: 0, transition: { duration: 0.45, delay: d, ease: EASE } }),
};

function BlurWords({ text, offset = 0 }: { text: string; offset?: number }) {
  return text.split(" ").map((w, i) => (
    <motion.span key={i} custom={i + offset} variants={word} className="inline-block whitespace-pre">
      {w}
      {" "}
    </motion.span>
  ));
}

export function Hero() {

  return (
    <section id="top" aria-labelledby="hero-title" className="grain relative overflow-hidden pt-10 sm:pt-16">
      <Container className="relative text-center">
        <motion.div initial="hidden" animate="show" className="flex flex-col items-center">
          <motion.p
            variants={rise}
            custom={0}
            className="inline-flex items-center gap-2 rounded-full border border-maroon/25 bg-white px-3.5 py-1.5 text-[0.8125rem] font-semibold text-maroon"
          >
            <span className="shrink-0 whitespace-nowrap rounded-full bg-maroon px-2 py-0.5 font-mono text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-white">
              Mac · Windows
            </span>
            Coming soon. A desktop app for creators.
          </motion.p>

          <h1
            id="hero-title"
            className="mt-7 font-display text-[clamp(3.1rem,9vw,7.25rem)] font-extrabold leading-[0.9] tracking-[-0.04em] text-ink"
          >
            <span className="block [font-stretch:100%]">
              <BlurWords text="Long video in." />
            </span>
            <span className="relative block text-maroon [font-stretch:75%] tracking-[-0.02em]">
              <BlurWords text="Shorts out." offset={3} />
              <svg
                aria-hidden="true"
                viewBox="0 0 300 20"
                preserveAspectRatio="none"
                className="absolute -bottom-[0.06em] left-1/2 h-[0.16em] w-[min(78%,520px)] -translate-x-1/2 text-oat"
              >
                <motion.path
                  d="M4 13 C 70 6, 150 5, 296 10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="7"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.7, delay: 0.4, ease: EASE }}
                />
              </svg>
            </span>
          </h1>

          <motion.p
            variants={rise}
            custom={0.2}
            className="mt-7 max-w-[640px] text-pretty text-[1.0625rem] leading-relaxed text-mute sm:text-[1.1875rem]"
          >
            Shortzy is a desktop app for Mac and Windows that finds the strongest moments in your podcasts, interviews and tutorials,
            then cuts, frames and captions them into vertical shorts. Your files stay on your computer. Your AI
            key stays yours.
          </motion.p>

          <motion.div
            variants={rise}
            custom={0.26}
            className="mt-9 flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:items-center"
          >
            <Button asChild size="lg" className="group">
              <a href={site.cta.wishlist.href}>
                {site.cta.wishlist.label}
                <ArrowRight className="transition-transform duration-200 group-hover:translate-x-0.5" />
              </a>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <a href={site.cta.howItWorks.href}>
                <span className="grid size-6 place-items-center rounded-full bg-maroon text-white">
                  <Play className="!size-3 translate-x-[1px] fill-current" />
                </span>
                {site.cta.howItWorks.label}
              </a>
            </Button>
          </motion.div>

          <motion.ul
            variants={rise}
            custom={0.32}
            className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[0.875rem] text-mute"
          >
            {["For Mac and Windows", "Works with Gemini or Qwen", "Your originals are never touched"].map(
              (t) => (
                <li key={t} className="flex items-center gap-1.5">
                  <Check className="size-4 text-maroon" strokeWidth={2.5} aria-hidden="true" />
                  {t}
                </li>
              ),
            )}
          </motion.ul>
        </motion.div>
      </Container>

      {/* Product stage */}
      <div className="relative mt-14 sm:mt-20">
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 top-[30%] bg-maroon">
          <div className="perf-rail absolute inset-x-0 top-4 h-3 text-paper/15" />
          <div className="perf-rail absolute inset-x-0 bottom-4 h-3 text-paper/15" />
        </div>

        <Container className="relative pb-14 sm:pb-20">
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: EASE }}
          >
            <ProductShowcase />
          </motion.div>
        </Container>
      </div>
    </section>
  );
}
