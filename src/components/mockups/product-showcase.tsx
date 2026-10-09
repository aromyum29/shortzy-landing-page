"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  animate,
  AnimatePresence,
  motion,
  useInView,
  useIsPresent,
  useMotionValueEvent,
  useMotionValue,
  useScroll,
  useTransform,
  type AnimationPlaybackControls,
  type MotionValue,
} from "motion/react";
import { Pause, Play } from "lucide-react";
import { PhoneVideo, type PhoneClip } from "./phone-video";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { cn } from "@/lib/utils";

/*
 * Real Shortzy screens (QA build, sample workspace) shown in a desktop window.
 * Each screen slowly scrolls like a live session, then hands over to the next.
 * The phone plays the real rendered short that belongs to the same project.
 */

const VIEW_W = 1280;
const VIEW_H = 760;

type Slide = {
  id: string;
  label: string;
  status: string;
  alt: string;
  src: string;
  h: number;
  seconds: number;
  clip: PhoneClip;
};

const SLIDES: Slide[] = [
  {
    id: "library",
    label: "Library",
    status: "Stored locally",
    alt: "Shortzy project library with nine video projects, each marked Clips ready or Source ready",
    src: "/product/screens/library.webp",
    h: 1067,
    seconds: 6,
    clip: {
      src: "/product/clips/interview-clip-1",
      poster: "/product/clips/interview-clip-1.webp",
      title: "What I wish I knew before hiring",
    },
  },
  {
    id: "customize",
    label: "Customize",
    status: "Choices saved",
    alt: "Shortzy customize step with caption style presets and an optional moment to find",
    src: "/product/screens/customize.webp",
    h: 1270,
    seconds: 6.5,
    clip: {
      src: "/product/clips/tutorial-clip-2",
      poster: "/product/clips/tutorial-clip-2.webp",
      title: "5 AI workflows that give your week back",
    },
  },
  {
    id: "results",
    label: "Ranked clips",
    status: "6 clips ready",
    alt: "Shortzy results with six captioned vertical clips, titles, AI estimate scores and download buttons",
    src: "/product/screens/results.webp",
    h: 1909,
    seconds: 9,
    clip: {
      src: "/product/clips/podcast-clip-1",
      poster: "/product/clips/podcast-clip-1.webp",
      title: "Trust is the growth strategy nobody can copy",
    },
  },
];

const EASE = [0.2, 0.8, 0.2, 1] as const;

