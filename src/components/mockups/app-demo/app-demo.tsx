"use client";

import { memo, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { Pause, Play } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { cn } from "@/lib/utils";
import { DemoClock } from "./context";
import { AI, CLIP_VIDEO, CLIPS, COST, PROJECT } from "./data";
import { appFont } from "./font";
import { Bubbles, Cursor, Ripple } from "./overlay";
import { FileGhost, PlayingControls, Sidebar, ViewBody, viewSlice, type ViewSlice } from "./screens";
import {
  BEATS,
  beatIndex,
  cameraAt,
  FRAMES,
  frameAt,
  ghostAt,
  LOOP,
  LOOP_BACK,
  PLAY_AT,
  sceneStart,
  scrollAt,
  STILL_T,
  T,
  VIEW_END,
  VIEW_START,
  type Cam,
  type Frame,
  type View,
} from "./timeline";

/*
 * Hero demo: an auto-playing, looping click-through of the real Shortzy app
 * with a sample workspace, from a new project to ranked, captioned clips.
 *
 * One master clock (a motion value in ms) drives everything. The discrete UI
 * state comes from a pure frame model; only the two layers that draw it (the
 * canvas and the bubbles) re-render when it changes, never the window shell.
 * Cursor, camera, scroll and progress derive from the clock.
 *
 * The clock starts the first time about 60% of the demo is in view, from the
 * library, so the first full view is the whole story.
 *
 * WCAG 2.2.2: click or tap the demo to pause, or use the visually hidden
 * button that appears on keyboard focus. It also pauses itself when less than
 * a quarter is in view or the tab is hidden. ?demo=<ms> freezes it at a time.
 */

const EASE = [0.2, 0.8, 0.2, 1] as const;

function subscribeVisibility(onChange: () => void) {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
}
const useDocumentVisible = () =>
  useSyncExternalStore(subscribeVisibility, () => document.visibilityState === "visible", () => true);

function readFrozen() {
  if (typeof window === "undefined") return null;
  const raw = new URLSearchParams(window.location.search).get("demo");
  if (raw === null || raw.trim() === "") return null;
  const v = Number(raw);
  return Number.isFinite(v) ? Math.min(Math.max(v, 0), LOOP - 1) : null;
}
const useFrozen = () => useSyncExternalStore(() => () => {}, readFrozen, () => null);

/** Start once this share of the demo is in view (or it fills most of a short viewport). */
const START_RATIO = 0.6;
const START_THRESHOLDS = Array.from({ length: 21 }, (_, i) => i / 20);

/** The current frame of the clock. Re-renders the caller only when the beat changes. */
function useFrame(t: MotionValue<number>, still: boolean) {
  const [beat, setBeat] = useState(() => beatIndex(t.get()));
  const beatRef = useRef(beat);
  useMotionValueEvent(t, "change", (v) => {
    const b = beatIndex(v);
    if (b !== beatRef.current) {
      beatRef.current = b;
      setBeat(b);
    }
  });
  const base = FRAMES[beat];
  const f: Frame = useMemo(() => (still ? { ...base, playing: false } : base), [base, still]);
  return { f, beatT: BEATS[beat] };
}

/* ------------------------------------------------------------------ */
/* View stack                                                           */
/* ------------------------------------------------------------------ */

const ORDER: View[] = ["library", "upload", "customize", "review", "finish"];
const NEXT = Object.fromEntries(ORDER.map((v, i) => [v, ORDER[(i + 1) % ORDER.length]])) as Record<View, View>;
/** Each view as it first appears, and as it looks when it hands over. */
const ENTRY = Object.fromEntries(ORDER.map((v) => [v, viewSlice(v, frameAt(VIEW_START[v]))])) as Record<View, ViewSlice>;
const EXIT = Object.fromEntries(ORDER.map((v) => [v, viewSlice(v, frameAt(VIEW_END[v] - 10))])) as Record<View, ViewSlice>;
/** How long after a view appears the next one is reset and laid out, off screen. */
const PREP_AFTER = 400;
const FADE_S = 0.22;

type Role = "active" | "out" | "warm" | "idle";
const Z: Record<Role, number> = { active: 2, out: 1, warm: 0, idle: 0 };

/** Time the active view has been on screen at beat time `bt` (the library carries over the loop seam). */
function sinceShown(view: View, bt: number) {
  if (bt >= LOOP_BACK) return bt - LOOP_BACK;
  if (view === "library") return bt + (LOOP - LOOP_BACK);
  return bt - VIEW_START[view];
}

/**
 * Every view stays mounted once it has been shown, in its own contained layer.
 * The incoming view fades in over the outgoing one; idle layers skip layout
 * and paint (content-visibility: hidden). A while into each scene the next
 * view is reset to its entry state and laid out at opacity 0, so a scene
 * change is only an opacity fade, never a mount.
 */
const ViewStack = memo(function ViewStack({ f, beatT, warm }: { f: Frame; beatT: number; warm: boolean }) {
  const active = f.view;
  const [trans, setTrans] = useState<{ active: View; out: View | null }>({ active, out: null });
  if (trans.active !== active) setTrans({ active, out: trans.active });
  const out = trans.active !== active ? trans.active : trans.out;

  useEffect(() => {
    if (!trans.out) return;
    const id = window.setTimeout(() => setTrans((s) => ({ ...s, out: null })), FADE_S * 1000 + 80);
    return () => window.clearTimeout(id);
  }, [trans]);

  const next = NEXT[active];
  const prep = warm && sinceShown(active, beatT) >= PREP_AFTER;
  // Views only ever join the stack: the active one, and the next one once it is being prepared.
  const [mounted, setMounted] = useState<View[]>([active]);
  const join = [active, ...(prep ? [next] : [])].filter((v) => !mounted.includes(v));
  if (join.length) setMounted([...mounted, ...join]);

  return (
    <>
      {ORDER.filter((v) => v === active || v === out || mounted.includes(v)).map((v) => {
        const role: Role = v === active ? "active" : v === out ? "out" : prep && v === next ? "warm" : "idle";
        const s = role === "active" ? viewSlice(v, f) : role === "warm" ? ENTRY[v] : EXIT[v];
        return (
          <motion.div
            key={v}
            className="absolute inset-0 bg-white"
            initial={false}
            animate={{ opacity: role === "active" || role === "out" ? 1 : 0 }}
            transition={role === "active" ? { duration: FADE_S, ease: EASE } : { duration: 0 }}
            style={{ zIndex: Z[role], contain: "layout paint", contentVisibility: role === "idle" ? "hidden" : "visible" }}
          >
            <ViewBody view={v} s={s} />
          </motion.div>
        );
      })}
    </>
  );
});

/* ------------------------------------------------------------------ */
/* Layers that follow the beat                                          */
/* ------------------------------------------------------------------ */

/** Everything drawn on the scaled canvas: the views, clip 1's video, the dragged file and the sidebar. */
const CanvasLayers = memo(function CanvasLayers({
  t,
  still,
  frozen,
  running,
}: {
  t: MotionValue<number>;
  still: boolean;
  frozen: number | null;
  running: boolean;
}) {
  const { f, beatT } = useFrame(t, still);
  const videoRef = useRef<HTMLVideoElement>(null);

  // One video element for clip 1: fetched from the processing scene on, restarted each loop.
  useEffect(() => {
    const v = videoRef.current;
    if (!v || still || !f.videoLoad || v.preload === "auto") return;
    v.preload = "auto";
    v.load();
  }, [f.videoLoad, still]);

  const wasPlaying = useRef(false);
  useEffect(() => {
    const v = videoRef.current;
    if (!v || still) return;
    v.muted = true;
    const startedPlaying = f.playing && !wasPlaying.current;
    wasPlaying.current = f.playing;
    if (frozen !== null) {
      v.pause();
      if (f.playing) v.currentTime = Math.max(0, (frozen - PLAY_AT) / 1000);
      return;
    }
    // Each loop starts the clip from the top; a user pause only holds it.
    if (startedPlaying) v.currentTime = 0;
    if (f.playing && running) v.play().catch(() => {});
    else v.pause();
  }, [f.playing, running, frozen, still]);

  const ghostX = useTransform(t, (v) => ghostAt(v)[0] + 14);
  const ghostY = useTransform(t, (v) => ghostAt(v)[1] + 14);
  const videoY = useTransform(t, (v) => 555 - scrollAt("finish", v));
  const controlsY = useTransform(videoY, (y) => y + 320);
  // Native controls stay up while the cursor is over the clip, then hide once it leaves.
  const controlsOpacity = useTransform(t, (v) => 1 - Math.min(1, Math.max(0, (v - T.cursorOut[1]) / 250)));
  const showVideo = f.view === "finish" && f.playing;

  return (
    <>
      <ViewStack f={f} beatT={beatT} warm={!still && frozen === null} />

      {/* Clip 1 plays in place over its poster in the results grid. */}
      <motion.video
        ref={videoRef}
        aria-hidden="true"
        tabIndex={-1}
        muted
        playsInline
        disablePictureInPicture
        preload="none"
        poster={CLIPS[0].poster}
        className="absolute left-[289px] top-0 z-[3] h-[400px] w-[225px] bg-[#252327] object-cover"
        style={{ y: videoY }}
        initial={false}
        animate={{ opacity: showVideo && !still ? 1 : 0 }}
        transition={{ duration: 0.15 }}
      >
        <source src={CLIP_VIDEO.webm} type="video/webm" />
        <source src={CLIP_VIDEO.mp4} type="video/mp4" />
      </motion.video>
      {showVideo && !still && (
        <motion.div className="absolute left-[240px] top-0 z-[3] w-[323px]" style={{ y: controlsY, opacity: controlsOpacity }}>
          <PlayingControls />
        </motion.div>
      )}

      <AnimatePresence>
        {f.ghost && (
          <motion.div
            key="ghost"
            className="absolute left-0 top-0 z-[4]"
            style={{ x: ghostX, y: ghostY }}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15, ease: EASE }}
          >
            <FileGhost />
          </motion.div>
        )}
      </AnimatePresence>

      <Sidebar f={f} />
    </>
  );
});

