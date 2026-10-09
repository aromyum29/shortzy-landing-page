"use client";

import { useRef, type ComponentType, type ReactNode } from "react";
import { motion, useInView, type Transition } from "motion/react";
import { KeyRound, Laptop, UserRound } from "lucide-react";
import { Container, Eyebrow } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { useMediaQuery } from "@/hooks/use-media-query";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

/*
 * "Bring your own AI" explains itself with two visuals instead of paragraphs:
 * a flow diagram (Shortzy, your AI account, you) and a "How you pay" receipt.
 * From md up the diagram is a row; on phones it becomes a vertical stack.
 */

const PROVIDERS = [
  { name: "Gemini", logo: "/brand/providers/gemini.png", status: "Recommended", tone: "pick" },
  { name: "Qwen", logo: "/brand/providers/qwen.png", status: "Supported", tone: "on" },
  { name: "Kimi", logo: "/brand/providers/kimi.svg", status: "Coming soon", tone: "soon" },
] as const;

/* Two groups of three: what you pay Shortzy, then what you pay your AI. From md to xl they sit as two columns. */
const RECEIPT = [
  { label: "Shortzy", value: "Pay once", strong: true },
  { label: "Subscription", value: "None" },
  { label: "Credits", value: "None" },
  { label: "AI usage", value: "Billed by your provider" },
  { label: "Markup", value: "None" },
  { label: "Estimate", value: "Before every run" },
];

const DIAGRAM_LABEL =
  "Shortzy, on your computer, sends prepared audio and video to your AI account and gets an editing plan back, " +
  "then edits and exports your clips on your computer. " +
  "Gemini is recommended, Qwen is supported and Kimi is coming soon. Your provider bills you at their rates.";

/*
 * Each packet makes one trip, [delay, duration] (s), each time the diagram scrolls into view.
 * The whole sequence ends at 4.1 s, so it stays under the 5 s limit for moving content (WCAG 2.2.2)
 * and the diagram then rests.
 */
type Leg = readonly [delay: number, duration: number];
const OUT: Leg = [0.35, 1.1];
const BACK: Leg = [1.75, 1.1];
const BILL: Leg = [3, 1.1];
const TRAVEL_EASE: [number, number, number, number] = [0.45, 0, 0.25, 1];

type Axis = "x" | "y";

/** A small block that slides along a wire once, fading in at the source and out before the arrowhead. */
function Packet({ axis, reverse, leg: [delay, duration], className }: { axis: Axis; reverse: boolean; leg: Leg; className: string }) {
  const from = reverse ? "100%" : "0%";
  const to = reverse ? "0%" : "100%";
  const travel: Transition = { delay, duration, ease: TRAVEL_EASE };
  const fade: Transition = { delay, duration, times: [0, 0.18, 0.8, 1], ease: "linear" };
  return (
    // Inset by 1.25rem at both ends so the packet never overlaps a node edge or the arrowhead.
    <motion.span
      className="absolute inset-x-0 inset-y-5 md:inset-x-5 md:inset-y-0"
      initial={axis === "x" ? { x: from, opacity: 0 } : { y: from, opacity: 0 }}
      animate={axis === "x" ? { x: to, opacity: [0, 1, 1, 0] } : { y: to, opacity: [0, 1, 1, 0] }}
      transition={axis === "x" ? { x: travel, opacity: fade } : { y: travel, opacity: fade }}
    >
      <span
        className={cn(
          "absolute left-1/2 top-0 h-5 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full",
          "md:left-0 md:top-1/2 md:h-2 md:w-5",
          className,
        )}
      />
    </motion.span>
  );
}

