/*
 * Pure, seekable model of the hero demo. Everything is a function of one
 * clock value t (ms from loop start): the discrete UI state (frameAt), the
 * cursor, the camera, scroll positions and progress bars. React re-renders
 * only when frameAt changes (a "beat"); continuous values are derived from t
 * through motion values.
 *
 * Coordinates are on a fixed 1280 x 800 app canvas. "Full" y values are page
 * coordinates inside a view before its scroll is applied.
 *
 * Pacing: one bubble at a time, each fully readable for at least 1.8 s after
 * its entrance (main bubbles hold 2.1 s or more, the closing aha bubble 2.7 s),
 * and no bubble outlives the view or stage it points at.
 */

import { AI, PROJECT } from "./data";

export const CANVAS_W = 1280;
export const CANVAS_H = 800;

export type Pt = readonly [number, number];
export type View = "library" | "upload" | "customize" | "review" | "finish";

/** Loop length and the moment the last scene crossfades back to the library. */
export const LOOP = 24560;
export const LOOP_BACK = 24160;

/** View and stage switches (each crossfades in over about 200 ms). */
export const SCENE = {
  library: 0,
  upload: 2150,
  customize: 4600,
  shorts: 7230,
  analyze: 9175,
  estimate: 10370,
  confirm: 13680,
  processing: 15900,
  results: 18280,
} as const;

/** Scene starts in order, for resuming from the start of the current scene. */
const SCENE_STARTS = Object.values(SCENE).sort((a, b) => a - b);
export function sceneStart(t: number) {
  let s = 0;
  for (const v of SCENE_STARTS) if (t >= v) s = v;
  return s;
}

/** Named moments that are not clicks. */
export const T = {
  hoverYoutube: [2630, 2745],
  ghostIn: 3340,
  dragOver: 3590,
  drop: 3835,
  importDone: 6855,
  collapse: 6880,
  hoverSelect: [7460, 7610],
  hoverWord: [8020, 8150],
  hoverBold: [8150, 8230],
  scrollStyle: [8530, 8945],
  check1: 9275,
  check2: 9425,
  check3: 9625,
  estimateReady: 10520,
  framing: 17050,
  processHalf: 17050,
  processDone: 18150,
  cardsIn: 18405,
  scrollResults: [20600, 21100],
  cursorOut: [21580, 21830],
} as const;

/** Every click: when, where (canvas coords at that moment) and what it presses. */
export const CLICKS = [
  { at: 2010, at2: [104, 163], id: "newProject" },
  { at: 2960, at2: [679, 466], id: "segUpload" },
  { at: 4350, at2: [744, 702], id: "create" },
  { at: SCENE.shorts, at2: [332, 434], id: "tabShorts" },
  { at: 7810, at2: [415, 434], id: "tabStyle" },
  { at: 8350, at2: [351, 610], id: "presetBold" },
  { at: 9070, at2: [856, 769], id: "analyze" },
  { at: 10170, at2: [1040, 619], id: "seeCost" },
  { at: 13480, at2: [1041, 659], id: "reviewConfirm" },
  { at: 14250, at2: [373, 548], id: "consent" },
  { at: 15650, at2: [1054, 715], id: "find" },
  { at: 21200, at2: [401, 303], id: "clip1" },
] as const;

export type ClickId = (typeof CLICKS)[number]["id"];
const CLICK = Object.fromEntries(CLICKS.map((c) => [c.id, c.at])) as Record<ClickId, number>;
export const PLAY_AT = CLICK.clip1;

const HOVER_LEAD = 120;
const PRESS_MS = 110;

/** Cursor path: each move runs from `start` to `end` and lands on `to` (canvas coords). */
const CURSOR_START: Pt = [700, 520];
const MOVES_IN: { start: number; end: number; to: Pt }[] = [
  { start: 1400, end: 1840, to: [104, 163] },
  { start: 2270, end: 2630, to: [430, 466] },
  { start: 2745, end: 2920, to: [679, 466] },
  { start: 3010, end: 3300, to: [1180, 700] },
  { start: 3340, end: 3795, to: [541, 598] },
  { start: 3890, end: 4250, to: [744, 702] },
  { start: 4660, end: 5000, to: [600, 650] },
  { start: 6830, end: 7180, to: [332, 434] },
  { start: 7290, end: 7500, to: [480, 518] },
  { start: 7610, end: 7765, to: [415, 434] },
  { start: 7870, end: 8055, to: [584, 610] },
  { start: 8130, end: 8300, to: [351, 610] },
  { start: 8575, end: 8985, to: [856, 769] },
  { start: 9675, end: 10025, to: [1040, 619] },
  { start: 10450, end: 10780, to: [880, 240] },
  { start: 12950, end: 13315, to: [1041, 659] },
  { start: 13740, end: 14095, to: [373, 548] },
  { start: 14900, end: 15230, to: [1054, 715] },
  { start: 15950, end: 16350, to: [760, 600] },
  { start: 20690, end: 21110, to: [401, 303] },
];

