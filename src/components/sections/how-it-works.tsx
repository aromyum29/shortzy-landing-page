"use client";

import { useEffect, useRef, useState } from "react";
import {
  animate,
  AnimatePresence,
  motion,
  useInView,
  useIsPresent,
  useMotionTemplate,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { ArrowDown, ArrowUp, Cloud, Laptop, type LucideIcon } from "lucide-react";
import { Container, Eyebrow } from "@/components/ui/container";
import { Mascot, type MascotPose } from "@/components/brand/mascot";
import { useMediaQuery } from "@/hooks/use-media-query";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { cn } from "@/lib/utils";

/*
 * How it works: a pinned, scroll-driven stage with two layers.
 *  - On screen: the real Shortzy UI for each step (crops of QA screenshots from
 *    a fictional sample workspace), shown in a light app window.
 *  - Behind the scenes: a slim console with two lanes, your computer and your
 *    AI provider. A packet follows the scroll and only crosses to the AI lane
 *    in step 3, which is the one paid AI call.
 */

type Step = { title: string; body: string; behind: string; pose: MascotPose };

const STEPS: Step[] = [
  {
    title: "Add a video",
    body: "Paste a YouTube link or choose a video file from your computer.",
    behind: "Downloads the public video or opens your file, and keeps a working copy in your workspace folder.",
    pose: "welcome",
  },
  {
    title: "Pick what you want, see the cost",
    body: "Choose 1 to 10 clips, a caption style and, if you like, a topic. Check the estimated AI cost, then press start.",
    behind: "Works out a cost range from the video's length, your options and your model. No paid AI call yet.",
    pose: "welcome",
  },
  {
    title: "Shortzy and your AI find the moments",
    body: "They look for a clear hook and a complete payoff. If only six hold up, you get six, not filler.",
    behind:
      "Sends a prepared copy of the audio and video to your Gemini or Qwen account. An editing plan comes back, and Shortzy checks it before using it.",
    pose: "thinking",
  },
  {
    title: "Your computer makes the shorts",
    body: "Each moment is trimmed, reframed to 9:16 and captioned on your Mac or Windows PC.",
    behind:
      "Bundled video tools and on-device face tracking do the work. No face found? It uses a centred crop and tells you.",
    pose: "clipping",
  },
  {
    title: "Review and export",
    body: "Clips arrive titled and ranked, with the reasons each was picked. Download one MP4 or the whole set as a ZIP.",
    behind: "Sorts by editorial score and keeps earlier clip sets in your folder. The score explains a pick; it doesn't predict views.",
    pose: "celebration",
  },
];

/** Scroll progress where each step starts. Step 3 gets the most room: it is the round trip to your AI. */
const BOUNDS = [0, 0.17, 0.34, 0.6, 0.8, 1];
/** Where the jump buttons land: a settled moment inside each step. */
const REST = [0.07, 0.3, 0.44, 0.7, 0.95];

/** Critically damped: no overshoot. */
const SPRING = { type: "spring", bounce: 0, visualDuration: 0.45 } as const;
const EASE = [0.2, 0.8, 0.2, 1] as const;

/* ----------------------------------------------------------------- On screen */

/**
 * The part of a crop the window shows, in the crop's own pixels: its left/top
 * edge at the start and at the end of the step (a slow scroll-linked drift),
 * and its width, which sets the zoom (window width / w).
 * `rest` picks the still frame used with reduced motion (0 start, 1 end).
 */
type View = { x0: number; y0: number; x1: number; y1: number; w: number; rest?: 0 | 1 };

type Screen = {
  src: string;
  w: number;
  h: number;
  alt: string;
  /** 2:1 window (640px and up), shown at or near natural size. */
  wide: View;
  /** 8:5 window on phones: a tighter region so the text stays readable. */
  compact: View;
  /** Progress bar fill at the start and end of the step (processing screens). */
  live?: [number, number];
  /** Height of the crop's own header, kept in place over the drift in the wide window. */
  header?: number;
  /** Text caret in the crop (x, y, width, height), set blinking. */
  caret?: [number, number, number, number];
};

const SCREENS: Screen[] = [
  {
    src: "/product/how/upload.webp",
    w: 578,
    h: 300,
    alt: "Shortzy upload form with a YouTube link pasted into the video URL field and an Import from YouTube button",
    wide: { x0: -57, y0: -31, x1: -57, y1: -15, w: 692 },
    compact: { x0: 0, y0: 28, x1: 158, y1: 32, w: 420 },
    caret: [336, 141, 3, 18],
  },
  {
    src: "/product/how/estimate.webp",
    w: 776,
    h: 462,
    alt: "Shortzy cost estimate for a 24 minute sample video: estimated AI cost of $0.03 to $0.06 USD, with the note that your provider bills the AI usage and actual cost may vary",
    wide: { x0: 0, y0: 0, x1: 0, y1: 96, w: 776, rest: 1 },
    compact: { x0: 4, y0: 112, x1: 4, y1: 146, w: 440, rest: 1 },
  },
  {
    src: "/product/how/moments.webp",
    w: 652,
    h: 202,
    alt: "Shortzy processing card reading Finding your strongest moments, with a progress bar",
    wide: { x0: -20, y0: -80, x1: -20, y1: -64, w: 692 },
    compact: { x0: -4, y0: -44, x1: -4, y1: -30, w: 440 },
    live: [0.16, 0.64],
  },
  {
    src: "/product/how/editing.webp",
    w: 652,
    h: 202,
    alt: "Shortzy processing card reading Framing and captioning your shorts, with a progress bar",
    wide: { x0: -20, y0: -80, x1: -20, y1: -64, w: 692 },
    compact: { x0: -4, y0: -44, x1: -4, y1: -30, w: 440 },
    live: [0.64, 0.97],
  },
  {
    src: "/product/how/clips.webp",
    w: 692,
    h: 700,
    alt: "Shortzy results with two ranked sample clips, each with a title, a score marked AI estimate and a Download MP4 button, under the line: Scores are AI estimates, not predictions of views",
    wide: { x0: 0, y0: 0, x1: 0, y1: 262, w: 692, rest: 1 },
    compact: { x0: 0, y0: 150, x1: 0, y1: 440, w: 356, rest: 1 },
    header: 68,
  },
];

/** Percent helpers: position inside a crop, as CSS percentages of the crop. */
const pctX = (s: Screen, x: number) => `${((x / s.w) * 100).toFixed(3)}%`;
const pctY = (s: Screen, y: number) => `${((y / s.h) * 100).toFixed(3)}%`;

/**
 * The app's own spinner and progress bar, redrawn exactly over the screenshot
 * (same place, size and colours) so the processing card keeps moving.
 */
function LiveCard({ s, fill }: { s: Screen; fill: MotionValue<number> }) {
  return (
    <>
      <span
        aria-hidden="true"
        className="absolute bg-[#f7f6f4]"
        style={{ left: pctX(s, 26), top: pctY(s, 25), width: pctX(s, 21), height: pctY(s, 21) }}
      >
        <svg viewBox="0 0 21 21" className="block size-full animate-spin [animation-duration:1.1s]">
          <circle
            cx="10.5"
            cy="10.5"
            r="7.3"
            fill="none"
            stroke="#252422"
            strokeWidth="2"
            strokeDasharray="34.4 11.5"
            strokeLinecap="round"
          />
        </svg>
      </span>
      {/* Card-coloured cover first: the screenshot's bar has a faint halo above and below it. */}
      <span
        aria-hidden="true"
        className="absolute bg-[#f7f6f4]"
        style={{ left: pctX(s, 21), top: pctY(s, 118), width: pctX(s, 610), height: pctY(s, 11) }}
      >
        <span
          className="absolute overflow-hidden bg-[#81807e]"
          style={{ left: `${(5 / 610) * 100}%`, top: `${(3 / 11) * 100}%`, width: `${(600 / 610) * 100}%`, height: `${(5 / 11) * 100}%` }}
        >
          <motion.span className="block size-full origin-left bg-[#008000]" style={{ scaleX: fill }} />
        </span>
      </span>
    </>
  );
}

/** A white patch over the screenshot's text caret, toggled so the caret blinks. */
function BlinkingCaret({ s, caret: [x, y, w, h] }: { s: Screen; caret: [number, number, number, number] }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    // Imperative, so AnimatePresence's initial={false} can't skip it to its last frame.
    if (!ref.current) return;
    const blink = animate(
      ref.current,
      { opacity: [0, 0, 1, 1] },
      { duration: 1.1, times: [0, 0.5, 0.5, 1], ease: "linear", repeat: Infinity },
    );
    return () => blink.stop();
  }, []);
  return (
    <span
      ref={ref}
      aria-hidden="true"
      className="absolute bg-white opacity-0"
      style={{ left: pctX(s, x), top: pctY(s, y), width: pctX(s, w), height: pctY(s, h) }}
    />
  );
}