/** Speech bubbles in the unscaled overlay. */
const BubbleLayer = memo(function BubbleLayer({
  t,
  cam,
  fw,
  fh,
  compact,
  dense,
  still,
}: {
  t: MotionValue<number>;
  cam: MotionValue<Cam>;
  fw: MotionValue<number>;
  fh: MotionValue<number>;
  compact: boolean;
  dense: boolean;
  still: boolean;
}) {
  const { f } = useFrame(t, still);
  return <Bubbles ids={f.bubbles} compact={compact} dense={dense} still={still} t={t} cam={cam} fw={fw} fh={fh} />;
});

/** Neutral window chrome: the app runs on Mac and Windows. */
const WindowBar = memo(function WindowBar() {
  return (
    <div
      aria-hidden="true"
      className="flex h-9 items-center justify-between border-b border-pebble/70 bg-paper px-4 sm:h-10 sm:px-5"
    >
      <span className="text-[0.75rem] font-semibold text-ink sm:text-[0.8125rem]">Shortzy</span>
      <span className="text-[0.6875rem] font-medium text-mute sm:text-[0.75rem]">
        <span className="sm:hidden">Sample</span>
        <span className="hidden sm:inline">Sample workspace</span>
      </span>
    </div>
  );
});

/* ------------------------------------------------------------------ */
/* Demo                                                                 */
/* ------------------------------------------------------------------ */

