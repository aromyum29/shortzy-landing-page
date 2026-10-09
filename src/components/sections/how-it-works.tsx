"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { ArrowDown, ArrowUp, Cloud, Laptop } from "lucide-react";
import { Container, Eyebrow } from "@/components/ui/container";
import { Mascot, type MascotPose } from "@/components/brand/mascot";
import { DemoClock } from "@/components/mockups/app-demo/context";
import { AI, CLIPS, COST, PROJECT } from "@/components/mockups/app-demo/data";
import { appFont } from "@/components/mockups/app-demo/font";
import { AppView } from "@/components/mockups/app-demo/screens";
import {
  BEATS,
  beatIndex,
  CANVAS_H,
  CANVAS_W,
  FRAMES,
  LOOP,
  processProgressAt,
  scrollAt,
  type Frame,
  type View,
} from "@/components/mockups/app-demo/timeline";
import { useMediaQuery } from "@/hooks/use-media-query";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { cn } from "@/lib/utils";

/*
 * How it works: a pinned, scroll-driven stage with two layers.
 *  - On screen: the hero demo's coded app screens (same sample workspace),
 *    seen through a camera that frames one part of the app per step. In steps
 *    3 and 4 the demo clock follows the scroll, so the progress bar fills.
 *  - Behind the scenes: a slim console with two lanes, your computer and your
 *    AI provider. A packet follows the scroll and only crosses to the AI lane
 *    in step 3, which is the one paid AI call.
 * If the pinned stage does not fit the screen (short windows, large text),
 * the section falls back to the static layout used for reduced motion.
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
    body: "Choose 1 to 10 clips, a caption style and, if you like, a topic. Check the estimated AI cost, then press Find my clips.",
    behind:
      "Works out a cost range from the video's length, your options and your model. No paid AI call yet. Your provider bills what you use.",
    pose: "welcome",
  },
  {
    title: "Shortzy and your AI find the moments",
    body: "They look for a clear hook and a complete payoff. If only 6 hold up, you get 6, not filler.",
    behind:
      "Sends a prepared copy of the audio and video to your Gemini or Qwen account. An editing plan comes back, and Shortzy checks it before using it.",
    pose: "thinking",
  },
  {
    title: "Your computer makes the shorts",
    body: "Each moment is trimmed, reframed to 9:16 and captioned on your Mac or Windows PC.",
    behind:
      "Bundled video tools and on-device face tracking do the work. No face found? It uses a centered crop and tells you.",
    pose: "clipping",
  },
  {
    title: "Review and export",
    body: "Clips arrive titled and ranked, with the reasons each was picked. Download one MP4 or the whole set as a ZIP.",
    behind: "Sorts by editorial score and keeps earlier clip sets in your folder. The score explains a pick; it doesn't predict views.",
    pose: "celebration",
  },
];

/** Text alternative for each step's screen (the canvas itself is decorative). */
const SCREEN_ALT = [
  "Sample workspace in Shortzy: the upload form with a podcast video file chosen and a Create project button.",
  `Sample workspace in Shortzy: the cost estimate on ${AI.provider} ${AI.model} for a ${PROJECT.length} video. Estimated AI cost ${COST.estimate} USD; your provider bills the AI usage and actual cost may vary.`,
  "Sample workspace in Shortzy: the processing card reading Finding your strongest moments, with a progress bar.",
  "Sample workspace in Shortzy: the processing card reading Framing and captioning your shorts, with a progress bar.",
  "Sample workspace in Shortzy: ranked sample clips, each with a title, a score marked AI estimate and a reason, under the line: Scores are AI estimates, not predictions of views.",
];

/** Scroll progress where each step starts. Step 3 gets the most room: it is the round trip to your AI. */
const BOUNDS = [0, 0.17, 0.34, 0.6, 0.8, 1];
/** Where the jump buttons land: a settled moment inside each step. */
const REST = [0.07, 0.3, 0.44, 0.7, 0.95];

/** Critically damped: no overshoot. */
const SPRING = { type: "spring", bounce: 0, visualDuration: 0.45 } as const;
const EASE = [0.2, 0.8, 0.2, 1] as const;

/** The part of a step's scroll range that drives its clock and camera (a short hold at both ends). */
function stepRange(i: number): [number, number] {
  const span = BOUNDS[i + 1] - BOUNDS[i];
  return [BOUNDS[i] + span * 0.06, BOUNDS[i + 1] - span * 0.06];
}

/* ------------------------------------------------------------ Demo clock */

type Run = readonly [number, number];

/** The longest stretch of the hero demo's timeline whose frames all pass `ok`. */
function longestRun(ok: (f: Frame) => boolean): Run {
  let best: Run = [0, 0];
  let start = -1;
  for (let i = 0; i <= FRAMES.length; i++) {
    const pass = i < FRAMES.length && ok(FRAMES[i]);
    if (pass && start < 0) start = BEATS[i];
    if (!pass && start >= 0) {
      const end = i < BEATS.length ? BEATS[i] : LOOP;
      if (end - start > best[1] - best[0]) best = [start, end];
      start = -1;
    }
  }
  return best;
}

