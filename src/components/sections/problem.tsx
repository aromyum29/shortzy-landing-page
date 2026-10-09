"use client";

import { useRef, type ReactNode, type RefObject } from "react";
import { motion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { Check, Plus, RefreshCw } from "lucide-react";
import { Container, Eyebrow } from "@/components/ui/container";
import { useMediaQuery } from "@/hooks/use-media-query";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { cn } from "@/lib/utils";

/*
 * "The choice today": the two deals creators get now, then Shortzy as the third way.
 * Scroll-scrubbed like "What's inside": the cards rise as they enter, then each one acts out its
 * line, left to right (chores get struck off, credits drain, Shortzy's rows tick). Every act is
 * done by the time the cards sit fully in view. Reduced motion renders it all at rest.
 *
 * From md up the cards share row tracks (CSS subgrid), so labels, headlines, visuals and closing
 * lines sit on the same lines across the row whatever each card's copy length.
 */

type Offset = NonNullable<Parameters<typeof useScroll>[0]>["offset"];
/** Explicit resting values: Motion keeps the last applied style if a motion value is simply removed. */
const AT_REST = { y: 0, opacity: 1, scale: 1, rotateX: 0 };
const SMOOTH = { stiffness: 150, damping: 30, mass: 0.4 };

/**
 * Scroll windows for each card's act, keyed to the top of its visual. In the three-up row they are
 * staggered so the story reads left to right and ends as the cards sit fully in view. Stacked (and
 * in the tablet pair), each act runs from its visual entering to that visual being fully in view.
 */
const ACT_ROW = {
  chores: ["start 0.94", "start 0.72"],
  meter: ["start 0.9", "start 0.68"],
  ticks: ["start 0.86", "start 0.64"],
} satisfies Record<string, Offset>;
const ACT_STACKED: Offset = ["start 0.95", "end 0.92"];

function useScrub(ref: RefObject<HTMLElement | null>, offset: Offset) {
  const { scrollYProgress } = useScroll({ target: ref, offset });
  return useSpring(scrollYProgress, SMOOTH);
}

/** Progress of one card's act. useScroll restarts its tracking when the offset changes, so no remount is needed. */
function useAct(ref: RefObject<HTMLElement | null>, act: keyof typeof ACT_ROW) {
  const row = useMediaQuery("(min-width: 1024px)");
  return useScrub(ref, row ? ACT_ROW[act] : ACT_STACKED);
}

/** Slice of a 0 to 1 progress for item `i` of `n`, each item taking `span` of it, evenly staggered. */
function slot(i: number, n: number, span: number): [number, number] {
  const start = n > 1 ? (i * (1 - span)) / (n - 1) : 0;
  return [start, start + span];
}

/** Lifts and fades a block in as it enters, scrubbed by scroll. */
function ScrubIn({
  children,
  className,
  y = 24,
  from = 0.98,
  to = 0.74,
}: {
  children: ReactNode;
  className?: string;
  y?: number;
  from?: number;
  to?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = usePrefersReducedMotion();
  const p = useScrub(ref, [`start ${from}`, `start ${to}`]);
  const ty = useTransform(p, [0, 1], [y, 0]);
  const opacity = useTransform(p, [0, 1], [0, 1]);
  return (
    <motion.div ref={ref} className={className} style={reduce ? { y: 0, opacity: 1 } : { y: ty, opacity }}>
      {children}
    </motion.div>
  );
}

/** Card that rises, un-tilts and settles as it scrolls in. `lag` lets a right-hand card trail its neighbour. */
function Card({ className, children, lag = 0 }: { className?: string; children: ReactNode; lag?: number }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = usePrefersReducedMotion();
  const p = useScrub(ref, ["start 1.02", `start ${0.62 - lag}`]);
  const y = useTransform(p, [0, 1], [96, 0]);
  const scale = useTransform(p, [0, 1], [0.95, 1]);
  const rotateX = useTransform(p, [0, 1], [9, 0]);
  const opacity = useTransform(p, [0, 0.5], [0, 1]);
  return (
    <motion.article
      ref={ref}
      style={
        reduce ? AT_REST : { y, scale, rotateX, opacity, transformPerspective: 1400, transformOrigin: "50% 100%" }
      }
      className={cn("flex flex-col rounded-[24px] border p-6 sm:p-7 lg:p-6 xl:p-7", className)}
    >
      {children}
    </motion.article>
  );
}

/** Subgrid rows from md up: label, headline, visual, closing line. */
const SUBGRID = "md:grid md:grid-rows-subgrid md:row-span-4 md:gap-y-0";

function Label({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h3 className={cn("font-mono text-[0.75rem] font-medium uppercase tracking-[0.12em] text-mute", className)}>
      {children}
    </h3>
  );
}

function Headline({ children }: { children: ReactNode }) {
  return (
    <p className="mt-3 text-balance font-display text-[clamp(1.375rem,1.9vw,1.625rem)] font-bold leading-[1.1] tracking-[-0.025em]">
      {children}
    </p>
  );
}

function Closing({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("mt-4 text-balance text-[0.9375rem] font-semibold leading-snug sm:text-[1rem]", className)}>
      {children}
    </p>
  );
}

/** The inset panel each card acts its line out in. */
const PANEL = "mt-6 rounded-2xl px-4 py-4 sm:px-5 lg:px-4 xl:px-5";

/* ---------------------------------------------------------------- By hand */

const CHORES = ["Find the good bits", "Cut and reframe", "Caption every word", "Export, rename, repeat"];

/** One chore, struck through in turn as the list scrolls in: done by hand, again. */
function Chore({ text, i, p, still }: { text: string; i: number; p: MotionValue<number>; still: boolean }) {
  const scaleX = useTransform(p, slot(i, CHORES.length, 0.4), [0, 1]);
  return (
    <li className="flex items-baseline gap-3 text-[0.9375rem] text-ink/70">
      <span className="font-mono text-[0.75rem] text-mute tabular">{String(i + 1).padStart(2, "0")}</span>
      <span className="relative">
        {text}
        <motion.span
          aria-hidden="true"
          className="absolute -inset-x-1 top-[54%] h-[2px] origin-left rounded-full bg-coral"
          style={{ scaleX: still ? 1 : scaleX }}
        />
      </span>
    </li>
  );
}

function ByHandCard() {
  const ref = useRef<HTMLOListElement>(null);
  const reduce = usePrefersReducedMotion();
  const p = useAct(ref, "chores");
  return (
    <Card className={cn("border-pebble bg-white", SUBGRID)}>
      <Label>By hand</Label>
      <Headline>One episode eats my whole evening.</Headline>
      <ol
        ref={ref}
        aria-label="Every episode, by hand"
        className={cn(PANEL, "flex flex-col justify-center gap-2.5 bg-paper")}
      >
        {CHORES.map((t, i) => (
          <Chore key={t} text={t} i={i} p={p} still={reduce} />
        ))}
      </ol>
      <Closing>Next week, again.</Closing>
    </Card>
  );
}

/* ------------------------------------------------------------ Cloud plan */

const SEGMENTS = 12;
/** Segments still full once the card is in view. Also the reduced-motion state: partly drained, static. */
const LEFT = 4;
const DRAIN = SEGMENTS - LEFT;

/** One meter segment. The rightmost drain first, each emptying towards its left edge. */
function Segment({ p, i, still }: { p: MotionValue<number>; i: number; still: boolean }) {
  const drains = i >= LEFT;
  const order = SEGMENTS - 1 - i;
  // A little overlap, so the drain reads as one steady fall rather than a stepper.
  const start = Math.min(0.97, (order / DRAIN) * 0.94);
  const end = Math.min(1, start + (1 / DRAIN) * 1.25);
  const scaleX = useTransform(p, [start, end], [1, 0]);
  return (
    <span className="relative h-full min-w-0 flex-1 overflow-hidden rounded-[4px] bg-pebble/50">
      <motion.span
        className="absolute inset-0 origin-left bg-ink/85"
        style={{ scaleX: !drains ? 1 : still ? 0 : scaleX }}
      />
    </span>
  );
}

function CreditsMeter() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = usePrefersReducedMotion();
  const p = useAct(ref, "meter");
  return (
    <div
      ref={ref}
      role="img"
      aria-label="Illustration: a credits meter running low as uploads use it up, with a Top up button and a plan that renews monthly."
      className={cn(PANEL, "flex flex-col justify-between gap-3.5 bg-paper")}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-[0.8125rem] font-semibold text-ink">Credits left</span>
        <span className="inline-flex items-center gap-1 rounded-full border border-dashed border-pebble px-2.5 py-0.5 text-[0.75rem] font-semibold text-mute">
          <Plus className="size-3" strokeWidth={2.5} aria-hidden="true" />
          Top up
        </span>
      </div>
      <div className="flex h-7 gap-1">
        {Array.from({ length: SEGMENTS }, (_, i) => (
          <Segment key={i} p={p} i={i} still={reduce} />
        ))}
      </div>
      <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-white px-2.5 py-1 font-mono text-[0.6875rem] text-mute">
        <RefreshCw className="size-3" aria-hidden="true" />
        Renews monthly
      </span>
    </div>
  );
}