export type Placement = "top" | "top-start" | "right" | "left" | "bottom";
export type BubbleKind = "main" | "qualifier" | "aha";
export type Bubble = {
  id: string;
  text: string;
  /** A smaller second line in the same bubble (the cost qualifier). */
  note?: string;
  /** Phones: the note names the sample, since the app text is too small to read there. */
  noteCompact?: string;
  in: number;
  out: number;
  view: View;
  /** Anchor in full page coords of its view (y before scroll). */
  anchor: Pt;
  place: Placement;
  anchorCompact?: Pt;
  placeCompact?: Placement;
  /** false: not shown on phones (the UI line it explains is already readable there). */
  compact?: boolean;
  /** Phones: allow a wider bubble so it stays on one line and clear of nearby text. */
  wideCompact?: boolean;
  kind: BubbleKind;
};

export const BUBBLES: Bubble[] = [
  {
    // Anchored to the sidebar's "On your computer" row; ends as the library leaves.
    id: "B1", text: "Your projects live on your computer", in: 50, out: SCENE.upload, view: "library",
    anchor: [158, 763], place: "right", anchorCompact: [96, 240], placeCompact: "bottom", kind: "main",
  },
  {
    id: "B2", text: "A YouTube link or your own file", in: 2300, out: 4400, view: "upload",
    anchor: [818, 458], place: "right", anchorCompact: [541, 443], placeCompact: "top", kind: "main",
  },
  {
    // Ends before the import strip collapses and the tab content moves.
    id: "B3", text: "Your own AI. Gemini or Qwen.", in: 4780, out: T.collapse, view: "customize",
    anchor: [370, 622], place: "right", anchorCompact: [362, 612], placeCompact: "right", kind: "main",
  },
  {
    // The cost and its qualifier in one bubble. It ends before the cursor
    // heads to Review & confirm, so the phone camera never crops the price.
    id: "B6", text: "See the cost before it runs", note: "Estimate. Your provider bills you.",
    noteCompact: `Sample: ${PROJECT.length} video on ${AI.provider} ${AI.model}. Your provider bills you.`,
    in: 10600, out: 13200, view: "review",
    anchor: [710, 542], place: "right", anchorCompact: [686, 557], placeCompact: "bottom", kind: "main",
  },
  {
    id: "B7", text: "Nothing runs until you say so", in: 13800, out: SCENE.processing, view: "review",
    anchor: [1054, 889], place: "top", anchorCompact: [724, 751], placeCompact: "bottom", kind: "main",
  },
  {
    // Points at the progress bar from below, in the card's empty lower half on every size.
    id: "B8", text: "Shortzy and your AI find the moments. Your computer edits.", in: 16050, out: 18250, view: "finish",
    anchor: [700, 424], place: "bottom", anchorCompact: [600, 426], placeCompact: "bottom", kind: "main",
  },
  {
    // Phones: one line in the gap under the usage line, clear of the results
    // heading and the "Scores are AI estimates" line.
    id: "B9c", text: "Just your AI usage. No credits.", in: 18480, out: 20580, view: "finish",
    anchor: [678, 407], place: "right", anchorCompact: [402, 416], placeCompact: "bottom", wideCompact: true, kind: "main",
  },
  {
    id: "B9a", text: "Ranked by AI estimate, with reasons", in: 21260, out: 23360, view: "finish",
    anchor: [744, 525], place: "right", compact: false, kind: "main",
  },
  {
    id: "B9b", text: "Framed, captioned, ready to post", in: 21560, out: LOOP_BACK, view: "finish",
    anchor: [563, 590], place: "right", anchorCompact: [401, 950], placeCompact: "bottom", kind: "aha",
  },
];