export function AppDemo() {
  const reduce = usePrefersReducedMotion();
  // From 640px the 16:10 frame shows the whole canvas (with the two punch-ins); phones follow focus beats.
  const desktop = useMediaQuery("(min-width: 640px)", true);
  const wide = useMediaQuery("(min-width: 1024px)", true);
  const compact = !desktop;
  const dense = desktop && !wide;
  const frozen = useFrozen();
  const still = reduce;

  const rootRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const descId = useId();

  const inView = useInView(rootRef, { amount: 0.25 });
  const docVisible = useDocumentVisible();
  const [userPaused, setUserPaused] = useState(false);
  const [measured, setMeasured] = useState(false);
  const [started, setStarted] = useState(false);

  // Master clock and frame size.
  const t = useMotionValue(0);
  const fw = useMotionValue(0);
  const fh = useMotionValue(0);
  const deskMV = useMotionValue(desktop ? 1 : 0);
  const stillMV = useMotionValue(still ? 1 : 0);
  const clock = useMemo(() => ({ t, still }), [t, still]);

  useEffect(() => {
    deskMV.set(desktop ? 1 : 0);
    stillMV.set(still ? 1 : 0);
  }, [desktop, still, deskMV, stillMV]);

  // Seek for the still frame and the ?demo= debug hook.
  useEffect(() => {
    if (frozen !== null) t.set(frozen);
    else if (still) t.set(STILL_T);
  }, [frozen, still, t]);

  // Start gate: the first time about 60% of the demo is in view, play from the library.
  useEffect(() => {
    if (started || still || frozen !== null) return;
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[entries.length - 1];
        const vh = e.rootBounds?.height ?? window.innerHeight;
        if (e.intersectionRatio >= START_RATIO || e.intersectionRect.height >= 0.8 * vh) {
          io.disconnect();
          t.set(0);
          setStarted(true);
        }
      },
      { threshold: START_THRESHOLDS },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [started, still, frozen, t]);

  // Measure the frame (layout size, unaffected by the scroll tilt).
  useLayoutEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const measure = () => {
      fw.set(el.clientWidth);
      fh.set(el.clientHeight);
      setMeasured(el.clientWidth > 0);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [fw, fh]);

  const visible = inView && docVisible;
  const running = measured && started && !still && frozen === null && !userPaused && visible;

  // Coming back into view (or to the tab) resumes from the start of the current scene.
  const wasVisible = useRef(visible);
  useEffect(() => {
    if (visible && !wasVisible.current && frozen === null && !still) t.set(sceneStart(t.get()));
    wasVisible.current = visible;
  }, [visible, frozen, still, t]);

  // The clock itself: one rAF loop, only while running.
  useEffect(() => {
    if (!running) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(now - last, 50);
      last = now;
      let v = t.get() + dt;
      if (v >= LOOP) v -= LOOP;
      t.set(v);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running, t]);

  // Camera: the visible canvas region, mapped to the frame.
  const cam = useTransform(() => cameraAt(t.get(), fw.get(), fh.get(), deskMV.get() === 1, stillMV.get() === 1));
  const canvasX = useTransform(cam, (c) => -c.x0 * c.k);
  const canvasY = useTransform(cam, (c) => -c.y0 * c.k);
  const canvasScale = useTransform(cam, (c) => c.k);

  // Scroll-linked settle: the window tilts back flat as it reaches the middle of the screen.
  const { scrollYProgress } = useScroll({ target: rootRef, offset: ["start end", "center center"] });
  const tilt = useTransform(scrollYProgress, [0, 1], [10, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.95, 1]);

  const canPause = !still && frozen === null;
  const toggle = () => {
    if (canPause) setUserPaused((p) => !p);
  };

  return (
    <div ref={rootRef} className="relative">
      <motion.div
        style={still ? { rotateX: 0, scale: 1 } : { rotateX: tilt, scale, transformPerspective: 1800 }}
        className="relative"
      >
        <div className="relative overflow-hidden rounded-[16px] border border-pebble bg-white shadow-[0_40px_80px_-30px_rgba(41,38,40,0.6)] sm:rounded-[24px]">
          <WindowBar />

          {canPause && (
            <button
              type="button"
              onClick={toggle}
              aria-controls={`${descId}-demo`}
              className="pointer-events-none absolute left-3 top-12 z-40 inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-4 text-[0.875rem] font-semibold text-white opacity-0 shadow-[0_10px_24px_-12px_rgba(41,38,40,0.55)] focus-visible:pointer-events-auto focus-visible:opacity-100 sm:top-14"
            >
              {userPaused ? <Play aria-hidden="true" className="size-4 fill-current" /> : <Pause aria-hidden="true" className="size-4 fill-current" />}
              {userPaused ? "Play demo" : "Pause demo"}
            </button>
          )}

          <div
            ref={frameRef}
            id={`${descId}-demo`}
            role="img"
            aria-label="Animated demo of the Shortzy app with a sample workspace: a 44:48 podcast becomes six ranked, captioned vertical clips."
            aria-describedby={descId}
            onClick={toggle}
            className={cn(
              "relative aspect-square select-none overflow-hidden bg-white sm:aspect-[16/10]",
              canPause && "cursor-pointer",
            )}
          >
            <DemoClock.Provider value={clock}>
              <div aria-hidden="true" inert className="absolute inset-0 overflow-hidden">
                <motion.div
                  className={cn(
                    appFont.className,
                    "absolute left-0 top-0 h-[800px] w-[1280px] overflow-hidden bg-white text-[14px] leading-[1.55] text-[#252327] antialiased",
                  )}
                  style={{
                    x: canvasX,
                    y: canvasY,
                    scale: canvasScale,
                    originX: 0,
                    originY: 0,
                    visibility: measured ? "visible" : "hidden",
                  }}
                >
                  <CanvasLayers t={t} still={still} frozen={frozen} running={running} />
                </motion.div>
              </div>

              {/* Unscaled overlay */}
              {measured && (
                <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
                  <BubbleLayer
                    key={compact ? "c" : dense ? "m" : "d"}
                    t={t}
                    cam={cam}
                    fw={fw}
                    fh={fh}
                    compact={compact}
                    dense={dense}
                    still={still}
                  />
                  {!still && (
                    <>
                      <Ripple t={t} cam={cam} />
                      <Cursor t={t} cam={cam} small={compact} />
                    </>
                  )}
                </div>
              )}
            </DemoClock.Provider>

            <AnimatePresence>
              {userPaused && canPause && (
                <motion.span
                  aria-hidden="true"
                  className="absolute left-1/2 top-2.5 z-40 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-ink/90 px-3 py-1.5 text-[0.75rem] font-semibold text-white"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.18, ease: EASE }}
                >
                  <Pause className="size-3 fill-current" />
                  Paused
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Read once, as the demo's description (aria-describedby resolves hidden content). */}
      <ol id={descId} hidden>
        <li>Start a new project.</li>
        <li>Paste a YouTube link or add your own file; the sample uses a {PROJECT.length} podcast file.</li>
        <li>Your connected AI, here {AI.provider}, is chosen while the video copies into your workspace.</li>
        <li>Pick 6 vertical clips, 30 to 60 seconds, with Bold pop captions.</li>
        <li>Shortzy checks the video on your computer; nothing has been sent to your AI yet.</li>
        <li>
          The estimated AI cost, {COST.estimate} for this sample on {AI.provider} {AI.model}, is shown before anything runs;
          your provider bills the actual usage.
        </li>
        <li>
          You agree to send the prepared video to {AI.provider}; Shortzy and your AI find the moments, and your computer
          frames, captions and exports them.
        </li>
        <li>
          Six clips arrive ranked by AI estimate scores with reasons; scores are not predictions of views. The recorded AI
          usage for the run is {COST.recorded}, billed by your provider, with no credits.
        </li>
      </ol>
    </div>
  );
}