/** Like longestRun, but prefers frames with nothing hovered or pressed. */
function calmRun(ok: (f: Frame) => boolean): Run {
  const calm = longestRun((f) => ok(f) && f.hover === null && f.press === null);
  return calm[1] > calm[0] ? calm : longestRun(ok);
}

/** First time (10 ms grid) in a run where `ok` holds, or `fallback`. */
function firstTime(run: Run, ok: (t: number) => boolean, fallback: number) {
  for (let t = run[0]; t < run[1]; t += 10) if (ok(t)) return t;
  return fallback;
}

/**
 * The clock range scrubbed across each step (`from` equals `to` when the step
 * holds one frame), the frame shown with reduced motion, and the view whose
 * scroll offsets the camera. All are read from the hero demo's own frame model,
 * so they follow it when the demo is retimed.
 */
type Plan = { from: number; to: number; still: number; view: View };

const PLANS: Plan[] = (() => {
  const hold = (run: Run, at: number) => run[0] + (run[1] - run[0]) * at;
  const upload = calmRun((f) => f.view === "upload" && f.drop === "selected" && !f.nameFlash && !f.ghost && f.create === "enabled");
  const estimate = calmRun((f) => f.view === "review" && f.stage === "estimate" && f.estimateReady);
  const find = longestRun((f) => f.view === "finish" && !f.results && !f.framing);
  const edit = longestRun((f) => f.view === "finish" && !f.results && f.framing);
  const results = longestRun((f) => f.view === "finish" && f.results && f.cardsIn);
  // Results: once the view has scrolled to the clip cards.
  const settled = scrollAt("finish", results[1] - 1);
  const ranked: Run = [firstTime(results, (t) => scrollAt("finish", t) >= settled - 0.5, results[0]), results[1]];
  // Editing: until the progress bar is full.
  const editEnd = Math.max(edit[0] + 10, firstTime(edit, (t) => processProgressAt(t) >= 0.999, edit[1] - 10));
  const t1 = hold(upload, 0.5);
  const t2 = hold(estimate, 0.5);
  const t5 = hold(ranked, 0.25);
  return [
    { from: t1, to: t1, still: t1, view: "upload" },
    { from: t2, to: t2, still: t2, view: "review" },
    { from: hold(find, 0.03), to: find[1] - 10, still: hold(find, 0.5), view: "finish" },
    { from: edit[0] + 10, to: editEnd, still: hold([edit[0], editEnd], 0.6), view: "finish" },
    { from: t5, to: t5, still: t5, view: "finish" },
  ];
})();

/* ---------------------------------------------------------------- Camera */

type Span = readonly [number, number];

/**
 * Where each window edge may fall, in canvas px (page coordinates of the view,
 * before it scrolls): only in gaps between UI blocks, so the window never cuts
 * a word. The must-see box is [l[1], t[1], r[0], b[0]] and already includes a
 * small margin. The canvas left of x 240 is blank here (no sidebar is drawn).
 */
type Shot = { l: Span; r: Span; t: Span; b: Span };

const FREE_L: Span = [-300, 228];
const FREE_R: Span = [1260, 1600];

// 1 Upload: the form card with the file chosen (card x 240 to 842, y 302 to 749; side column from x 883).
const UPLOAD_CARD: Shot = { l: [150, 228], r: [854, 879], t: [273, 290], b: [761, 1100] };
const UPLOAD_FILE: Shot = { l: [150, 228], r: [854, 879], t: [401, 405], b: [761, 1100] };
const UPLOAD_ALL: Shot = { l: FREE_L, r: FREE_R, t: [36, 81], b: [786, 1300] };
// 2 Estimate (review view): eyebrow with the model, cost card, recap, billing note.
const ESTIMATE_WIDE: Shot = { l: [-300, 352], r: [1136, 1600], t: [272, 323], b: [796, 829] };
const ESTIMATE_NARROW: Shot = { l: [-300, 352], r: [870, 882], t: [272, 323], b: [796, 829] };
const ESTIMATE_SHORT: Shot = { l: [-300, 352], r: [870, 882], t: [272, 323], b: [672, 692] };
const ESTIMATE_ALL: Shot = { l: [-300, 352], r: FREE_R, t: [272, 323], b: [890, 1500] };
// 3 and 4 Processing card (x 240 to 1248, y 302 to 492) under the project header and stepper,
// best with the app's own top bar ("Stored locally") in view.
const PROCESS_TOP: Shot = { l: FREE_L, r: FREE_R, t: [-12, 12], b: [504, 1300] };
const PROCESS_NARROW_TOP: Shot = { l: FREE_L, r: [890, 917], t: [-12, 12], b: [504, 1300] };
const PROCESS_FULL: Shot = { l: FREE_L, r: FREE_R, t: [58, 81], b: [504, 1300] };
const PROCESS_NARROW: Shot = { l: FREE_L, r: [890, 917], t: [58, 81], b: [504, 1300] };
const PROCESS_CARD: Shot = { l: FREE_L, r: [853, 1150], t: [272, 290], b: [504, 1300] };
// 5 Results: header with the score qualifier, then full clip cards (three columns from x 240, 583, 925).
const RESULTS_ALL: Shot = { l: FREE_L, r: FREE_R, t: [451, 469], b: [1177, 1187] };
const RESULTS_TWO: Shot = { l: FREE_L, r: [913, 921], t: [451, 469], b: [1177, 1187] };
// Phones: from the qualifier line (the "Made from your video." heading just above is left out).
const RESULTS_TWO_TIGHT: Shot = { l: FREE_L, r: [913, 921], t: [508, 513], b: [1173, 1187] };