function CloudPlanCard() {
  return (
    <Card lag={0.05} className={cn("border-pebble bg-white", SUBGRID)}>
      <Label>A cloud clipping plan</Label>
      <Headline>I&apos;m always watching the credit meter.</Headline>
      <CreditsMeter />
      <Closing>The bill renews whether I post or not.</Closing>
    </Card>
  );
}

/* ---------------------------------------------------------------- Shortzy */

const YOURS = ["No subscription, no credits", "Your own AI, pay as you go", "Your computer does the editing"];

function Tick({ i, p, still }: { i: number; p: MotionValue<number>; still: boolean }) {
  const [a, b] = slot(i, YOURS.length, 0.5);
  const scale = useTransform(p, [a, b], [0.4, 1]);
  const opacity = useTransform(p, [a, a + (b - a) * 0.6], [0, 1]);
  return (
    <motion.span
      aria-hidden="true"
      style={still ? { scale: 1, opacity: 1 } : { scale, opacity }}
      className="grid size-6 shrink-0 place-items-center rounded-full bg-paper text-maroon"
    >
      <Check className="size-3.5" strokeWidth={3} />
    </motion.span>
  );
}

function ShortzyCard() {
  const ref = useRef<HTMLUListElement>(null);
  const reduce = usePrefersReducedMotion();
  const p = useAct(ref, "ticks");
  return (
    <Card
      lag={0.1}
      className={cn(
        "on-dark border-maroon bg-maroon text-white",
        // md: one wide card under the pair. Its column gap (2 x padding, 2 x border, the grid gap) puts
        // each half exactly under one card of the pair. lg: the third column, on the shared rows.
        "md:col-span-2 md:grid md:grid-cols-2 md:grid-rows-[auto_1fr_auto] md:gap-x-[calc(3.5rem+2px+1rem)] md:gap-y-0",
        "lg:col-span-1 lg:grid-cols-1 lg:grid-rows-subgrid lg:row-span-4",
      )}
    >
      <Label className="text-rose md:col-start-1 md:row-start-1">Shortzy</Label>
      <p className="mt-3 font-display text-[clamp(2.5rem,4vw,3.5rem)] font-bold leading-[0.95] tracking-[-0.04em] md:col-start-1 md:row-start-2 md:self-end lg:self-start">
        <span className="block lg:inline">Pay</span> once.
      </p>
      <ul
        ref={ref}
        className={cn(
          PANEL,
          "flex flex-col justify-center bg-maroon-pressed py-1.5",
          "md:col-start-2 md:row-span-3 md:row-start-1 md:mt-0 lg:col-start-1 lg:row-span-1 lg:row-start-3 lg:mt-6",
        )}
      >
        {YOURS.map((t, i) => (
          <li
            key={t}
            className="flex items-center gap-3 border-white/15 py-3 text-balance text-[0.9375rem] font-semibold [&+&]:border-t sm:text-[1rem] lg:text-[0.875rem] xl:text-[0.9375rem]"
          >
            <Tick i={i} p={p} still={reduce} />
            {t}
          </li>
        ))}
      </ul>
      <Closing className="text-[0.875rem] font-normal text-rose sm:text-[0.875rem] md:col-start-1 md:row-start-3 lg:row-start-4">
        You see the AI estimate before anything runs.
      </Closing>
    </Card>
  );
}