export function ProductShowcase() {
  const reduce = usePrefersReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { amount: 0.25 });
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const progress = useMotionValue(0);
  const controls = useRef<AnimationPlaybackControls | null>(null);

  const running = !reduce && !paused && !hovered && inView;
  const slide = SLIDES[index];

  const go = useCallback(
    (i: number) => {
      progress.set(0);
      setIndex((i + SLIDES.length) % SLIDES.length);
    },
    [progress],
  );

  // Drive the slide timer from one motion value: pan and tab progress both read it.
  useEffect(() => {
    controls.current?.stop();
    if (!running) return;
    const remaining = 1 - progress.get();
    controls.current = animate(progress, 1, {
      duration: SLIDES[index].seconds * remaining,
      ease: "linear",
      onComplete: () => go(index + 1),
    });
    return () => controls.current?.stop();
  }, [running, index, progress, go]);

  // Scroll-linked depth: the window settles flat as it reaches the middle of the screen.
  const { scrollYProgress } = useScroll({ target: rootRef, offset: ["start end", "center center"] });
  const tilt = useTransform(scrollYProgress, [0, 1], [10, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.95, 1]);
  const phoneY = useTransform(scrollYProgress, [0, 1], [60, 0]);

  return (
    <div ref={rootRef} className="relative mx-auto max-w-[1120px]">
      <motion.div
        style={reduce ? undefined : { rotateX: tilt, scale, transformPerspective: 1800 }}
        className="relative"
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        {/* Live status chip */}
        <div className="absolute -top-4 left-4 z-20 sm:-top-5 sm:left-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-pebble bg-white px-3 py-1.5 text-[12px] font-semibold text-ink shadow-[0_8px_20px_-12px_rgba(41,38,40,0.5)] sm:text-[13px]">
            <span className="relative grid size-2 place-items-center">
              <span className="absolute size-2 rounded-full bg-success/40 motion-safe:animate-ping" />
              <span className="size-2 rounded-full bg-success" />
            </span>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={slide.status}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.25 }}
              >
                {slide.status}
              </motion.span>
            </AnimatePresence>
          </span>
        </div>

        <div className="overflow-hidden rounded-[14px] border border-pebble bg-white shadow-[0_40px_80px_-30px_rgba(41,38,40,0.6)] sm:rounded-[20px]">
          <div className="relative flex h-7 items-center border-b border-pebble/70 bg-paper px-3 sm:h-10 sm:px-4">
            <div className="flex gap-1.5 sm:gap-2" aria-hidden="true">
              <span className="size-2 rounded-full bg-coral sm:size-3" />
              <span className="size-2 rounded-full bg-oat sm:size-3" />
              <span className="size-2 rounded-full bg-pebble sm:size-3" />
            </div>
            <span className="absolute left-1/2 -translate-x-1/2 text-[11px] font-medium text-mute sm:text-[13px]">
              Shortzy
            </span>
          </div>

          <div className="relative overflow-hidden bg-white" style={{ aspectRatio: `${VIEW_W} / ${VIEW_H}` }}>
            <AnimatePresence initial={false}>
              <motion.div
                key={slide.id}
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 1.015 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: EASE }}
              >
                <PanningScreen slide={slide} progress={progress} still={reduce} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <motion.div
          style={reduce ? undefined : { y: phoneY }}
          className="absolute -bottom-[10%] -right-[1%] z-10 w-[32%] max-w-[240px] sm:-right-[2%] sm:w-[23%] lg:-right-[4%]"
        >
          <PhoneVideo clip={slide.clip} />
        </motion.div>
      </motion.div>

      {/* Tabs */}
      <div className="on-dark relative mt-[13%] flex flex-col items-center gap-3 sm:mt-14 lg:mt-12">
        <div className="flex items-center gap-2">
          <div role="tablist" aria-label="Product screens" className="flex rounded-full bg-white/10 p-1">
            {SLIDES.map((s, i) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                onClick={() => go(i)}
                className={cn(
                  "relative overflow-hidden rounded-full px-3 py-1.5 text-[13px] font-semibold transition-colors sm:px-4 sm:text-[14px]",
                  i === index ? "bg-paper text-maroon" : "text-paper/80 hover:text-paper",
                )}
              >
                {s.label}
                {i === index && <TabProgress progress={progress} />}
              </button>
            ))}
          </div>
          {!reduce && (
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              aria-label={paused ? "Play product tour" : "Pause product tour"}
              className="grid size-9 place-items-center rounded-full bg-white/10 text-paper hover:bg-white/20"
            >
              {paused ? <Play className="size-4 fill-current" /> : <Pause className="size-4 fill-current" />}
            </button>
          )}
        </div>
        <p className="text-[12px] text-paper/70 sm:text-[13px]">Real Shortzy screens, shown with a sample workspace.</p>
      </div>
    </div>
  );
}

function TabProgress({ progress }: { progress: MotionValue<number> }) {
  return (
    <motion.span
      aria-hidden="true"
      className="absolute inset-x-3 bottom-[3px] h-[2px] origin-left rounded-full bg-maroon/50 sm:inset-x-4"
      style={{ scaleX: progress }}
    />
  );
}

function PanningScreen({ slide, progress, still }: { slide: Slide; progress: MotionValue<number>; still: boolean }) {
  // Follow the shared timer only while on screen, so an exiting slide holds its position.
  const isPresent = useIsPresent();
  const local = useMotionValue(progress.get());
  useMotionValueEvent(progress, "change", (v) => {
    if (isPresent) local.set(v);
  });
  // Scroll the tall screenshot from top to bottom between 15% and 85% of the slide time.
  const travel = (1 - VIEW_H / slide.h) * 100;
  const y = useTransform(local, [0, 0.15, 0.85, 1], ["0%", "0%", `-${travel}%`, `-${travel}%`], {
    ease: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  });

  return (
    <motion.img
      src={slide.src}
      alt={slide.alt}
      width={VIEW_W}
      height={slide.h}
      draggable={false}
      className="absolute inset-x-0 top-0 block h-auto w-full select-none"
      style={still ? undefined : { y }}
    />
  );
}