function ScreenLayer({
  index,
  p,
  wide,
  reduce,
}: {
  index: number;
  p: MotionValue<number>;
  wide: boolean;
  reduce: boolean;
}) {
  const s = SCREENS[index];
  const v = wide ? s.wide : s.compact;
  const span = BOUNDS[index + 1] - BOUNDS[index];
  const [t0, t1] = [BOUNDS[index] + span * 0.06, BOUNDS[index + 1] - span * 0.06];
  const range = [t0, t1];
  // A small drift runs through the whole step. A long pan holds, moves, then holds,
  // so both ends of it are still frames you can read.
  const long = Math.abs(v.x1 - v.x0) + Math.abs(v.y1 - v.y0) > 40;
  const panAt = long ? [t0, t0 + (t1 - t0) * 0.4, t0 + (t1 - t0) * 0.8, t1] : range;
  const pan = (a: number, b: number) => (long ? [a, a, b, b] : [a, b]);

  // Translate percentages refer to the image itself, so a crop pixel maps to x / w.
  const tx = useTransform(p, panAt, pan((-v.x0 / s.w) * 100, (-v.x1 / s.w) * 100));
  const ty = useTransform(p, panAt, pan((-v.y0 / s.h) * 100, (-v.y1 / s.h) * 100));
  const x = useMotionTemplate`${tx}%`;
  const y = useMotionTemplate`${ty}%`;
  const fill = useTransform(p, range, s.live ?? [0, 0]);
  const present = useIsPresent();

  const r = v.rest ?? 0;
  const still = {
    x: `${((-(v.x0 + (v.x1 - v.x0) * r) / s.w) * 100).toFixed(3)}%`,
    y: `${((-(v.y0 + (v.y1 - v.y0) * r) / s.h) * 100).toFixed(3)}%`,
  };

  return (
    <motion.div
      className="absolute inset-0"
      initial={reduce ? false : { opacity: 0, y: 14, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={reduce ? undefined : { opacity: 0, y: -10, scale: 1.01 }}
      transition={{ ...SPRING, opacity: { duration: 0.3, ease: EASE } }}
      aria-hidden={present ? undefined : true}
    >
      <motion.div
        className="absolute left-0 top-0"
        style={{ width: `${((s.w / v.w) * 100).toFixed(3)}%`, ...(reduce ? still : { x, y }) }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={s.src}
          alt={s.alt}
          width={s.w}
          height={s.h}
          decoding="async"
          draggable={false}
          className="block h-auto w-full select-none"
        />
        {s.live && !reduce && <LiveCard s={s} fill={fill} />}
        {s.caret && !reduce && <BlinkingCaret s={s} caret={s.caret} />}
      </motion.div>
      {s.header && wide && (
        // The results header ("Scores are AI estimates, not predictions of views.") stays put
        // while the clip cards drift under it, so the qualifier is always next to the scores.
        <div
          aria-hidden="true"
          className="absolute left-0 top-0 overflow-hidden border-b border-pebble/60 bg-white"
          style={{
            width: `${((s.w / v.w) * 100).toFixed(3)}%`,
            aspectRatio: `${s.w} / ${s.header}`,
            translate: `${((-v.x0 / s.w) * 100).toFixed(3)}% 0`,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={s.src} alt="" width={s.w} height={s.h} draggable={false} className="block h-auto w-full select-none" />
        </div>
      )}
    </motion.div>
  );
}

/* --------------------------------------------------------- Behind the scenes */

const STATIONS = ["Import", "Estimate", "Find moments", "Edit", "Export"];
const AI_STATION = 2;

/** Console geometry: station x in % of the track, lane centres in px. */
type Geo = { x: number[]; down: number; up: number; y1: number; y2: number; h: number };
const GEO_WIDE: Geo = { x: [7, 27, 50, 73, 93], down: 42.5, up: 57.5, y1: 14, y2: 74, h: 88 };
const GEO_COMPACT: Geo = { x: [8.5, 30, 50, 71.5, 91], down: 42, up: 58, y1: 13, y2: 75, h: 88 };

/** Packet route, keyed to scroll progress. It leaves your computer only in step 3. */
const ROUTE = [0, 0.12, 0.19, 0.31, 0.36, 0.41, 0.53, 0.58, 0.62, 0.77, 0.84, 1];

function LaneLabel({
  icon: Icon,
  tone,
  title,
  sub,
  style,
  className,
}: {
  icon: LucideIcon;
  tone: "coral" | "oat";
  title: string;
  sub?: string;
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <span className={cn("absolute left-0 flex items-center gap-2", className)} style={style}>
      <span className="grid size-6 shrink-0 place-items-center rounded-md bg-white/[0.08]">
        <Icon className={cn("size-3.5", tone === "coral" ? "text-coral" : "text-oat")} />
      </span>
      <span className="leading-tight">
        <span className="block text-[0.8125rem] font-semibold text-white/90">{title}</span>
        {sub && <span className="block text-[0.6875rem] text-white/60">{sub}</span>}
      </span>
    </span>
  );
}

function Console({
  p,
  step,
  wide,
  reduce,
}: {
  p: MotionValue<number>;
  step: number;
  wide: boolean;
  reduce: boolean;
}) {
  const g = wide ? GEO_WIDE : GEO_COMPACT;
  const [imp, est, , edit, exp] = g.x;
  const runX = [imp, imp, est, est, g.down, g.down, g.up, g.up, edit, edit, exp, exp];
  const runY = [g.y1, g.y1, g.y1, g.y1, g.y1, g.y2, g.y2, g.y1, g.y1, g.y1, g.y1, g.y1];
  const trailX = [imp, imp, est, est, g.down, g.down, g.down, g.up, edit, edit, exp, exp];
  const toTrail = (x: number) => (x - imp) / (exp - imp);

  const px = useTransform(p, ROUTE, runX);
  const packetX = useMotionTemplate`${px}%`;
  const packetY = useTransform(p, ROUTE, runY);
  const trail = useTransform(p, ROUTE, trailX.map(toTrail));
  const downFill = useTransform(p, [0.36, 0.41], [0, 1]);
  const upFill = useTransform(p, [0.53, 0.58], [0, 1]);
  const outChip = useTransform(p, [0.34, 0.355, 0.465, 0.48], [0, 1, 1, 0]);
  const backChip = useTransform(p, [0.48, 0.495, 0.6, 0.615], [0, 1, 1, 0]);

  // Reduced motion: explicit at-rest values for the selected step.
  const restTrail = toTrail([imp, est, g.down, edit, exp][step]);
  const crossed = step >= AI_STATION ? 1 : 0;
  const chips = step === AI_STATION ? 1 : 0;

  const lane1 = { left: `${imp}%`, width: `${exp - imp}%`, top: g.y1 };
  const chipTop = (g.y1 + g.y2) / 2;

  return (
    <div aria-hidden="true" className="bg-deep px-4 pb-3.5 pt-3 text-white sm:px-5 sm:pb-5 sm:pt-4">
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-rose">
          Behind the scenes
        </p>
        {!wide && (
          // Phones: lane names sit at the ends of the lanes so the console stays short.
          <span className="flex items-center gap-1.5 text-[0.6875rem] font-semibold leading-none text-white/80">
            <Laptop className="size-3 text-coral" /> Your computer
          </span>
        )}
      </div>

      <div className={cn("mt-2.5 sm:mt-3", wide && "grid grid-cols-[128px_minmax(0,1fr)]")}>
        {wide && (
          <div className="relative" style={{ height: g.h }}>
            <LaneLabel icon={Laptop} tone="coral" title="Your computer" className="-translate-y-1/2" style={{ top: g.y1 }} />
            <LaneLabel
              icon={Cloud}
              tone="oat"
              title="Your AI"
              sub="Gemini or Qwen"
              className="-translate-y-1/2"
              style={{ top: g.y2 }}
            />
          </div>
        )}

        <div className="relative" style={{ height: g.h }}>
          {/* Lanes and the two links between them */}
          <span className="absolute h-px -translate-y-1/2 bg-white/15" style={lane1} />
          <motion.span
            className="absolute h-[2px] origin-left -translate-y-1/2 rounded-full bg-coral"
            style={{ ...lane1, scaleX: reduce ? restTrail : trail }}
          />
          <span
            className="absolute inset-x-0 border-t border-dashed border-white/15"
            style={{ top: g.y2 }}
          />
          {[g.down, g.up].map((x, i) => (
            <span
              key={x}
              className="absolute w-[2px] -translate-x-1/2 overflow-hidden bg-white/15"
              style={{ left: `${x}%`, top: g.y1, height: g.y2 - g.y1 }}
            >
              <motion.span
                className={cn("block size-full bg-oat", i === 0 ? "origin-top" : "origin-bottom")}
                style={{ scaleY: reduce ? crossed : i === 0 ? downFill : upFill }}
              />
            </span>
          ))}

          {!wide && (
            // The AI lane holds one station, so its label sits on the lane, right of it.
            <span
              className="absolute flex -translate-y-1/2 items-start gap-1 whitespace-nowrap bg-deep pl-1.5 text-[0.6875rem] leading-[1.2]"
              style={{ top: g.y2, left: `calc(${g.x[AI_STATION]}% + 52px)` }}
            >
              <Cloud className="mt-px size-3 shrink-0 text-oat" />
              <span>
                <span className="block font-semibold text-white/80">Your AI</span>
                <span className="block text-white/60">Gemini or Qwen</span>
              </span>
            </span>
          )}

          {/* What travels: shown only while it is on the way */}
          <motion.span
            className={cn(
              "absolute mr-2 flex -translate-y-1/2 items-center gap-1 rounded-[10px] border border-oat/45 bg-deep px-2 py-[3px] font-mono text-[0.6875rem] leading-[1.25] text-oat",
              wide ? "whitespace-nowrap" : "max-w-[118px] text-right",
            )}
            style={{ right: `${100 - g.down}%`, top: chipTop, opacity: reduce ? chips : outChip }}
          >
            {wide && <ArrowDown className="size-3 shrink-0" />}
            Prepared audio and video
          </motion.span>
          <motion.span
            className="absolute ml-2 flex -translate-y-1/2 items-center gap-1 whitespace-nowrap rounded-[10px] border border-oat/45 bg-deep px-2 py-[3px] font-mono text-[0.6875rem] leading-[1.25] text-oat"
            style={{ left: `${g.up}%`, top: chipTop, opacity: reduce ? chips : backChip }}
          >
            <ArrowUp className="size-3 shrink-0" />
            Editing plan
          </motion.span>

          {/* The packet slips behind each station pill when it arrives */}
          <motion.div
            className="absolute inset-0"
            style={
              reduce
                ? { x: `${g.x[step]}%`, y: step === AI_STATION ? g.y2 : g.y1 }
                : { x: packetX, y: packetY }
            }
          >
            <span className="absolute left-0 top-0 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-coral ring-[3px] ring-deep" />
          </motion.div>

          {STATIONS.map((name, i) => {
            const ai = i === AI_STATION;
            const state = i === step ? "active" : i < step ? "done" : "next";
            return (
              <span
                key={name}
                className={cn(
                  "absolute flex -translate-x-1/2 -translate-y-1/2 items-center whitespace-nowrap rounded-full border font-medium transition-[background-color,border-color,color] duration-300 ease-brand",
                  wide ? "h-7 px-3 text-[0.75rem]" : "h-[26px] px-2.5 text-[0.6875rem]",
                  state === "active" && (ai ? "border-oat bg-oat text-deep" : "border-coral bg-coral text-deep"),
                  state === "done" && (ai ? "border-oat/45 bg-deep text-white/85" : "border-coral/45 bg-deep text-white/85"),
                  state === "next" && "border-white/15 bg-deep text-white/55",
                )}
                style={{ left: `${g.x[i]}%`, top: ai ? g.y2 : g.y1 }}
              >
                {name}
              </span>
            );
          })}
        </div>
      </div>

      {/* One caption line per step, stacked so the tallest sets the height */}
      <div className="mt-3 grid border-t border-white/10 pt-2.5 sm:mt-3.5 sm:pt-3">
        {STEPS.map((s, i) => (
          <p
            key={s.title}
            className={cn(
              "col-start-1 row-start-1 font-mono leading-[1.55] text-white/85 transition-[opacity,translate] duration-300 ease-brand",
              wide ? "text-[0.8125rem]" : "text-[0.875rem] leading-[1.45]",
              i === step ? "opacity-100" : "translate-y-1 opacity-0",
            )}
          >
            <span className="tabular mr-2 text-coral">0{i + 1}</span>
            {s.behind}
          </p>
        ))}
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------- Stage */

function Stage({
  p,
  step,
  wide,
  reduce,
}: {
  p: MotionValue<number>;
  step: number;
  wide: boolean;
  reduce: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-[20px] border border-pebble bg-white shadow-[0_30px_60px_-40px_rgba(41,38,40,0.55)] sm:rounded-[24px]">
      <div className="relative flex h-7 items-center border-b border-pebble/70 bg-paper px-3 sm:h-9 sm:px-4">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="size-2.5 rounded-full bg-coral" />
          <span className="size-2.5 rounded-full bg-oat" />
          <span className="size-2.5 rounded-full bg-pebble" />
        </span>
        <span className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-[0.6875rem] font-medium text-mute sm:text-[0.75rem]">
          Sample workspace
        </span>
        <span className="ml-auto font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-mute">On screen</span>
      </div>

      <div className="relative aspect-[8/5] overflow-hidden bg-white sm:aspect-[2/1]">
        <AnimatePresence initial={false}>
          <ScreenLayer key={step} index={step} p={p} wide={wide} reduce={reduce} />
        </AnimatePresence>
      </div>

      <Console p={p} step={step} wide={wide} reduce={reduce} />
    </div>
  );
}

/** All mascot poses stacked in one box, crossfading, so a pose change never waits on a download. */
function PoseStack({ pose, size, className }: { pose: MascotPose; size: number; className?: string }) {
  const poses: MascotPose[] = ["welcome", "thinking", "clipping", "celebration"];
  return (
    <div aria-hidden="true" className={cn("grid shrink-0", className)} style={{ width: size, height: size }}>
      {poses.map((name) => (
        <Mascot
          key={name}
          pose={name}
          size={size}
          className={cn(
            "col-start-1 row-start-1 transition-[opacity,translate] duration-300 ease-brand",
            name === pose ? "opacity-100" : "translate-y-2 opacity-0",
          )}
        />
      ))}
    </div>
  );
}

/** Phone and tablet step readout (visual only; the step list is read by screen readers). */
function Readout({ step }: { step: number }) {
  return (
    <div aria-hidden="true" className="lg:hidden">
      <div className="flex items-center gap-3">
        <PoseStack pose={STEPS[step].pose} size={48} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <p className="tabular shrink-0 font-mono text-[0.75rem] text-maroon">Step 0{step + 1} of 05</p>
            <div className="flex flex-1 gap-1">
              {STEPS.map((s, i) => (
                <span
                  key={s.title}
                  className={cn(
                    "h-1 flex-1 rounded-full transition-colors duration-300",
                    i <= step ? "bg-maroon" : "bg-pebble",
                  )}
                />
              ))}
            </div>
          </div>
          <div className="mt-1 grid">
            {STEPS.map((s, i) => (
              <p
                key={s.title}
                className={cn(
                  "col-start-1 row-start-1 text-[1.0625rem] font-semibold leading-snug transition-opacity duration-300",
                  i === step ? "opacity-100" : "opacity-0",
                )}
              >
                {s.title}
              </p>
            ))}
          </div>
        </div>
      </div>
      {/* On short screens the console caption carries the step; the sentence makes room. */}
      <div className="mt-2 grid [@media(max-height:749px)]:hidden">
        {STEPS.map((s, i) => (
          <p
            key={s.title}
            className={cn(
              "col-start-1 row-start-1 text-[0.9375rem] leading-relaxed text-mute transition-opacity duration-300",
              i === step ? "opacity-100" : "opacity-0",
            )}
          >
            {s.body}
          </p>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------- Section */

export function HowItWorks() {
  const trackRef = useRef<HTMLDivElement>(null);
  const reduce = usePrefersReducedMotion();
  const isDesktop = useMediaQuery("(min-width: 1024px)", true);
  const wide = useMediaQuery("(min-width: 640px)", true);
  const pinned = !reduce;
  const jump = isDesktop && pinned;
  // Reduced motion: the list picks the step where it sits beside the stage; on narrower screens
  // the stage sits below the list, so a row of step buttons goes right above it instead.
  const pick = reduce && isDesktop;
  // On phones the heading scrolls away first, so the pinned stage gets the whole screen.
  const headingAbove = pinned && !isDesktop;

  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });
  const still = useMotionValue(0);
  const p = reduce ? still : scrollYProgress;

  const [scrollStep, setScrollStep] = useState(0);
  const [picked, setPicked] = useState(0);
  const step = reduce ? picked : scrollStep;
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const i = Math.min(STEPS.length - 1, Math.max(0, BOUNDS.findLastIndex((b) => v >= b)));
    setScrollStep((s) => (s === i ? s : i));
  });

  // Fetch every screen once the section is close, so step changes never show an empty window.
  const near = useInView(trackRef, { once: true, margin: "100% 0px 100% 0px" });
  useEffect(() => {
    if (!near) return;
    for (const s of SCREENS) {
      const img = new Image();
      img.src = s.src;
    }
  }, [near]);

  const goTo = (i: number) => {
    const el = trackRef.current;
    if (!el) return;
    const range = el.offsetHeight - window.innerHeight;
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + range * REST[i], behavior: "smooth" });
  };

  const heading = (
    <>
      <Eyebrow>How it works</Eyebrow>
      <h2
        id="how-title"
        className="mt-3 text-balance font-display text-[clamp(1.75rem,3.2vw,2.5rem)] font-bold leading-[1.04] tracking-[-0.03em]"
      >
        What you see, <span className="text-maroon lg:block">and what Shortzy is doing.</span>
      </h2>
    </>
  );

  return (
    <section id="how-it-works" aria-labelledby="how-title" className="relative bg-paper">
      {headingAbove && <Container className="pt-20 sm:pt-24">{heading}</Container>}

      <div ref={trackRef} className={cn(pinned ? "h-[460vh] lg:h-[440vh]" : "py-24 sm:py-32")}>
        <div className={cn(pinned && "sticky top-[72px] flex h-[calc(100svh-72px)] items-center overflow-hidden")}>
          <Container
            className={cn(
              "grid items-center lg:grid-cols-[minmax(0,5fr)_minmax(0,9fr)] lg:gap-12",
              headingAbove ? "gap-0" : "gap-8",
            )}
          >
            <div>
              {!headingAbove && heading}

              <ol className={cn("mt-5 space-y-1 lg:mt-7", pinned && "sr-only lg:not-sr-only")}>
                {STEPS.map((s, i) => {
                  const active = i === step;
                  const open = reduce || active;
                  const Item = jump || pick ? "button" : "div";
                  const itemProps =
                    jump || pick
                      ? {
                          type: "button" as const,
                          onClick: () => (reduce ? setPicked(i) : goTo(i)),
                          "aria-pressed": reduce ? active : undefined,
                        }
                      : {};
                  return (
                    <li key={s.title}>
                      <Item
                        {...itemProps}
                        aria-current={pinned && active ? "step" : undefined}
                        className={cn(
                          "grid min-h-11 w-full grid-cols-[36px_1fr] gap-x-2 rounded-xl px-3 py-2.5 text-left transition-[background-color,transform] duration-100 active:scale-[0.99]",
                          active ? "bg-white" : "hover:bg-white/60",
                        )}
                      >
                        <span className={cn("tabular pt-0.5 font-mono text-[0.8125rem]", active ? "text-maroon" : "text-mute")}>
                          0{i + 1}
                        </span>
                        <span>
                          <span
                            className={cn(
                              "block text-[1.0625rem] font-semibold leading-snug",
                              active || reduce ? "text-ink" : "text-mute",
                            )}
                          >
                            {s.title}
                          </span>
                          <span
                            className={cn(
                              "grid transition-[grid-template-rows,opacity] duration-300 ease-brand",
                              open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                            )}
                          >
                            <span className="overflow-hidden">
                              <span className="block pt-1 text-[0.9375rem] leading-relaxed text-mute">{s.body}</span>
                              <span className="sr-only">Behind the scenes: {s.behind}</span>
                            </span>
                          </span>
                        </span>
                      </Item>
                    </li>
                  );
                })}
              </ol>

              <PoseStack pose={STEPS[step].pose} size={128} className="mt-6 hidden lg:grid" />
            </div>

            <div>
              {pinned && (
                <div className="mx-auto mb-2.5 w-full max-w-[720px] sm:mb-4 lg:hidden">
                  <Readout step={step} />
                </div>
              )}
              {reduce && !isDesktop && (
                <div role="group" aria-label="Show a step" className="mx-auto mb-3 flex w-full max-w-[720px] gap-1.5">
                  {STEPS.map((s, i) => (
                    <button
                      key={s.title}
                      type="button"
                      aria-pressed={i === step}
                      onClick={() => setPicked(i)}
                      className={cn(
                        "tabular h-11 flex-1 rounded-xl font-mono text-[0.8125rem] transition-colors duration-150",
                        i === step ? "bg-maroon text-white" : "bg-white text-mute hover:text-ink",
                      )}
                    >
                      0{i + 1}
                      <span className="sr-only"> {s.title}</span>
                    </button>
                  ))}
                </div>
              )}
              <div
                className={cn(
                  "mx-auto w-full max-w-[720px]",
                  pinned &&
                    "sm:max-w-[min(720px,calc((100svh-500px)*2))] lg:max-w-[min(720px,calc((100svh-360px)*2))]",
                )}
              >
                {/* Remount when the motion preference or window shape changes: scroll-linked values bind once. */}
                <Stage
                  key={`${reduce ? "still" : "scroll"}-${wide ? "wide" : "compact"}`}
                  p={p}
                  step={step}
                  wide={wide}
                  reduce={reduce}
                />
              </div>
            </div>
          </Container>
        </div>
      </div>
    </section>
  );
}