export function Problem() {
  return (
    <section aria-labelledby="problem-title" className="py-24 sm:py-32">
      <Container>
        {/* Same three columns as the cards below: the headline spans the two deals, the intro sits over the answer. */}
        <div className="grid gap-5 lg:grid-cols-3 lg:items-baseline-last">
          <div className="lg:col-span-2">
            <ScrubIn y={16} from={1} to={0.82}>
              <Eyebrow>The choice today</Eyebrow>
            </ScrubIn>
            <ScrubIn y={28} from={0.98} to={0.72}>
              <h2
                id="problem-title"
                className="mt-4 text-balance font-display text-[clamp(2.1rem,4.6vw,3.6rem)] font-bold leading-[0.98] tracking-[-0.035em] lg:max-w-[15ch]"
              >
                Hours of editing, or another monthly bill.
              </h2>
            </ScrubIn>
          </div>
          <ScrubIn y={20} from={0.96} to={0.7}>
            <p className="max-w-[44ch] text-balance text-[1.0625rem] leading-relaxed text-mute sm:text-[1.125rem]">
              <span className="block">You already made the long video.</span> Getting shorts out of it usually means one
              of two deals.
            </p>
          </ScrubIn>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:mt-14 lg:grid-cols-3 lg:gap-5">
          <ByHandCard />
          <CloudPlanCard />
          <ShortzyCard />
        </div>
      </Container>
    </section>
  );
}
