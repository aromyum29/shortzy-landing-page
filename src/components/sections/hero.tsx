import type { CSSProperties } from "react";
import { ArrowRight, Check, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { AppDemo } from "@/components/mockups/app-demo";
import { site } from "@/lib/site";

/*
 * The entrance is pure CSS (.hero-* in globals.css): it plays from the first paint, needs no
 * JavaScript, and reduced motion shows everything at rest. `at` sets each element's start time.
 */
const at = (seconds: number) => ({ "--d": `${seconds}s` }) as CSSProperties;

function BlurWords({ text, offset = 0 }: { text: string; offset?: number }) {
  return text.split(" ").map((w, i) => (
    <span key={i} className="hero-word inline-block whitespace-pre" style={at(0.04 + (i + offset) * 0.045)}>
      {w}
      {" "}
    </span>
  ));
}

const CHECKS = ["Pay once. No subscription.", "No credits. Pay your AI as you go.", "Edits on your Mac or Windows PC"];

export function Hero() {
  return (
    <section id="top" aria-labelledby="hero-title" className="grain relative overflow-hidden pt-8 sm:pt-10">
      <Container className="relative text-center">
        <div className="flex flex-col items-center">
          <p
            className="hero-rise inline-flex items-center gap-2 rounded-full border border-maroon/25 bg-white px-3.5 py-1.5 text-[0.8125rem] font-semibold text-maroon"
            style={at(0)}
          >
            <span className="shrink-0 whitespace-nowrap rounded-full bg-maroon px-2 py-0.5 font-mono text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-white">
              Mac · Windows
            </span>
            <span>
              Coming soon<span className="hidden sm:inline">. A desktop app for creators.</span>
            </span>
          </p>

          <h1
            id="hero-title"
            className="mt-5 font-display text-[clamp(2.75rem,6.6vw,5.5rem)] font-extrabold leading-[0.92] tracking-[-0.04em] text-ink sm:mt-6"
          >
            <span className="block text-balance [font-stretch:100%]">
              <BlurWords text="Turn long videos into shorts." />
            </span>
            <span className="relative mt-[0.06em] block text-maroon [font-stretch:75%] tracking-[-0.02em]">
              <BlurWords text="Pay once, it’s yours." offset={5} />
              <svg
                aria-hidden="true"
                viewBox="0 0 300 20"
                preserveAspectRatio="none"
                className="absolute -bottom-[0.08em] left-1/2 h-[0.16em] w-[min(70%,520px)] -translate-x-1/2 text-oat"
              >
                <path
                  className="hero-draw"
                  d="M4 13 C 70 6, 150 5, 296 10"
                  pathLength={1}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="7"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          <p
            className="hero-rise mt-5 max-w-[44rem] text-balance text-[1.0625rem] leading-relaxed text-mute sm:mt-6 sm:text-[1.1875rem]"
            style={at(0.2)}
          >
            Add your own video or a YouTube link. Shortzy and your Gemini or Qwen account find the moments, and your computer
            edits them. Pay your AI as you go.
          </p>

          {/* The nav watches this row: once it scrolls under the header, phones get a compact Join button. */}
          <div
            id="hero-cta"
            className="hero-rise mt-7 flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:items-center"
            style={at(0.26)}
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
          </div>

          <ul
            className="hero-rise mt-5 flex flex-col items-start gap-y-2 text-[0.875rem] text-mute sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-x-6"
            style={at(0.32)}
          >
            {CHECKS.map((t) => (
              <li key={t} className="flex items-center gap-1.5 text-left">
                <Check className="size-4 shrink-0 text-maroon" strokeWidth={2.5} aria-hidden="true" />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </Container>

      {/* Product stage */}
      <div className="relative mt-10 sm:mt-12">
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 top-[30%] bg-maroon">
          <div className="perf-rail absolute inset-x-0 top-4 h-3 text-paper/15" />
          <div className="perf-rail absolute inset-x-0 bottom-4 h-3 text-paper/15" />
        </div>

        <Container className="relative pb-14 sm:pb-20">
          <div className="hero-stage">
            <AppDemo />
          </div>
        </Container>
      </div>
    </section>
  );
}
