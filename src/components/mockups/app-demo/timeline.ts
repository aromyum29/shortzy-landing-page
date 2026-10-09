/*
 * Pure, seekable model of the hero demo. Everything is a function of one
 * clock value t (ms from loop start): the discrete UI state (frameAt), the
 * cursor, the camera, scroll positions and progress bars. React re-renders
 * only when frameAt changes (a "beat"); continuous values are derived from t
 * through motion values.
 *
 * Coordinates are on a fixed 1280 x 800 app canvas. "Full" y values are page
 * coordinates inside a view before its scroll is applied.
 */

export const CANVAS_W = 1280;
export const CANVAS_H = 800;

export type Pt = readonly [number, number];
export type View = "library" | "upload" | "customize" | "review" | "finish";

/** Loop length and the moment the last scene crossfades back to the library. */
export const LOOP = 19400;
export const LOOP_BACK = 19200;

/** View and stage switches (each crossfades in over about 200 ms). */
export const SCENE = {
  library: 0,
  upload: 1120,
  customize: 3740,
  shorts: 5730,
  analyze: 7700,
  estimate: 8840,
  confirm: 10740,
  processing: 11900,
  results: 14380,
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
  hoverYoutube: [1745, 1860],
  ghostIn: 2450,
  dragOver: 2700,
  drop: 2945,
  collapse: 5170,
  hoverSelect: [5960, 6110],
  hoverWord: [6520, 6650],
  hoverBold: [6650, 6730],
  scrollStyle: [7055, 7470],
  check1: 7785,
  check2: 7885,
  check3: 8240,
  estimateReady: 9045,
  framing: 13200,
  cardsIn: 14505,
  scrollResults: [15810, 16310],
  cursorOut: [16980, 17230],
  importDone: 5145,
  processHalf: 13200,
  processDone: 14280,
} as const;

/** Every click: when, where (canvas coords at that moment) and what it presses. */
export const CLICKS = [
  { at: 1040, at2: [104, 163], id: "newProject" },
  { at: 2075, at2: [679, 466], id: "segUpload" },
  { at: 3485, at2: [744, 702], id: "create" },
  { at: 5730, at2: [332, 434], id: "tabShorts" },
  { at: 6310, at2: [415, 434], id: "tabStyle" },
  { at: 6850, at2: [351, 610], id: "presetBold" },
  { at: 7595, at2: [856, 769], id: "analyze" },
  { at: 8640, at2: [1040, 619], id: "seeCost" },
  { at: 10540, at2: [1041, 659], id: "reviewConfirm" },
  { at: 11240, at2: [373, 548], id: "consent" },
  { at: 11695, at2: [1054, 715], id: "find" },
  { at: 16420, at2: [401, 303], id: "clip1" },
] as const;

export type ClickId = (typeof CLICKS)[number]["id"];
const CLICK = Object.fromEntries(CLICKS.map((c) => [c.id, c.at])) as Record<ClickId, number>;
export const PLAY_AT = CLICK.clip1;

const HOVER_LEAD = 120;
const PRESS_MS = 110;

/** Cursor path: each move runs from `start` to `end` and lands on `to` (canvas coords). */
const CURSOR_START: Pt = [700, 520];
const MOVES_IN: { start: number; end: number; to: Pt }[] = [
  { start: 415, end: 910, to: [104, 163] },
  { start: 1320, end: 1745, to: [430, 466] },
  { start: 1860, end: 2035, to: [679, 466] },
  { start: 2120, end: 2410, to: [1180, 700] },
  { start: 2450, end: 2905, to: [541, 598] },
  { start: 3000, end: 3360, to: [744, 702] },
  { start: 4060, end: 4400, to: [600, 650] },
  { start: 5330, end: 5685, to: [332, 434] },
  { start: 5790, end: 6000, to: [480, 518] },
  { start: 6110, end: 6265, to: [415, 434] },
  { start: 6370, end: 6555, to: [584, 610] },
  { start: 6630, end: 6800, to: [351, 610] },
  { start: 7100, end: 7510, to: [856, 769] },
  { start: 7810, end: 8160, to: [1040, 619] },
  { start: 8920, end: 9250, to: [655, 390] },
  { start: 10050, end: 10415, to: [1041, 659] },
  { start: 10800, end: 11155, to: [373, 548] },
  { start: 11280, end: 11610, to: [1054, 715] },
  { start: 11900, end: 12300, to: [760, 600] },
  { start: 15900, end: 16320, to: [401, 303] },
];

export type Placement = "top" | "top-start" | "right" | "left" | "bottom";
export type BubbleKind = "main" | "qualifier" | "aha";
export type Bubble = {
  id: string;
  text: string;
  in: number;
  out: number;
  view: View;
  /** Anchor in full page coords of its view (y before scroll). */
  anchor: Pt;
  place: Placement;
  anchorCompact?: Pt;
  placeCompact?: Placement;
  kind: BubbleKind;
};