/** Chevron at the destination end of a wire. Phones: down or up. md and up: right or left. */
function Arrowhead({ upY, leftX }: { upY: boolean; leftX: boolean }) {
  return (
    <svg
      viewBox="0 0 8 8"
      className={cn(
        "absolute size-2.5 text-white/60",
        upY ? "left-1/2 top-0 -translate-x-1/2 -rotate-90" : "bottom-0 left-1/2 -translate-x-1/2 rotate-90",
        "md:bottom-auto md:top-1/2 md:translate-x-0 md:-translate-y-1/2",
        leftX ? "md:left-0 md:right-auto md:rotate-180" : "md:left-auto md:right-0 md:rotate-0",
      )}
    >
      <path d="M2.5 1 6 4 2.5 7" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * A labelled connector. `side` hangs the label before the line (left on phones, above on md+)
 * or after it (right / below), outside the line's box so the line itself stays centred on its node.
 * `leftX` and `upY` set the travel direction for each axis.
 */
function Wire({
  label,
  side,
  leftX = false,
  upY = false,
  dashed = false,
  run,
  axis,
  leg,
  tint,
}: {
  label: string;
  side: "start" | "end";
  leftX?: boolean;
  upY?: boolean;
  dashed?: boolean;
  run: boolean;
  axis: Axis;
  leg: Leg;
  tint: string;
}) {
  return (
    <div className="relative h-full w-4 md:h-4 md:w-full">
      <span
        className={cn(
          "absolute top-1/2 w-[6.5rem] -translate-y-1/2 font-mono text-[0.75rem] leading-[1.35] text-white/70",
          side === "start" ? "right-full mr-2 text-right" : "left-full ml-2 text-left",
          "md:inset-x-0 md:m-0 md:w-auto md:translate-y-0 md:px-3 md:text-center md:text-balance",
          side === "start" ? "md:bottom-full md:top-auto md:mb-1" : "md:top-full md:mt-1",
        )}
      >
        {label}
      </span>
      <span className="relative block size-full overflow-hidden">
        <span
          className={cn(
            "absolute inset-y-0 left-1/2 w-0 -translate-x-1/2 border-l border-white/30",
            "md:bottom-auto md:left-0 md:right-0 md:top-1/2 md:w-auto md:translate-x-0 md:-translate-y-1/2 md:border-l-0 md:border-t",
            dashed && "border-dashed border-white/40",
          )}
        />
        <Arrowhead upY={upY} leftX={leftX} />
        {run && <Packet key={axis} axis={axis} reverse={axis === "x" ? leftX : upY} leg={leg} className={tint} />}
      </span>
    </div>
  );
}

function NodeTitle({ icon: Icon, title, sub }: { icon: ComponentType<{ className?: string }>; title: string; sub?: string }) {
  return (
    <span className="flex items-center gap-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/12 text-white">
        <Icon className="size-5" />
      </span>
      <span className="min-w-0">
        <span className="block font-display text-[1.25rem] font-bold leading-tight tracking-[-0.02em]">{title}</span>
        {sub && <span className="mt-0.5 block font-mono text-[0.75rem] text-white/75">{sub}</span>}
      </span>
    </span>
  );
}

function ProviderTile({ name, logo, status, tone }: (typeof PROVIDERS)[number]) {
  const soon = tone === "soon";
  return (
    <span
      className={cn(
        "flex items-center gap-2.5 rounded-xl border p-2 pr-2.5",
        soon ? "border-dashed border-white/20" : "border-white/15 bg-white/[0.07]",
      )}
    >
      <span className={cn("grid size-8 shrink-0 place-items-center rounded-lg bg-white", soon && "opacity-55")}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo} alt="" width={20} height={20} className="size-5 object-contain" />
      </span>
      <span
        className={cn(
          "font-display text-[1.0625rem] font-bold tracking-[-0.015em]",
          soon ? "text-white/60" : "text-white",
        )}
      >
        {name}
      </span>
      <span
        className={cn(
          "ml-auto whitespace-nowrap rounded-full px-2 py-0.5 text-[0.75rem] font-semibold leading-[1.4]",
          tone === "pick" && "bg-oat text-ink",
          tone === "on" && "border border-white/25 text-white/80",
          soon && "border border-dashed border-white/30 text-white/70",
        )}
      >
        {status}
      </span>
    </span>
  );
}

function Node({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("flex flex-col justify-center rounded-2xl border p-4", className)}>{children}</div>;
}

function Diagram() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const reduce = usePrefersReducedMotion();
  const wide = useMediaQuery("(min-width: 768px)");
  // Packets mount (and make their one trip) each time the diagram enters view, and never under reduced motion.
  const run = inView && !reduce;
  const axis: Axis = wide ? "x" : "y";

  return (
    <div
      ref={ref}
      role="img"
      aria-label={DIAGRAM_LABEL}
      className={cn(
        "grid w-full grid-cols-1",
        "md:grid-cols-[13.5rem_minmax(0,1fr)_16rem] md:gap-y-5",
        "lg:grid-cols-[15rem_minmax(0,1fr)_17.5rem] xl:grid-cols-[13.5rem_minmax(0,1fr)_16rem]",
      )}
    >
      <Node className="border-white/15 bg-maroon md:col-start-1 md:row-start-1">
        <NodeTitle icon={Laptop} title="Shortzy" sub="on your computer" />
        <span className="mt-3 self-start whitespace-nowrap rounded-full border border-oat/55 px-2 py-0.5 font-mono text-[0.75rem] leading-[1.45] text-oat">
          Edits and exports here
        </span>
      </Node>

      <div className="flex h-28 justify-center gap-8 md:col-start-2 md:row-start-1 md:h-auto md:flex-col md:gap-1.5 md:self-center">
        <Wire label="Prepared audio and video" side="start" run={run} axis={axis} leg={OUT} tint="bg-coral" />
        <Wire label="Editing plan" side="end" leftX upY run={run} axis={axis} leg={BACK} tint="bg-rose" />
      </div>

      <Node className="justify-start border-white/15 bg-white/[0.05] md:col-start-3 md:row-span-2 md:row-start-1">
        <NodeTitle icon={KeyRound} title="Your AI account" sub="your API key" />
        <span className="mt-4 grid gap-2">
          {PROVIDERS.map((p) => (
            <ProviderTile key={p.name} {...p} />
          ))}
        </span>
      </Node>

      <div className="flex h-24 justify-center md:col-start-2 md:row-start-2 md:h-auto md:self-center">
        <Wire label="Billed at their rates" side="end" leftX dashed run={run} axis={axis} leg={BILL} tint="bg-oat" />
      </div>

      <Node className="w-[12rem] justify-self-center border-white/20 bg-white/[0.04] md:col-start-1 md:row-start-2 md:w-auto md:justify-self-stretch">
        <NodeTitle icon={UserRound} title="You" sub="pay as you go" />
      </Node>
    </div>
  );
}