/**
 * Compact (phone) camera. Each beat names a preferred center `c` and a `must`
 * box [x0, y0, x1, y1] (the clicked element and the bubble anchor) that stays
 * whole in the shot; the camera pans between beats with the brand ease. The
 * visible region is about `s` canvas px square (470 by default: 0.76x on a
 * 390 px phone, 0.72x at 375 px).
 */
type Box = readonly [number, number, number, number];
type Focus = { at: number; c: Pt; must: Box; s?: number };
const S_COMPACT = 470;
const PAN_MS = 420;
const F_LIBRARY: Omit<Focus, "at"> = { c: [235, 255], must: [0, 24, 260, 300] };
const F_RESULTS: Omit<Focus, "at"> = { c: [489, 365], must: [240, 115, 738, 615], s: 500 };
const FOCUS: Focus[] = [
  { at: 0, ...F_LIBRARY },
  // Upload: the segmented control, then the dropped file and Create.
  { at: SCENE.upload, c: [500, 525], must: [370, 354, 735, 487] },
  { at: 3890, c: [575, 525], must: [330, 354, 820, 725], s: 490 },
  // Customize: Your AI (import strip open), then the tabs, then Analyze.
  { at: SCENE.customize, c: [470, 455], must: [235, 221, 640, 690] },
  { at: 6830, c: [470, 480], must: [235, 303, 705, 715] },
  { at: T.scrollStyle[0], c: [700, 560], must: [700, 700, 928, 790] },
  // Review: the local checks, then See cost estimate.
  { at: SCENE.analyze, c: [595, 330], must: [360, 140, 640, 530] },
  { at: 9675, c: [890, 450], must: [957, 598, 1124, 640] },
  // Estimate: the price, then Review & confirm once the cost bubble has gone. The
  // right-hand shots start past the price, so it is never cropped to a misleading number.
  { at: SCENE.estimate, c: [595, 330], must: [360, 140, 830, 470] },
  { at: 13200, c: [947, 450], must: [712, 638, 1124, 680] },
  // Confirm: the consent line, then Find my clips.
  { at: SCENE.confirm, c: [560, 450], must: [364, 309, 700, 574] },
  { at: 14900, c: [936, 500], must: [701, 694, 1124, 736] },
  { at: SCENE.processing, c: [470, 400], must: [240, 302, 610, 470] },
  // Results: the usage line with the score qualifier line, then clip 1 playing.
  { at: SCENE.results, c: [488, 400], must: [238, 302, 738, 533], s: 500 },
  { at: T.scrollResults[0], ...F_RESULTS },
  { at: LOOP_BACK, ...F_LIBRARY },
];
/** Reduced-motion still on phones: center of the final results shot. */
export const STILL_FOCUS: Pt = F_RESULTS.c;

/**
 * Desktop punch-ins: push in from `from` to `to`, hold until `hold`, then
 * return by `back`. Both frame the main column with the sidebar out of shot,
 * so the crop edges fall in margins and never cut a label or a line of text.
 */
const ZOOMS = [
  { from: T.estimateReady, to: 11275, hold: 13900, back: 14400, zoom: 1.25, center: [744, 400] as Pt },
  { from: 21260, to: 22160, hold: 24060, back: 24510, zoom: 1.2, center: [744, 334] as Pt },
];

/** Reduced motion: one static frame with the ranked results and the closing bubbles. */
export const STILL_T = 22300;

/* ------------------------------------------------------------------ */
/* Easing                                                               */
/* ------------------------------------------------------------------ */

function bezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = (u: number) => ((ax * u + bx) * u + cx) * u;
  const sy = (u: number) => ((ay * u + by) * u + cy) * u;
  const dx = (u: number) => (3 * ax * u + 2 * bx) * u + cx;
  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let u = x;
    for (let i = 0; i < 6; i++) {
      const d = dx(u);
      if (Math.abs(d) < 1e-6) break;
      u -= (sx(u) - x) / d;
    }
    return sy(Math.min(1, Math.max(0, u)));
  };
}

export const easeBrand = bezier(0.2, 0.8, 0.2, 1);
const easeInOut = bezier(0.45, 0, 0.25, 1);
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;

/* ------------------------------------------------------------------ */
/* Discrete frame                                                       */
/* ------------------------------------------------------------------ */