/** Candidate shots per step, best first: wide windows (640px and up) and phones. */
const SHOTS: { wide: Shot[]; compact: Shot[] }[] = [
  { wide: [UPLOAD_CARD, UPLOAD_FILE, UPLOAD_ALL], compact: [UPLOAD_CARD, UPLOAD_FILE, UPLOAD_ALL] },
  { wide: [ESTIMATE_WIDE, ESTIMATE_ALL], compact: [ESTIMATE_NARROW, ESTIMATE_SHORT, ESTIMATE_ALL] },
  { wide: [PROCESS_TOP, PROCESS_FULL], compact: [PROCESS_NARROW_TOP, PROCESS_NARROW, PROCESS_CARD, PROCESS_FULL] },
  { wide: [PROCESS_TOP, PROCESS_FULL], compact: [PROCESS_NARROW_TOP, PROCESS_NARROW, PROCESS_CARD, PROCESS_FULL] },
  { wide: [RESULTS_ALL], compact: [RESULTS_TWO, RESULTS_TWO_TIGHT, RESULTS_ALL] },
];

/** Visible canvas region: top-left corner and width (height is width / aspect). */
type Cam = { x: number; y: number; w: number };

/** How much wider the step opens than it settles: a slow push-in across the step. */
const PUSH = 1.05;

const clampTo = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), Math.max(lo, hi));
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;

/** Fit a shot to a window of this aspect, or null if no framing keeps every edge in a gap. */
function fitShot(s: Shot, aspect: number, dy: number, force = false): { start: Cam; end: Cam } | null {
  const t: Span = [s.t[0] - dy, s.t[1] - dy];
  const b: Span = [s.b[0] - dy, s.b[1] - dy];
  const need = Math.max(s.r[0] - s.l[1], aspect * (b[0] - t[1]));
  const room = Math.min(s.r[1] - s.l[0], aspect * (b[1] - t[0]));
  if (need > room + 0.5 && !force) return null;
  const cx = (s.l[1] + s.r[0]) / 2;
  const cy = (t[1] + b[0]) / 2;
  const at = (w: number): Cam => {
    const h = w / aspect;
    return {
      w,
      x: clampTo(cx - w / 2, Math.max(s.l[0], s.r[0] - w), Math.min(s.l[1], s.r[1] - w)),
      y: clampTo(cy - h / 2, Math.max(t[0], b[0] - h), Math.min(t[1], b[1] - h)),
    };
  };
  return { end: at(need), start: at(Math.max(need, Math.min(room, need * PUSH))) };
}

function frameStep(index: number, compact: boolean, aspect: number) {
  const shots = SHOTS[index][compact ? "compact" : "wide"];
  const plan = PLANS[index];
  const dy = scrollAt(plan.view, plan.still);
  for (const s of shots) {
    const fit = fitShot(s, aspect, dy);
    if (fit) return fit;
  }
  return fitShot(shots[shots.length - 1], aspect, dy, true)!;
}

/* ----------------------------------------------------------------- On screen */

/** Visible region at step progress u (0 to 1), as the canvas transform for a window `width` px wide. */
function camAt(fit: { start: Cam; end: Cam }, u: number, width: number) {
  const w = lerp(fit.start.w, fit.end.w, u);
  const k = width / w;
  return { k, x: -lerp(fit.start.x, fit.end.x, u) * k, y: -lerp(fit.start.y, fit.end.y, u) * k };
}