function Receipt() {
  return (
    <Reveal
      delay={0.16}
      className="flex flex-col rounded-[24px] bg-paper p-6 text-ink sm:p-8 md:grid md:grid-cols-[auto_minmax(0,1fr)] md:items-center md:gap-x-8 xl:col-span-4 xl:flex xl:items-stretch"
    >
      <h3 className="font-display text-[1.5rem] font-bold leading-tight tracking-[-0.02em] md:col-start-1 md:row-start-1">
        How you pay
      </h3>

      <dl className="relative mt-5 border-y border-dashed border-pebble py-1.5 md:col-span-2 md:row-start-2 md:columns-2 md:gap-x-12 xl:columns-1">
        {RECEIPT.map((r) => (
          <div key={r.label} className="flex break-inside-avoid items-baseline gap-2 py-2.5">
            <dt className="flex flex-1 items-baseline gap-2 whitespace-nowrap font-mono text-[0.8125rem] text-mute after:min-w-4 after:flex-1 after:border-b after:border-dotted after:border-pebble after:content-['']">
              {r.label}
            </dt>
            <dd
              className={cn(
                "text-right font-mono text-[0.8125rem]",
                r.strong ? "font-medium text-maroon" : "text-ink",
              )}
            >
              {r.value}
            </dd>
          </div>
        ))}
        {/* Ticket notches where the receipt tears off. */}
        <span
          aria-hidden="true"
          className="absolute -left-[2.125rem] bottom-0 size-5 translate-y-1/2 rounded-full bg-deep sm:-left-[2.625rem]"
        />
        <span
          aria-hidden="true"
          className="absolute -right-[2.125rem] bottom-0 size-5 translate-y-1/2 rounded-full bg-deep sm:-right-[2.625rem]"
        />
      </dl>

      <p className="mt-4 flex flex-wrap items-center gap-x-1.5 text-[0.875rem] text-mute md:col-start-2 md:row-start-1 md:mt-0 md:justify-end xl:mt-auto xl:justify-start xl:pt-4">
        Price not set yet.
        {/* The section's paper focus ring would vanish on this paper card, so the link keeps the maroon one. */}
        <a
          href={site.cta.wishlist.href}
          className="inline-flex min-h-11 items-center font-semibold text-maroon underline decoration-maroon/40 underline-offset-4 transition-colors hover:text-maroon-hover hover:decoration-maroon focus-visible:outline-maroon focus-visible:outline-offset-2"
        >
          Join the wishlist to hear first.
        </a>
      </p>
    </Reveal>
  );
}

export function YourAI() {
  return (
    <section id="your-ai" aria-labelledby="ai-title" className="on-dark grain relative bg-deep py-24 text-white sm:py-32">
      <div aria-hidden="true" className="perf-rail absolute inset-x-0 top-5 h-3 text-paper/10" />
      <Container>
        <Reveal className="grid gap-5 lg:grid-cols-12 lg:items-end lg:gap-10">
          <div className="lg:col-span-7">
            <Eyebrow className="text-rose">Bring your own AI</Eyebrow>
            <h2
              id="ai-title"
              className="mt-4 font-display text-[clamp(2.1rem,4.6vw,3.6rem)] font-bold leading-[0.98] tracking-[-0.035em]"
            >
              <span className="block sm:inline">Your AI.</span> <span className="block sm:inline">Your bill.</span>{" "}
              <span className="block text-coral">No markup.</span>
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="max-w-[46ch] text-[1.0625rem] leading-relaxed text-white/80 sm:text-[1.125rem]">
              Connect your own Gemini or Qwen account, see the estimate before each run, and pay your provider directly
              for what you use.
            </p>
            <p className="mt-3 text-[0.9375rem] leading-6 text-pretty text-white/70">
              <span className="font-semibold text-rose">Never made an API key?</span> Setup walks you through it.
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-5 sm:mt-14 xl:grid-cols-12 xl:gap-6">
          <Reveal
            delay={0.08}
            className="flex flex-col rounded-[24px] border border-white/12 bg-white/[0.03] p-5 sm:p-7 xl:col-span-8 xl:p-8"
          >
            {/* Diagram and footnote share one centred column, so their edges line up at every width. */}
            <div className="mx-auto flex w-full max-w-[52rem] flex-1 flex-col">
              <div className="flex flex-1 items-center">
                <Diagram />
              </div>
              <p className="mt-7 border-t border-white/10 pt-5 text-[0.875rem] leading-relaxed text-pretty text-white/65">
                <span className="font-semibold text-white/90">Local-first:</span> a prepared copy of the audio and video
                goes to the AI you chose. <span className="sm:block">Your files and API key stay on your computer.</span>
              </p>
            </div>
          </Reveal>

          <Receipt />
        </div>
      </Container>
    </section>
  );
}