export type Frame = {
  view: View;
  hover: string | null;
  press: string | null;
  bubbles: string[];
  seg: "youtube" | "upload";
  drop: "idle" | "dragging" | "selected";
  ghost: boolean;
  nameFilled: boolean;
  nameFlash: boolean;
  create: "disabled" | "enabled" | "loading";
  importing: boolean;
  tab: "ai" | "shorts" | "style";
  /** Caption preset: Word highlight is the default; the cursor picks Bold pop, the style the sample clips use. */
  preset: "word" | "bold";
  presetPulse: boolean;
  stage: "analyze" | "estimate" | "confirm";
  checks: number;
  calculating: boolean;
  estimateReady: boolean;
  consent: boolean;
  find: "disabled" | "enabled" | "loading";
  results: boolean;
  framing: boolean;
  cardsIn: boolean;
  playing: boolean;
  videoLoad: boolean;
};

const HOVERS: [number, number, string][] = [
  [T.hoverYoutube[0], T.hoverYoutube[1], "segYoutube"],
  [T.hoverSelect[0], T.hoverSelect[1], "select1"],
  [T.hoverBold[0], T.hoverBold[1], "presetBold"],
  [T.hoverWord[0], T.hoverWord[1], "presetWord"],
  ...CLICKS.map((c) => [c.at - HOVER_LEAD, c.at, c.id] as [number, number, string]),
];

const within = (t: number, a: number, b: number) => t >= a && t < b;

function viewAt(t: number): View {
  if (t < SCENE.upload) return "library";
  if (t < SCENE.customize) return "upload";
  if (t < SCENE.analyze) return "customize";
  if (t < SCENE.processing) return "review";
  return "finish";
}

/** When each view first appears in the loop. */
export const VIEW_START: Record<View, number> = {
  library: 0,
  upload: SCENE.upload,
  customize: SCENE.customize,
  review: SCENE.analyze,
  finish: SCENE.processing,
};
/** When each view hands over to the next one. */
export const VIEW_END: Record<View, number> = {
  library: SCENE.upload,
  upload: SCENE.customize,
  customize: SCENE.analyze,
  review: SCENE.processing,
  finish: LOOP_BACK,
};

export function frameAt(time: number): Frame {
  const t = time >= LOOP_BACK ? 0 : time;
  const hover = HOVERS.find(([a, b]) => within(t, a, b))?.[2] ?? null;
  const press = CLICKS.find((c) => within(t, c.at, c.at + PRESS_MS))?.id ?? null;
  return {
    view: viewAt(t),
    hover,
    press,
    bubbles: BUBBLES.filter((b) => within(t, b.in, b.out)).map((b) => b.id),
    seg: t >= CLICK.segUpload ? "upload" : "youtube",
    drop: t >= T.drop ? "selected" : t >= T.dragOver ? "dragging" : "idle",
    ghost: within(t, T.ghostIn, T.drop),
    nameFilled: t >= T.drop,
    nameFlash: within(t, T.drop, T.drop + 320),
    create: t >= CLICK.create ? "loading" : t >= T.drop ? "enabled" : "disabled",
    importing: t < T.collapse,
    tab: t >= CLICK.tabStyle ? "style" : t >= CLICK.tabShorts ? "shorts" : "ai",
    preset: t >= CLICK.presetBold ? "bold" : "word",
    presetPulse: within(t, CLICK.presetBold, CLICK.presetBold + 420),
    stage: t >= SCENE.confirm ? "confirm" : t >= SCENE.estimate ? "estimate" : "analyze",
    checks: t >= T.check3 ? 3 : t >= T.check2 ? 2 : t >= T.check1 ? 1 : 0,
    calculating: within(t, T.check2, T.check3),
    estimateReady: t >= T.estimateReady,
    consent: t >= CLICK.consent,
    find: t >= CLICK.find ? "loading" : t >= CLICK.consent ? "enabled" : "disabled",
    results: t >= SCENE.results,
    framing: t >= T.framing,
    cardsIn: t >= T.cardsIn,
    playing: t >= CLICK.clip1,
    videoLoad: t >= SCENE.processing,
  };
}

/** Beat boundaries: the start time of each run of identical frames (10 ms grid). */
const BEAT_STEP = 10;
export const BEATS: number[] = [];
export const FRAMES: Frame[] = [];
{
  let last = "";
  for (let t = 0; t < LOOP; t += BEAT_STEP) {
    const f = frameAt(t);
    const key = JSON.stringify(f);
    if (key !== last) {
      BEATS.push(t);
      FRAMES.push(f);
      last = key;
    }
  }
}

