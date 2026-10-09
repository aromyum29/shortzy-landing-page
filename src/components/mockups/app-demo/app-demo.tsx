"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "motion/react";
import { Pause, Play } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { cn } from "@/lib/utils";
import { DemoClock } from "./context";
import { CLIP_VIDEO, CLIPS } from "./data";
import { appFont } from "./font";
import { Bubbles, Cursor, Ripple } from "./overlay";
import { AppView, FileGhost, PlayingControls, Sidebar } from "./screens";
import {
  beatIndex,
  cameraAt,
  FRAMES,
  ghostAt,
  LOOP,
  PLAY_AT,
  sceneStart,
  scrollAt,
  STILL_T,
  T,
  type Frame,
} from "./timeline";

/*
 * Hero demo: an auto-playing, looping click-through of the real Shortzy app
 * with a sample workspace, from a new project to ranked, captioned clips.
 *
 * One master clock (a motion value in ms) drives everything. The discrete UI
 * state comes from a pure frame model and React re-renders only when it
 * changes. Cursor, camera, scroll and progress derive from the clock.
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

export function AppDemo() {
  const reduce = usePrefersReducedMotion();
  // From 640px the 16:10 frame shows the whole canvas (with the two punch-ins); phones follow focus points.
  const desktop = useMediaQuery("(min-width: 640px)", true);
  const wide = useMediaQuery("(min-width: 1024px)", true);
  const compact = !desktop;
  const dense = desktop && !wide;
  const frozen = useFrozen();
  const still = reduce;

  const rootRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const descId = useId();

  const inView = useInView(rootRef, { amount: 0.25 });
  const docVisible = useDocumentVisible();
  const [userPaused, setUserPaused] = useState(false);
  const [measured, setMeasured] = useState(false);

  // Master clock and frame size.
  const t = useMotionValue(0);
  const fw = useMotionValue(0);
  const fh = useMotionValue(0);
  const deskMV = useMotionValue(desktop ? 1 : 0);
  const stillMV = useMotionValue(still ? 1 : 0);

  useEffect(() => {
    deskMV.set(desktop ? 1 : 0);
    stillMV.set(still ? 1 : 0);
  }, [desktop, still, deskMV, stillMV]);

  // Seek for the still frame and the ?demo= debug hook.
  useEffect(() => {
    if (frozen !== null) t.set(frozen);
    else if (still) t.set(STILL_T);
  }, [frozen, still, t]);

  // Re-render only when the discrete frame changes.
  const [beat, setBeat] = useState(0);
  const beatRef = useRef(0);
  useMotionValueEvent(t, "change", (v) => {
    const b = beatIndex(v);
    if (b !== beatRef.current) {
      beatRef.current = b;
      setBeat(b);
    }
  });
  const base = FRAMES[beat];
  const f: Frame = still ? { ...base, playing: false } : base;

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
  const running = measured && !still && frozen === null && !userPaused && visible;

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
    const started = f.playing && !wasPlaying.current;
    wasPlaying.current = f.playing;
    if (frozen !== null) {
      v.pause();
      if (f.playing) v.currentTime = Math.max(0, (frozen - PLAY_AT) / 1000);
      return;
    }
    // Each loop starts the clip from the top; a user pause only holds it.
    if (started) v.currentTime = 0;
    if (f.playing && running) v.play().catch(() => {});
    else v.pause();
  }, [f.playing, running, frozen, still]);

  // Camera: the visible canvas region, mapped to the frame.
  const cam = useTransform(() => cameraAt(t.get(), fw.get(), fh.get(), deskMV.get() === 1, stillMV.get() === 1));
  const canvasX = useTransform(cam, (c) => -c.x0 * c.k);
  const canvasY = useTransform(cam, (c) => -c.y0 * c.k);
  const canvasScale = useTransform(cam, (c) => c.k);

  const ghostX = useTransform(t, (v) => ghostAt(v)[0] + 14);
  const ghostY = useTransform(t, (v) => ghostAt(v)[1] + 14);
  const videoY = useTransform(t, (v) => 555 - scrollAt("finish", v));
  const controlsY = useTransform(videoY, (y) => y + 320);
  // Native controls stay up while the cursor is over the clip, then hide once it leaves.
  const controlsOpacity = useTransform(t, (v) => 1 - Math.min(1, Math.max(0, (v - T.cursorOut[1]) / 250)));

  // Scroll-linked settle: the window tilts back flat as it reaches the middle of the screen.
  const { scrollYProgress } = useScroll({ target: rootRef, offset: ["start end", "center center"] });
  const tilt = useTransform(scrollYProgress, [0, 1], [10, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.95, 1]);

  const canPause = !still && frozen === null;
  const toggle = () => {
    if (canPause) setUserPaused((p) => !p);
  };
  const showVideo = f.view === "finish" && f.playing;

  return (
    <div ref={rootRef} className="relative mx-auto max-w-[1120px]">
      <motion.div
        style={still ? { rotateX: 0, scale: 1 } : { rotateX: tilt, scale, transformPerspective: 1800 }}
        className="relative"
      >
        <div className="relative overflow-hidden rounded-[16px] border border-pebble bg-white shadow-[0_40px_80px_-30px_rgba(41,38,40,0.6)] sm:rounded-[24px]">
          {/* Neutral window chrome: the app runs on Mac and Windows. */}
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
            <DemoClock.Provider value={{ t, still }}>
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
                <AnimatePresence initial={false}>
                  <motion.div
                    key={f.view}
                    className="absolute inset-0 bg-white"
                    initial={{ opacity: 0, zIndex: 1 }}
                    animate={{ opacity: 1, zIndex: 1 }}
                    exit={{ opacity: 0, zIndex: 0, transition: { opacity: { delay: 0.22, duration: 0 }, zIndex: { duration: 0 } } }}
                    transition={{ opacity: { duration: 0.22, ease: EASE }, zIndex: { duration: 0 } }}
                  >
                    <AppView f={f} />
                  </motion.div>
                </AnimatePresence>

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
                  className="absolute left-[289px] top-0 z-[2] h-[400px] w-[225px] bg-[#252327] object-cover"
                  style={{ y: videoY }}
                  initial={false}
                  animate={{ opacity: showVideo && !still ? 1 : 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <source src={CLIP_VIDEO.webm} type="video/webm" />
                  <source src={CLIP_VIDEO.mp4} type="video/mp4" />
                </motion.video>
                {showVideo && !still && (
                  <motion.div className="absolute left-[240px] top-0 z-[2] w-[323px]" style={{ y: controlsY, opacity: controlsOpacity }}>
                    <PlayingControls />
                  </motion.div>
                )}

                <AnimatePresence>
                  {f.ghost && (
                    <motion.div
                      key="ghost"
                      className="absolute left-0 top-0 z-[3]"
                      style={{ x: ghostX, y: ghostY }}
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.15 }}
                    >
                      <FileGhost />
                    </motion.div>
                  )}
                </AnimatePresence>

                <Sidebar f={f} />
              </motion.div>
              </div>

              {/* Unscaled overlay */}
              {measured && (
                <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
                  <Bubbles
                    key={compact ? "c" : dense ? "m" : "d"}
                    ids={f.bubbles}
                    compact={compact}
                    dense={dense}
                    still={still}
                    t={t}
                    cam={cam}
                    fw={fw}
                    fh={fh}
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
                  transition={{ duration: 0.18 }}
                >
                  <Pause className="size-3 fill-current" />
                  Paused
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      <ol id={descId} className="sr-only">
        <li>Start a new project.</li>
        <li>Paste a YouTube link or add your own file; the sample uses a 44:48 podcast file.</li>
        <li>Your connected AI, here Gemini, is chosen while the video copies into your workspace.</li>
        <li>Pick 6 vertical clips, 30 to 60 seconds, with Bold pop captions.</li>
        <li>Shortzy checks the video on your computer; nothing has been sent to your AI yet.</li>
        <li>The estimated AI cost, $0.43 to $1.33 for this sample on Gemini Flash 3.8, is shown before anything runs; your provider bills the actual usage.</li>
        <li>You agree to send the prepared video to Gemini; your AI finds the moments and your computer frames, captions and exports them.</li>
        <li>Six clips arrive ranked by AI estimate scores with reasons; scores are not predictions of views.</li>
      </ol>
    </div>
  );
}