function ShotLayer({
  index,
  p,
  size,
  compact,
  frozen,
  reduce,
}: {
  index: number;
  p: MotionValue<number>;
  size: { w: number; h: number };
  compact: boolean;
  frozen: boolean;
  reduce: boolean;
}) {
  const plan = PLANS[index];
  const range = stepRange(index);
  const scrubbed = useTransform(p, range, [plan.from, plan.to]);
  const held = useMotionValue(plan.still);
  const t = frozen ? held : scrubbed;

  // Re-render only when the demo's discrete frame changes.
  const [beat, setBeat] = useState(() => beatIndex(frozen ? plan.still : plan.from));
  useMotionValueEvent(t, "change", (v) => {
    const b = beatIndex(v);
    setBeat((s) => (s === b ? s : b));
  });
  const f = useMemo<Frame>(() => ({ ...FRAMES[beat], hover: null, press: null, playing: false }), [beat]);

  const fit = frameStep(index, compact, size.w / size.h);
  const u = useTransform(p, range, [0, 1]);
  const x = useTransform(u, (v) => camAt(fit, v, size.w).x);
  const y = useTransform(u, (v) => camAt(fit, v, size.w).y);
  const scale = useTransform(u, (v) => camAt(fit, v, size.w).k);
  const rest = camAt(fit, 1, size.w);

  return (
    <motion.div
      className="absolute inset-0 overflow-hidden bg-white"
      initial={reduce ? false : { opacity: 0, scale: 0.985 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={reduce ? undefined : { opacity: 0 }}
      transition={{ ...SPRING, opacity: { duration: 0.3, ease: EASE } }}
    >
      <DemoClock.Provider value={{ t, still: frozen }}>
        <motion.div
          className={cn(
            appFont.className,
            "absolute left-0 top-0 overflow-hidden bg-white text-[14px] leading-[1.55] text-[#252327] antialiased",
          )}
          style={{
            width: CANVAS_W,
            height: CANVAS_H,
            originX: 0,
            originY: 0,
            ...(frozen ? { x: rest.x, y: rest.y, scale: rest.k } : { x, y, scale }),
          }}
        >
          {/* A fresh presence scope: the screen mounts in its settled state, without entrance animations. */}
          <AnimatePresence initial={false}>
            <div key="view" className="absolute inset-0">
              <AppView f={f} />
            </div>
          </AnimatePresence>
        </motion.div>
      </DemoClock.Provider>
    </motion.div>
  );
}

/** The app window's screen: measures itself and frames the current step. */
function Screen({
  step,
  p,
  compact,
  frozen,
  reduce,
  screenRef,
  height,
}: {
  step: number;
  p: MotionValue<number>;
  compact: boolean;
  frozen: boolean;
  reduce: boolean;
  screenRef: React.RefObject<HTMLDivElement | null>;
  height?: number;
}) {
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  useLayoutEffect(() => {
    const el = screenRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      setSize((s) => (w > 0 && h > 0 && (!s || s.w !== w || s.h !== h) ? { w, h } : s));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [screenRef]);

  return (
    <div
      ref={screenRef}
      role="img"
      aria-label={SCREEN_ALT[step]}
      className={cn("relative overflow-hidden bg-white", height === undefined && (compact ? "aspect-square" : "aspect-[16/10]"))}
      style={height === undefined ? undefined : { height }}
    >
      <div aria-hidden="true" inert className="absolute inset-0">
        {size && (
          <AnimatePresence initial={false}>
            <ShotLayer key={step} index={step} p={p} size={size} compact={compact} frozen={frozen} reduce={reduce} />
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

/* --------------------------------------------------------- Behind the scenes */

const STATIONS = ["Import", "Estimate", "Find moments", "Edit", "Export"];
const AI_STATION = 2;
/** Packet route, keyed to scroll progress. It leaves your computer only in step 3. */
const ROUTE = [0, 0.12, 0.19, 0.31, 0.36, 0.41, 0.53, 0.58, 0.62, 0.77, 0.84, 1];

/** Lane rows in rem (your computer, the link between, your AI), so the console scales with text size. */
const ROWS = { wide: [2, 1.5, 2.25], compact: [1.75, 2, 1.75] } as const;

/**
 * Station centers, the two AI links and the AI pill's edges, in % of the track width (measured from
 * the pills). On phones the AI lane label goes on whichever side of its pill has room, and drops its
 * second line when neither side fits it (large text on a narrow screen).
 */
type Geo = { x: number[]; down: number; up: number; aiLeft: number; aiRight: number; side: "right" | "left"; sub: boolean };
const GEO_START: Geo = { x: [8, 29, 50, 72, 92], down: 45, up: 55, aiLeft: 42, aiRight: 58, side: "right", sub: true };

function Console({
  p,
  step,
  wide,
  frozen,
}: {
  p: MotionValue<number>;
  step: number;
  wide: boolean;
  frozen: boolean;
}) {
  const rows = wide ? ROWS.wide : ROWS.compact;
  const total = rows[0] + rows[1] + rows[2];
  const y1 = (rows[0] / 2 / total) * 100;
  const y2 = ((rows[0] + rows[1] + rows[2] / 2) / total) * 100;
  const yMid = ((rows[0] + rows[1] / 2) / total) * 100;

  // Stations sit in a flex row (so they never overlap); the route follows their measured centers.
  const trackRef = useRef<HTMLDivElement>(null);
  const laneRef = useRef<HTMLDivElement>(null);
  const aiRef = useRef<HTMLSpanElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const subRef = useRef<HTMLSpanElement>(null);
  const [g, setG] = useState<Geo>(GEO_START);
  useLayoutEffect(() => {
    const track = trackRef.current;
    const lane = laneRef.current;
    const ai = aiRef.current;
    if (!track || !lane || !ai) return;
    const measure = () => {
      const w = track.clientWidth;
      if (!w) return;
      const pills = Array.from(lane.children) as HTMLElement[];
      const c = pills.map((el) => ((el.offsetLeft + el.offsetWidth / 2) / w) * 100);
      if (c.length < 4) return;
      const mid = (c[1] + c[2]) / 2;
      const half = ((ai.offsetWidth / 2) / w) * 100;
      let side: Geo["side"] = "right";
      let sub = true;
      const label = labelRef.current;
      const second = subRef.current;
      if (label && second) {
        // Label width with and without its second line ("Gemini or Qwen").
        // Text widths from ranges: the label box itself is squeezed when it sits near the track's edge.
        const textW = (el: Element | null) => {
          if (!el) return 0;
          const range = document.createRange();
          range.selectNodeContents(el);
          return range.getBoundingClientRect().width;
        };
        const chrome = (label.firstElementChild?.getBoundingClientRect().width ?? 0) + 8;
        const first = textW(second.previousElementSibling);
        const full = chrome + Math.max(first, textW(second));
        const short = chrome + first;
        const right = ((100 - mid - half) / 100) * w - 4;
        const left = ((mid - half) / 100) * w - 4;
        if (full <= right) side = "right";
        else if (full <= left) side = "left";
        else {
          sub = false;
          side = short <= right || right >= left ? "right" : "left";
        }
      }
      const next: Geo = {
        x: [c[0], c[1], mid, c[2], c[3]],
        down: mid - half * 0.55,
        up: mid + half * 0.55,
        aiLeft: mid - half,
        aiRight: mid + half,
        side,
        sub,
      };
      setG((s) => (JSON.stringify(s) === JSON.stringify(next) ? s : next));
    };
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    ro.observe(ai);
    if (subRef.current) ro.observe(subRef.current);
    for (const el of Array.from(lane.children)) ro.observe(el);
    return () => ro.disconnect();
  }, [wide]);

  const [imp, est, , edit, exp] = g.x;
  const runX = [imp, imp, est, est, g.down, g.down, g.up, g.up, edit, edit, exp, exp];
  const runY = [y1, y1, y1, y1, y1, y2, y2, y1, y1, y1, y1, y1];
  const trailX = [imp, imp, est, est, g.down, g.down, g.down, g.up, edit, edit, exp, exp];
  const toTrail = (x: number) => (x - imp) / (exp - imp);

  const px = useTransform(p, ROUTE, runX);
  const py = useTransform(p, ROUTE, runY);
  const packetX = useMotionTemplate`${px}%`;
  const packetY = useMotionTemplate`${py}%`;
  const trail = useTransform(p, ROUTE, trailX.map(toTrail));
  const downFill = useTransform(p, [0.36, 0.41], [0, 1]);
  const upFill = useTransform(p, [0.53, 0.58], [0, 1]);
  const outChip = useTransform(p, [0.34, 0.355, 0.465, 0.48], [0, 1, 1, 0]);
  const backChip = useTransform(p, [0.48, 0.495, 0.6, 0.615], [0, 1, 1, 0]);

  // Still layout: explicit at-rest values for the selected step.
  const restTrail = toTrail([imp, est, g.down, edit, exp][step]);
  const crossed = step >= AI_STATION ? 1 : 0;
  const chips = step === AI_STATION ? 1 : 0;

  const lane1 = { left: `${imp}%`, width: `${exp - imp}%`, top: `${y1}%` };

  const pill = (i: number, ref?: React.Ref<HTMLSpanElement>, style?: React.CSSProperties) => {
    const ai = i === AI_STATION;
    const state = i === step ? "active" : i < step ? "done" : "next";
    return (
      <span
        key={STATIONS[i]}
        ref={ref}
        className={cn(
          "flex h-[2.15em] items-center whitespace-nowrap rounded-full border px-[0.9em] font-medium transition-[background-color,border-color,color] duration-300 ease-brand",
          wide ? "text-[0.75rem]" : "text-[0.6875rem]",
          ai && "absolute -translate-x-1/2 -translate-y-1/2",
          state === "active" && (ai ? "border-oat bg-oat text-deep" : "border-coral bg-coral text-deep"),
          state === "done" && (ai ? "border-oat/45 bg-deep text-white/85" : "border-coral/45 bg-deep text-white/85"),
          state === "next" && "border-white/15 bg-deep text-white/55",
        )}
        style={style}
      >
        {STATIONS[i]}
      </span>
    );
  };

  const track = (
    <div ref={trackRef} className={cn("relative min-w-0", wide && "col-start-2 row-span-3 row-start-1")} style={{ height: `${total}rem` }}>
      {/* Lanes and the two links between them */}
      <span className="absolute h-px -translate-y-1/2 bg-white/15" style={lane1} />
      <motion.span
        className="absolute h-[2px] origin-left -translate-y-1/2 rounded-full bg-coral"
        style={{ ...lane1, scaleX: frozen ? restTrail : trail }}
      />
      <span className="absolute inset-x-0 border-t border-dashed border-white/15" style={{ top: `${y2}%` }} />
      {[g.down, g.up].map((x, i) => (
        <span
          key={i}
          className="absolute w-[2px] -translate-x-1/2 overflow-hidden bg-white/15"
          style={{ left: `${x}%`, top: `${y1}%`, height: `${y2 - y1}%` }}
        >
          <motion.span
            className={cn("block size-full bg-oat", i === 0 ? "origin-top" : "origin-bottom")}
            style={{ scaleY: frozen ? crossed : i === 0 ? downFill : upFill }}
          />
        </span>
      ))}

      {!wide && (
        // Phones: the AI lane holds one station, so its label sits on the lane beside it.
        <span
          ref={labelRef}
          className={cn(
            "absolute flex -translate-y-1/2 items-start gap-1 whitespace-nowrap bg-deep text-[0.6875rem] leading-[1.2]",
            g.side === "right" ? "pl-1" : "pr-1",
          )}
          style={
            g.side === "right"
              ? { top: `${y2}%`, left: `calc(${g.aiRight}% + 0.25rem)` }
              : { top: `${y2}%`, right: `calc(${100 - g.aiLeft}% + 0.25rem)` }
          }
        >
          <Cloud className="mt-px size-[1.1em] shrink-0 text-oat" />
          <span className="relative">
            <span className="block font-semibold text-white/80">Your AI</span>
            <span ref={subRef} className={cn("text-white/60", g.sub ? "block" : "invisible absolute left-0 top-0")}>
              Gemini or Qwen
            </span>
          </span>
        </span>
      )}

      {/* What travels: shown only while it is on the way. On phones the chips wrap within the room beside the links. */}
      <motion.span
        className={cn(
          "absolute mr-2 flex -translate-y-1/2 items-center gap-1 rounded-[10px] border border-oat/45 bg-deep px-2 py-[3px] font-mono text-[0.6875rem] leading-[1.25] text-oat",
          wide ? "whitespace-nowrap" : "text-right",
        )}
        style={{
          right: `${100 - g.down}%`,
          top: `${yMid}%`,
          maxWidth: wide ? undefined : `calc(${g.down}% - 0.5rem)`,
          opacity: frozen ? chips : outChip,
        }}
      >
        {wide && <ArrowDown className="size-[1.1em] shrink-0" />}
        {wide ? "Prepared audio and video" : "Audio and video"}
      </motion.span>
      <motion.span
        className={cn(
          "absolute ml-2 flex -translate-y-1/2 items-center gap-1 rounded-[10px] border border-oat/45 bg-deep px-2 py-[3px] font-mono text-[0.6875rem] leading-[1.25] text-oat",
          wide && "whitespace-nowrap",
        )}
        style={{
          left: `${g.up}%`,
          top: `${yMid}%`,
          maxWidth: wide ? undefined : `calc(${100 - g.up}% - 0.5rem)`,
          opacity: frozen ? chips : backChip,
        }}
      >
        <ArrowUp className="size-[1.1em] shrink-0" />
        Editing plan
      </motion.span>

      {/* The packet slips behind each station pill when it arrives */}
      <motion.div
        className="absolute inset-0"
        style={
          frozen
            ? { x: `${g.x[step]}%`, y: `${step === AI_STATION ? y2 : y1}%` }
            : { x: packetX, y: packetY }
        }
      >
        <span className="absolute left-0 top-0 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-coral ring-[3px] ring-deep" />
      </motion.div>

      {/* Your computer's stations, spaced by the row itself */}
      <div
        ref={laneRef}
        className="absolute inset-x-0 top-0 flex items-center justify-between"
        style={{ height: `${rows[0]}rem` }}
      >
        {[0, 1, 3, 4].map((i) => pill(i))}
      </div>
      {pill(AI_STATION, aiRef, { left: `${g.x[AI_STATION]}%`, top: `${y2}%` })}
    </div>
  );

  return (
    <div aria-hidden="true" className="bg-deep px-4 pb-2.5 pt-2.5 text-white sm:px-5 sm:pb-4 sm:pt-3.5">
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-rose">Behind the scenes</p>
        {!wide && (
          // Phones: lane names sit at the ends of the lanes so the console stays short.
          <span className="flex items-center gap-1.5 whitespace-nowrap text-[0.6875rem] font-semibold leading-none text-white/80">
            <Laptop className="size-[1.1em] text-coral" /> Your computer
          </span>
        )}
      </div>

      {wide ? (
        <div
          className="mt-2.5 grid grid-cols-[max-content_minmax(0,1fr)] gap-x-4"
          style={{ gridTemplateRows: rows.map((r) => `${r}rem`).join(" ") }}
        >
          <span className="col-start-1 row-start-1 flex min-w-[9.5em] items-center gap-2 self-center whitespace-nowrap text-[0.8125rem]">
            <span className="grid size-[1.85em] shrink-0 place-items-center rounded-md bg-white/[0.08]">
              <Laptop className="size-[1.1em] text-coral" />
            </span>
            <span className="font-semibold leading-tight text-white/90">Your computer</span>
          </span>
          <span className="col-start-1 row-start-3 flex min-w-[9.5em] items-center gap-2 self-center whitespace-nowrap text-[0.8125rem]">
            <span className="grid size-[1.85em] shrink-0 place-items-center rounded-md bg-white/[0.08]">
              <Cloud className="size-[1.1em] text-oat" />
            </span>
            <span className="leading-tight">
              <span className="block font-semibold text-white/90">Your AI</span>
              <span className="block text-[0.6875rem] text-white/60">Gemini or Qwen</span>
            </span>
          </span>
          {track}
        </div>
      ) : (
        <div className="mt-2">{track}</div>
      )}

      {/* One caption line per step, stacked so the tallest sets the height */}
      <div className="mt-2.5 grid border-t border-white/10 pt-2 sm:mt-3 sm:pt-3">
        {STEPS.map((s, i) => (
          <p
            key={s.title}
            className={cn(
              "col-start-1 row-start-1 font-mono text-white/85 transition-[opacity,translate] duration-300 ease-brand",
              wide ? "text-[0.8125rem] leading-[1.55]" : "text-[0.8125rem] leading-[1.45]",
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
function Readout({ step, tight }: { step: number; tight: boolean }) {
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
                  className={cn("h-1 flex-1 rounded-full transition-colors duration-300", i <= step ? "bg-maroon" : "bg-pebble")}
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
      <div className={cn("mt-1.5 grid [@media(max-height:749px)]:hidden", tight && "hidden")}>
        {STEPS.map((s, i) => (
          <p
            key={s.title}
            className={cn(
              "col-start-1 row-start-1 text-[0.9375rem] leading-snug text-mute transition-opacity duration-300",
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

/** Images the screens use, fetched once the section is close so a step change never shows a gap. */
const PRELOAD = [AI.logo, "/product/illustrations/cost.webp", ...CLIPS.slice(0, 3).map((c) => c.poster)];

/** Pinned layout limits: the window's aspect range, and the room kept above and below the stage. */
const PHONE_ASPECT = { max: 1.15, min: 1 };
const WIDE_ASPECT = { max: 2, min: 1.4 };
const MIN_SCREEN = 220;

/** full: pinned; tight: pinned without the readout sentence (phones and tablets); static: not pinned. */
type Fit = { mode: "full" | "tight" | "static"; w: number; h: number };

export function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const probeRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const colRef = useRef<HTMLDivElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const fitKey = useRef("");

  const reduce = usePrefersReducedMotion();
  const isDesktop = useMediaQuery("(min-width: 1024px)", true);
  const wide = useMediaQuery("(min-width: 640px)", true);
  const [fit, setFit] = useState<Fit>({ mode: "full", w: 0, h: 0 });
  const mode = fit.mode;
  const pinned = !reduce && mode !== "static";
  const frozen = !pinned;
  const jump = isDesktop && pinned;
  // Static layout: the list picks the step where it sits beside the stage; on narrower screens
  // the stage sits below the list, so a row of step buttons goes right above it instead.
  const pick = frozen && isDesktop;

  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });
  const still = useMotionValue(0);
  const p = frozen ? still : scrollYProgress;

  const [scrollStep, setScrollStep] = useState(0);
  const [picked, setPicked] = useState(0);
  const step = frozen ? picked : scrollStep;
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const i = Math.min(STEPS.length - 1, Math.max(0, BOUNDS.findLastIndex((b) => v >= b)));
    setScrollStep((s) => (s === i ? s : i));
  });

  // Does the pinned stage fit? Measure it against the sticky height (which also tracks text size),
  // size the window to the room left, and fall back to the static layout when it does not fit.
  useLayoutEffect(() => {
    if (reduce) return;
    const probe = probeRef.current;
    const section = sectionRef.current;
    if (!probe || !section) return;
    const envKey = () => `${probe.offsetWidth}x${probe.offsetHeight}x${section.clientWidth}`;

    const measure = () => {
      // After a step down, try the full pinned stage again once the window or text size changes.
      if (mode !== "full" && envKey() !== fitKey.current) {
        setFit({ mode: "full", w: 0, h: 0 });
        return;
      }
      if (mode === "static") return;
      const col = colRef.current;
      const screen = screenRef.current;
      if (!col || !screen) return;
      const room = probe.offsetHeight - 2 * (isDesktop ? 24 : 8);
      const avail = Math.floor(room - (col.offsetHeight - screen.offsetHeight));
      const colW = col.clientWidth;
      let w: number;
      let h: number;
      let ok: boolean;
      if (!wide) {
        w = colW;
        h = Math.min(avail, Math.floor(w / PHONE_ASPECT.min));
        ok = avail >= w / PHONE_ASPECT.max;
      } else {
        w = Math.floor(Math.min(colW, isDesktop ? colW : 720, avail * WIDE_ASPECT.max));
        h = Math.min(avail, Math.floor(w / WIDE_ASPECT.min));
        ok = avail >= MIN_SCREEN && (!isDesktop || (leftRef.current?.offsetHeight ?? 0) <= room);
      }
      if (!ok) {
        // Step down: first drop the readout sentence (the console caption still carries the step), then unpin.
        fitKey.current = envKey();
        setFit({ mode: mode === "full" && !isDesktop ? "tight" : "static", w: 0, h: 0 });
        return;
      }
      setFit((s) => (s.mode === mode && s.w === w && s.h === h ? s : { mode, w, h }));
    };

    const ro = new ResizeObserver(measure);
    ro.observe(probe);
    ro.observe(section);
    if (colRef.current) ro.observe(colRef.current);
    if (leftRef.current) ro.observe(leftRef.current);
    return () => ro.disconnect();
  }, [reduce, mode, isDesktop, wide]);

  // Fetch the screens' images once the section is close.
  const near = useInView(trackRef, { once: true, margin: "100% 0px 100% 0px" });
  useEffect(() => {
    if (!near) return;
    for (const src of PRELOAD) {
      const img = new Image();
      img.src = src;
    }
  }, [near]);

  const goTo = (i: number) => {
    const el = trackRef.current;
    if (!el) return;
    const range = el.offsetHeight - window.innerHeight;
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + range * REST[i], behavior: "smooth" });
  };

  const sized = pinned && fit.w > 0;

  return (
    <section id="how-it-works" ref={sectionRef} aria-labelledby="how-title" className="relative bg-paper">
      {/* Measures the pinned height and the root text size (1rem wide). */}
      <div
        ref={probeRef}
        aria-hidden="true"
        className="pointer-events-none invisible absolute left-0 top-0 h-[calc(100svh-72px)] w-[1rem]"
      />

      <Container className="pt-24 sm:pt-32">
        <Eyebrow>How it works</Eyebrow>
        <h2
          id="how-title"
          className="mt-4 text-balance font-display text-[clamp(2.1rem,4.6vw,3.6rem)] font-bold leading-[0.98] tracking-[-0.035em]"
        >
          What you see, <span className="text-maroon md:block">and what Shortzy is doing.</span>
        </h2>
      </Container>

      <div ref={trackRef} data-how-track="" className={cn(pinned ? "h-[460vh] lg:h-[440vh]" : "pb-24 pt-10 sm:pb-32 sm:pt-14")}>
        <div className={cn(pinned && "sticky top-[72px] flex h-[calc(100svh-72px)] items-center overflow-hidden")}>
          <Container
            className={cn(
              "grid lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-10",
              pinned ? "items-center gap-0 py-2 lg:py-6" : "items-start gap-8",
            )}
          >
            <div ref={leftRef} className={cn(pinned && "self-center")}>
              <ol className={cn("space-y-1", pinned && "sr-only lg:not-sr-only")}>
                {STEPS.map((s, i) => {
                  const active = i === step;
                  const open = frozen || active;
                  const Item = jump || pick ? "button" : "div";
                  const itemProps =
                    jump || pick
                      ? {
                          type: "button" as const,
                          onClick: () => (frozen ? setPicked(i) : goTo(i)),
                          "aria-pressed": frozen ? active : undefined,
                        }
                      : {};
                  return (
                    <li key={s.title}>
                      <Item
                        {...itemProps}
                        aria-current={pinned && active ? "step" : undefined}
                        className={cn(
                          "grid min-h-11 w-full grid-cols-[2.25rem_1fr] gap-x-2 rounded-xl px-3 py-2.5 text-left transition-[background-color,transform] duration-100 active:scale-[0.99]",
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
                              active || frozen ? "text-ink" : "text-mute",
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
                              {pinned ? (
                                // Every body sized in one cell, so the open step is always as tall as the
                                // tallest one and the pinned column never shifts between steps.
                                <span className="grid">
                                  {STEPS.map((o, j) => (
                                    <span
                                      key={o.title}
                                      aria-hidden={j === i ? undefined : true}
                                      className={cn(
                                        "col-start-1 row-start-1 block pt-1 text-[0.9375rem] leading-relaxed text-mute",
                                        j !== i && "invisible",
                                      )}
                                    >
                                      {o.body}
                                    </span>
                                  ))}
                                </span>
                              ) : (
                                <span className="block pt-1 text-[0.9375rem] leading-relaxed text-mute">{s.body}</span>
                              )}
                              <span className="sr-only">Behind the scenes: {s.behind}</span>
                            </span>
                          </span>
                        </span>
                      </Item>
                    </li>
                  );
                })}
              </ol>

              <PoseStack pose={STEPS[step].pose} size={120} className="mt-6 hidden lg:grid" />
            </div>

            <div ref={colRef} className={cn("min-w-0", pinned && "self-center")}>
              {pinned && (
                <div className="mx-auto mb-2 w-full max-w-[720px] sm:mb-4 lg:hidden">
                  <Readout step={step} tight={mode === "tight"} />
                </div>
              )}
              {frozen && !isDesktop && (
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
                className={cn("mx-auto w-full", !isDesktop && "max-w-[720px]")}
                style={sized ? { maxWidth: fit.w } : undefined}
              >
                {/* Remount when the layout or window shape changes: scroll-linked values bind once. */}
                <div
                  key={`${pinned ? "scroll" : "still"}-${wide ? "wide" : "compact"}`}
                  className="overflow-hidden rounded-[20px] border border-pebble bg-white shadow-[0_30px_60px_-40px_rgba(41,38,40,0.55)] sm:rounded-[24px]"
                >
                  {/* Neutral window chrome, like the hero: the app runs on Mac and Windows. */}
                  <div
                    aria-hidden="true"
                    className="flex h-9 items-center justify-between border-b border-pebble/70 bg-paper px-4 sm:px-5"
                  >
                    <span className="text-[0.75rem] font-semibold text-ink sm:text-[0.8125rem]">Shortzy</span>
                    <span className="text-[0.6875rem] font-medium text-mute sm:text-[0.75rem]">Sample workspace</span>
                  </div>
                  <Screen
                    step={step}
                    p={p}
                    compact={!wide}
                    frozen={frozen}
                    reduce={reduce}
                    screenRef={screenRef}
                    height={sized ? fit.h : undefined}
                  />
                  <Console p={p} step={step} wide={wide} frozen={frozen} />
                </div>
              </div>
            </div>
          </Container>
        </div>
      </div>
    </section>
  );
}