export function beatIndex(t: number) {
  let lo = 0;
  let hi = BEATS.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (BEATS[mid] <= t) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}

/* ------------------------------------------------------------------ */
/* Cursor                                                               */
/* ------------------------------------------------------------------ */

type Move = { t0: number; t1: number; from: Pt; to: Pt; nx: number; ny: number; arc: number };

const MOVES: Move[] = (() => {
  const out: Move[] = [];
  let from = CURSOR_START;
  for (const m of MOVES_IN) {
    const dx = m.to[0] - from[0];
    const dy = m.to[1] - from[1];
    const dist = Math.hypot(dx, dy);
    // Perpendicular unit normal, chosen to bow upward like a relaxed wrist.
    let nx = dist ? -dy / dist : 0;
    let ny = dist ? dx / dist : 0;
    if (ny > 0 || (ny === 0 && nx < 0)) {
      nx = -nx;
      ny = -ny;
    }
    out.push({ t0: m.start, t1: m.end, from, to: m.to, nx, ny, arc: 0.06 * dist });
    from = m.to;
  }
  return out;
})();

export function cursorAt(t: number): Pt {
  let pos: Pt = CURSOR_START;
  if (t >= LOOP_BACK) return pos;
  for (const m of MOVES) {
    if (t < m.t0) break;
    if (t >= m.t1) {
      pos = m.to;
      continue;
    }
    const u = easeBrand((t - m.t0) / (m.t1 - m.t0));
    const bow = m.arc * 4 * u * (1 - u);
    return [lerp(m.from[0], m.to[0], u) + m.nx * bow, lerp(m.from[1], m.to[1], u) + m.ny * bow];
  }
  return pos;
}

/** File ghost follows the cursor while dragging, then rests where it was dropped. */
export function ghostAt(t: number): Pt {
  return cursorAt(Math.min(t, T.drop));
}

export function cursorOpacityAt(t: number) {
  if (t >= LOOP_BACK) return 0;
  if (t < 200) return t / 200;
  const [a, b] = T.cursorOut;
  if (t >= b) return 0;
  if (t >= a) return 1 - (t - a) / (b - a);
  return 1;
}

function lastClick(t: number) {
  let hit: (typeof CLICKS)[number] | null = null;
  for (const c of CLICKS) {
    if (c.at <= t) hit = c;
    else break;
  }
  return hit;
}

/** Press feedback: 1 to 0.88 in 90 ms, back to 1 in 120 ms. */
export function cursorScaleAt(t: number) {
  const c = lastClick(t);
  if (!c) return 1;
  const d = t - c.at;
  if (d < 90) return 1 - 0.12 * (d / 90);
  if (d < 210) return 0.88 + 0.12 * ((d - 90) / 120);
  return 1;
}

export const RIPPLE_MS = 380;
/** Ripple ring after the latest click: canvas point and progress 0..1, or null. */
export function rippleAt(t: number): { p: Pt; u: number } | null {
  const c = lastClick(t);
  if (!c) return null;
  const d = t - c.at;
  if (d < 0 || d >= RIPPLE_MS) return null;
  return { p: c.at2, u: d / RIPPLE_MS };
}

/* ------------------------------------------------------------------ */
/* Scroll and progress                                                  */
/* ------------------------------------------------------------------ */

/** Scroll offsets that put a gap, not half a line of text, at the top edge. */
const REVIEW_SCROLL = 195;
const RESULTS_SCROLL = 452;

function ramp(t: number, [a, b]: readonly [number, number], to: number) {
  return to * easeInOut(clamp01((t - a) / (b - a)));
}

export function scrollAt(view: View, t: number) {
  switch (view) {
    case "customize":
      return ramp(t, T.scrollStyle, 440);
    case "review":
      return REVIEW_SCROLL;
    case "finish":
      return t >= LOOP_BACK ? RESULTS_SCROLL : ramp(t, T.scrollResults, RESULTS_SCROLL);
    default:
      return 0;
  }
}

export function importProgressAt(t: number) {
  const u = clamp01((t - SCENE.customize) / (T.importDone - SCENE.customize));
  return 1 - Math.pow(1 - u, 1.6);
}