export const BUBBLES: Bubble[] = [
  {
    id: "B1", text: "Your projects live on your computer", in: 60, out: 1180, view: "library",
    anchor: [158, 763], place: "right", anchorCompact: [96, 240], placeCompact: "bottom", kind: "main",
  },
  {
    id: "B2", text: "A YouTube link or your own file", in: 1410, out: 2520, view: "upload",
    anchor: [818, 458], place: "right", anchorCompact: [541, 444], placeCompact: "top", kind: "main",
  },
  {
    id: "B3", text: "Your own AI. Gemini or Qwen.", in: 4040, out: 5150, view: "customize",
    anchor: [370, 622], place: "right", kind: "main",
  },
  { id: "B4", text: "Pick how your captions look", in: 6350, out: 7460, view: "customize", anchor: [476, 549], place: "top", kind: "main" },
  {
    id: "B5", text: "Checked locally. Nothing sent yet.", in: 7740, out: 8840, view: "review",
    anchor: [492, 534], place: "right", kind: "main",
  },
  {
    id: "B6", text: "See the cost before it runs", in: 9130, out: 10580, view: "review",
    anchor: [760, 547], place: "right", kind: "main",
  },
  {
    id: "B6b", text: "Estimate. Your provider bills you.", in: 9375, out: 10580, view: "review",
    anchor: [852, 719], place: "right", anchorCompact: [520, 743], placeCompact: "bottom", kind: "qualifier",
  },
  {
    id: "B7", text: "Nothing runs until you say so", in: 10780, out: 11880, view: "review",
    anchor: [1070, 885], place: "top", anchorCompact: [540, 768], placeCompact: "bottom", kind: "main",
  },
  {
    id: "B8a", text: "Your AI finds the moments", in: 12040, out: 13150, view: "finish",
    anchor: [586, 326], place: "right", anchorCompact: [600, 426], placeCompact: "bottom", kind: "main",
  },
  {
    id: "B8b", text: "Your computer does the editing", in: 13280, out: 14380, view: "finish",
    anchor: [613, 326], place: "right", anchorCompact: [600, 426], placeCompact: "bottom", kind: "main",
  },
  {
    id: "B9c", text: "Just your AI usage. No credits.", in: 14700, out: 15810, view: "finish",
    anchor: [676, 407], place: "right", anchorCompact: [420, 419], placeCompact: "bottom", kind: "main",
  },
  {
    id: "B9a", text: "Ranked by AI estimate, with reasons", in: 16480, out: 17970, view: "finish",
    anchor: [744, 525], place: "right", anchorCompact: [389, 1055], placeCompact: "right", kind: "main",
  },
  {
    id: "B9b", text: "Framed, captioned, ready to post", in: 16980, out: 18970, view: "finish",
    anchor: [563, 590], place: "right", kind: "aha",
  },
];

/**
 * Compact (phone) camera focus points, panned with the brand ease. p is
 * [centre x, top y] in canvas px: pinning the top edge (not the centre) keeps
 * headings whole at every phone width. `w` widens the visible region where a
 * centred layout needs more room.
 */
const FOCUS: { at: number; p: Pt; w?: number }[] = [
  { at: 0, p: [330, 64] },
  { at: SCENE.upload, p: [540, 120] },
  { at: SCENE.customize, p: [560, 120] },
  { at: T.scrollStyle[0], p: [640, 150] },
  { at: SCENE.analyze, p: [744, 0], w: 800 },
  { at: SCENE.processing, p: [560, 64] },
  { at: T.scrollResults[0], p: [547, 16] },
];
export const STILL_FOCUS: Pt = [547, 16];

/**
 * Desktop punch-ins: push in from `from` to `to`, hold until `hold`, then
 * return by `back`. Both frame the main column with the sidebar out of shot,
 * so the crop edges fall in margins and never cut a label or a line of text.
 */
const ZOOMS = [
  { from: T.estimateReady, to: 9800, hold: 9980, back: 10480, zoom: 1.25, center: [744, 400] as Pt },
  { from: 16480, to: 17380, hold: 18970, back: 19300, zoom: 1.2, center: [744, 334] as Pt },
];

/** Reduced motion: one static frame with the ranked results and both closing bubbles. */
export const STILL_T = 17500;

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

function focusAt(t: number): { p: Pt; w: number } {
  let i = 0;
  for (let j = 0; j < FOCUS.length; j++) if (FOCUS[j].at <= t) i = j;
  const cur = FOCUS[i];
  const prev = FOCUS[(i - 1 + FOCUS.length) % FOCUS.length];
  const u = easeBrand(clamp01((t - cur.at) / 400));
  return {
    p: [lerp(prev.p[0], cur.p[0], u), lerp(prev.p[1], cur.p[1], u)],
    w: lerp(prev.w ?? 0, cur.w ?? 0, u),
  };
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
 * canvas with two slow punch-ins (centred); compact frames follow focus points
 * (centre x, top y) with a region about fw / 0.55 canvas px wide, so the key
 * UI stays readable.
 */
export function cameraAt(t: number, fw: number, fh: number, desktop: boolean, still: boolean): Cam {
  if (fw <= 0 || fh <= 0) return { x0: 0, y0: 0, k: 1 };
  const aspect = fh / fw;
  let rw: number;
  let c: Pt;
  if (desktop) {
    const z = still ? { z: 1, c: [CANVAS_W / 2, CANVAS_H / 2] as Pt } : zoomAt(t);
    rw = CANVAS_W / z.z;
    c = z.c;
  } else {
    const focus = still ? { p: STILL_FOCUS, w: 0 } : focusAt(t);
    rw = Math.min(CANVAS_W, Math.max(fw / 0.55, focus.w));
    c = focus.p;
  }
  let rh = rw * aspect;
  if (rh > CANVAS_H) {
    rh = CANVAS_H;
    rw = rh / aspect;
  }
  return {
    x0: clamp(c[0] - rw / 2, 0, CANVAS_W - rw),
    y0: clamp(desktop ? c[1] - rh / 2 : c[1], 0, CANVAS_H - rh),
    k: fw / rw,
  };
}