export function processProgressAt(t: number) {
  if (t < T.processHalf) return 0.55 * clamp01((t - SCENE.processing) / (T.processHalf - SCENE.processing));
  return 0.55 + 0.45 * clamp01((t - T.processHalf) / (T.processDone - T.processHalf));
}

/* ------------------------------------------------------------------ */
/* Camera                                                               */
/* ------------------------------------------------------------------ */

type Region = { x0: number; y0: number; rw: number; rh: number };

/** The shot for one focus beat in a frame of fw x fh px. */
function regionFor(f: Omit<Focus, "at">, fw: number, fh: number): Region {
  const k = clamp(fw / (f.s ?? S_COMPACT), 0.5, 0.9);
  const rw = Math.min(CANVAS_W, fw / k);
  const rh = Math.min(CANVAS_H, fh / k);
  const fit = (c: number, lo: number, hi: number, size: number, max: number) => {
    let v = c - size / 2;
    // Keep the must box whole; if it is wider than the shot, keep its start.
    v = hi - lo <= size ? Math.min(Math.max(v, hi - size), lo) : lo;
    return clamp(v, 0, max - size);
  };
  return {
    x0: fit(f.c[0], f.must[0], f.must[2], rw, CANVAS_W),
    y0: fit(f.c[1], f.must[1], f.must[3], rh, CANVAS_H),
    rw,
    rh,
  };
}

const mixRegion = (a: Region, b: Region, u: number): Region => ({
  x0: lerp(a.x0, b.x0, u),
  y0: lerp(a.y0, b.y0, u),
  rw: lerp(a.rw, b.rw, u),
  rh: lerp(a.rh, b.rh, u),
});

/** Compact camera at t: each pan starts from wherever the previous one had got to. */
function focusAt(t: number, fw: number, fh: number): Region {
  let from = regionFor(FOCUS[0], fw, fh);
  let to = from;
  let t0 = 0;
  for (const f of FOCUS) {
    if (f.at > t) break;
    from = mixRegion(from, to, easeBrand(clamp01((f.at - t0) / PAN_MS)));
    to = regionFor(f, fw, fh);
    t0 = f.at;
  }
  return mixRegion(from, to, easeBrand(clamp01((t - t0) / PAN_MS)));
}

function zoomAt(t: number): { z: number; c: Pt } {
  const rest: Pt = [CANVAS_W / 2, CANVAS_H / 2];
  for (const z of ZOOMS) {
    let u = -1;
    if (t >= z.from && t < z.to) u = easeInOut((t - z.from) / (z.to - z.from));
    else if (t >= z.to && t < z.hold) u = 1;
    else if (t >= z.hold && t < z.back) u = 1 - easeInOut((t - z.hold) / (z.back - z.hold));
    if (u >= 0) return { z: lerp(1, z.zoom, u), c: [lerp(rest[0], z.center[0], u), lerp(rest[1], z.center[1], u)] };
  }
  return { z: 1, c: rest };
}

export type Cam = { x0: number; y0: number; k: number };

/**
 * Visible canvas region for a frame of fw x fh px. Desktop shows the whole
 * canvas with two slow punch-ins (centered); compact frames follow focus beats
 * at about 0.76x on a 390 px phone, so the active card, field or button and
 * the bubble's anchor stay whole and app text stays close to legible.
 */
export function cameraAt(t: number, fw: number, fh: number, desktop: boolean, still: boolean): Cam {
  if (fw <= 0 || fh <= 0) return { x0: 0, y0: 0, k: 1 };
  if (!desktop) {
    const r = still ? regionFor(F_RESULTS, fw, fh) : focusAt(t, fw, fh);
    return { x0: r.x0, y0: r.y0, k: fw / r.rw };
  }
  const aspect = fh / fw;
  const z = still ? { z: 1, c: [CANVAS_W / 2, CANVAS_H / 2] as Pt } : zoomAt(t);
  let rw = CANVAS_W / z.z;
  let rh = rw * aspect;
  if (rh > CANVAS_H) {
    rh = CANVAS_H;
    rw = rh / aspect;
  }
  return {
    x0: clamp(z.c[0] - rw / 2, 0, CANVAS_W - rw),
    y0: clamp(z.c[1] - rh / 2, 0, CANVAS_H - rh),
    k: fw / rw,
  };
}
