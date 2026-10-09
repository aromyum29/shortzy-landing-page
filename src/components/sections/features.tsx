"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  motion,
  useInView,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { Check, Info, ScanFace, Presentation } from "lucide-react";
import { Container, Eyebrow } from "@/components/ui/container";
import { Captions, CAPTION_PRESETS, type CaptionPreset } from "@/components/mockups/captions";
import { LoopVideo } from "@/components/mockups/loop-video";
import { useWordTicker } from "@/hooks/use-word-ticker";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { appFont } from "@/components/mockups/app-demo/font";
import { cn } from "@/lib/utils";

/*
 * "What's inside" is scroll-scrubbed: every effect is tied to scroll position and
 * smoothed with a spring, so things glide into place as you scroll and reverse if
 * you scroll back. Reduced motion renders everything static and in place.
 */

type Offset = NonNullable<Parameters<typeof useScroll>[0]>["offset"];
/** Explicit resting values: Motion keeps the last applied style if a motion value is simply removed. */
const AT_REST = { x: 0, y: 0, opacity: 1, scale: 1, rotateX: 0 };
const SMOOTH = { stiffness: 150, damping: 30, mass: 0.4 };

function useScrub(ref: React.RefObject<HTMLElement | null>, offset: Offset) {
  const { scrollYProgress } = useScroll({ target: ref, offset });
  return useSpring(scrollYProgress, SMOOTH);
}

/** Slides and fades a block in as it enters, scrubbed by scroll. */
function ScrubIn({
  children,
  className,
  x = 0,
  y = 28,
  from = 0.98,
  to = 0.72,
}: {
  children: ReactNode;
  className?: string;
  x?: number;
  y?: number;
  from?: number;
  to?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = usePrefersReducedMotion();
  const p = useScrub(ref, [`start ${from}`, `start ${to}`]);
  const tx = useTransform(p, [0, 1], [x, 0]);
  const ty = useTransform(p, [0, 1], [y, 0]);
  const opacity = useTransform(p, [0, 1], [0, 1]);
  return (
    <motion.div ref={ref} className={className} style={reduce ? AT_REST : { x: tx, y: ty, opacity }}>
      {children}
    </motion.div>
  );
}

/** Headline whose words rise out of their own line, one after another, as it scrolls into view. */
function ScrubHeadline({ parts }: { parts: { text: string; className?: string }[] }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const reduce = usePrefersReducedMotion();
  const p = useScrub(ref, ["start 0.95", "start 0.55"]);
  const words = parts.flatMap((part) => part.text.split(" ").map((w) => ({ w, className: part.className })));
  return (
    <h2
      ref={ref}
      id="features-title"
      className="mt-4 font-display text-[clamp(2.1rem,4.6vw,3.6rem)] font-bold leading-[0.98] tracking-[-0.035em]"
    >
      {words.map(({ w, className }, i) => (
        <Word key={i} p={p} i={i} n={words.length} still={reduce} className={className}>
          {w}
        </Word>
      ))}
    </h2>
  );
}

function Word({
  p,
  i,
  n,
  still,
  className,
  children,
}: {
  p: MotionValue<number>;
  i: number;
  n: number;
  still: boolean;
  className?: string;
  children: string;
}) {
  const start = (i / n) * 0.65;
  const y = useTransform(p, [start, start + 0.35], ["110%", "0%"]);
  const rotate = useTransform(p, [start, start + 0.35], [6, 0]);
  return (
    // The mask leaves room for descenders; the word itself stays at full contrast.
    <span className="inline-block overflow-hidden pb-[0.12em] align-top whitespace-pre">
      <motion.span
        className={cn("inline-block origin-bottom-left", className)}
        style={still ? { y: "0%", rotate: 0 } : { y, rotate }}
      >
        {children}{" "}
      </motion.span>
    </span>
  );
}

/** Card that rises, un-tilts and settles as it scrolls in. `lag` lets a right-hand card trail its neighbor. */
function Card({ className, children, lag = 0 }: { className?: string; children: ReactNode; lag?: number }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = usePrefersReducedMotion();
  const p = useScrub(ref, ["start 1.02", `start ${0.6 - lag}`]);
  const y = useTransform(p, [0, 1], [120, 0]);
  const scale = useTransform(p, [0, 1], [0.94, 1]);
  const rotateX = useTransform(p, [0, 1], [10, 0]);
  const opacity = useTransform(p, [0, 0.5], [0, 1]);
  return (
    <motion.article
      ref={ref}
      style={
        reduce ? AT_REST : { y, scale, rotateX, opacity, transformPerspective: 1400, transformOrigin: "50% 100%" }
      }
      className={cn("flex flex-col rounded-[24px] border border-pebble bg-white p-6 sm:p-8", className)}
    >
      {children}
    </motion.article>
  );
}

function CardTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="font-display text-[clamp(1.4rem,2.2vw,1.75rem)] font-bold leading-[1.08] tracking-[-0.025em]">
      {children}
    </h3>
  );
}

function CardBody({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("mt-3 max-w-[52ch] text-[1rem] leading-relaxed text-mute", className)}>{children}</p>;
}

/** Bottom-anchored visual area so every card in a row lines up: title, text, then the visual. */
function CardVisual({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mt-8 lg:mt-auto lg:pt-8", className)}>{children}</div>;
}

/** The label every fictional sample (frame, clip, estimate) carries. */
function SampleChip({ className }: { className?: string }) {
  return (
    <span className={cn("rounded-md bg-white/90 px-1.5 py-px font-mono text-[0.625rem] leading-[1.5] text-ink", className)}>
      Sample
    </span>
  );
}

/* ---------------------------------------------------------------- Captions */

const LINE = "the one pricing lesson I wish I learned on day one".split(" ");

function CaptionsCard() {
  const [preset, setPreset] = useState<CaptionPreset>("bold-pop");
  const active = useWordTicker(LINE.length, 400);
  const frame = useRef<HTMLDivElement>(null);
  const reduce = usePrefersReducedMotion();
  const pass = useScrub(frame, ["start end", "end start"]);
  const parallax = useTransform(pass, [0, 1], ["-7%", "7%"]);

  return (
    <Card className="lg:col-span-7 lg:row-span-2">
      <CardTitle>Captions people actually read.</CardTitle>
      <CardBody>
        Word-timed captions in four presets. Change fonts, colors and placement if you like, or keep the defaults and
        move on.
      </CardBody>

      <CardVisual className="grid gap-6 sm:grid-cols-[minmax(0,220px)_minmax(0,1fr)] sm:items-start lg:grid-cols-[minmax(0,220px)_minmax(0,1fr)] xl:grid-cols-[minmax(0,270px)_minmax(0,1fr)]">
        <div className="mx-auto w-full max-w-[240px] sm:max-w-none">
          <div ref={frame} className="@container relative aspect-[9/16] overflow-hidden rounded-[18px] bg-deep">
            <motion.div className="absolute inset-x-0 -top-[8%] h-[116%]" style={reduce ? { y: "0%" } : { y: parallax }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/product/stills/tutorial.webp"
                alt=""
                loading="lazy"
                className="h-full w-full object-cover object-[47%_center]"
              />
            </motion.div>
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink/45 to-transparent" />
            <Captions preset={preset} words={LINE} active={active} />
            <SampleChip className="absolute left-3 top-3 px-2 py-0.5 text-[0.6875rem]" />
          </div>
        </div>

        <fieldset>
          <legend className="sr-only">Caption style preview</legend>
          <div className="grid gap-2">
            {CAPTION_PRESETS.map((p, i) => {
              const checked = preset === p.id;
              return (
                <ScrubIn key={p.id} x={36} y={0} from={0.98 - i * 0.03} to={0.74 - i * 0.03}>
                  <label
                    className={cn(
                      "relative flex cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3 transition-[background-color,border-color,transform] duration-100 active:scale-[0.99] has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-4 has-[:focus-visible]:outline-maroon",
                      checked ? "border-maroon bg-rose" : "border-transparent bg-paper hover:border-pebble",
                    )}
                  >
                    <input
                      type="radio"
                      name="caption-preset"
                      value={p.id}
                      checked={checked}
                      onChange={() => setPreset(p.id)}
                      className="sr-only"
                    />
                    <span className="min-w-0 flex-1">
                      <span className={cn("block text-[0.9375rem] font-semibold", checked && "text-maroon-pressed")}>
                        {p.name}
                      </span>
                      <span className="block text-[0.8125rem] leading-snug text-mute">{p.blurb}</span>
                    </span>
                    <span
                      aria-hidden="true"
                      className={cn(
                        "grid size-5 shrink-0 place-items-center rounded-full border-2",
                        checked ? "border-maroon bg-maroon text-white" : "border-mute/60",
                      )}
                    >
                      {checked && <Check className="size-3" strokeWidth={3.5} />}
                    </span>
                  </label>
                </ScrubIn>
              );
            })}
          </div>
          <ScrubIn y={14} from={0.96} to={0.8}>
            <div className="mt-4 flex flex-wrap items-center gap-1.5 text-[0.75rem]">
              <span className="mr-1 font-medium text-mute">Fine-tune:</span>
              {["Font", "Color", "Placement", "Size", "Language"].map((t) => (
                <span key={t} className="rounded-full border border-pebble bg-white px-2.5 py-1 font-medium text-ink/80">
                  {t}
                </span>
              ))}
            </div>
          </ScrubIn>
        </fieldset>
      </CardVisual>
    </Card>
  );
}

/* ------------------------------------------------------------------ Ranked */

const DIMENSIONS = [
  { name: "Opening", v: 0.92 },
  { name: "Momentum", v: 0.78 },
  { name: "Payoff", v: 0.95 },
  { name: "Clarity", v: 0.86 },
  { name: "Relevance", v: 0.8 },
  { name: "Audio and visual fit", v: 0.72 },
];

function ScoreBar({ v, i }: { v: number; i: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = usePrefersReducedMotion();
  const p = useScrub(ref, [`start ${0.96 - i * 0.025}`, `start ${0.62 - i * 0.025}`]);
  const scaleX = useTransform(p, [0, 1], [0, v]);
  return (
    <span ref={ref} className="h-1.5 overflow-hidden rounded-full bg-pebble/60" aria-hidden="true">
      <motion.span
        className="block h-full w-full origin-left rounded-full bg-maroon"
        style={reduce ? { scaleX: v } : { scaleX }}
      />
    </span>
  );
}

function RankedCard() {
  return (
    <Card className="lg:col-span-5" lag={0.06}>
      <CardTitle>Ranked, with reasons.</CardTitle>
      <CardBody>
        Every clip arrives titled and scored on 6 things, so you know what to post first and why it was picked.
      </CardBody>

      <CardVisual>
        {/*
          The panel is a size container. Normally the thumbnail sits beside the title and the scores. When the panel is
          narrower than 11rem (small phones with larger text), the scores move under the thumbnail and
          title, so every label keeps a readable line beside its bar.
        */}
        <div className="@container rounded-2xl bg-paper p-4">
          <div className="grid grid-cols-[auto_minmax(0,1fr)] grid-rows-[auto_1fr] gap-x-3 [grid-template-areas:'thumb_title'_'list_list'] sm:gap-x-4 @min-[11rem]:[grid-template-areas:'thumb_title'_'thumb_list']">
            {/* Sized in rem so the thumbnail (and its chip) grows with the text. */}
            <div className="relative w-[3.5rem] self-start overflow-hidden rounded-lg bg-deep [grid-area:thumb] sm:w-[4.75rem]">
              <LoopVideo
                src="/product/clips/podcast-clip-1"
                poster="/product/clips/podcast-clip-1.webp"
                className="block aspect-[9/16] w-full object-cover"
              />
              <SampleChip className="absolute left-1 top-1 px-1 sm:left-1.5 sm:top-1.5 sm:px-1.5" />
            </div>
            <p className="flex min-w-0 items-start justify-between gap-2 [grid-area:title]">
              <span className="line-clamp-3 text-[0.875rem] font-semibold leading-snug @min-[11rem]:line-clamp-2">
                Trust is the growth strategy nobody can copy
              </span>
              <span className="font-mono text-[0.75rem] leading-[1.6] text-maroon tabular">#1</span>
            </p>
            <ul className="mt-2.5 min-w-0 space-y-1.5 [grid-area:list]" aria-label="Score breakdown">
              {DIMENSIONS.map((d, i) => (
                <li
                  key={d.name}
                  className="grid grid-cols-[minmax(0,1fr)_minmax(2.5rem,30%)] items-center gap-x-2 text-[0.75rem] leading-tight text-mute"
                >
                  <span>{d.name}</span>
                  <ScoreBar v={d.v} i={i} />
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="mt-4 flex items-start gap-2 text-[0.8125rem] leading-snug text-mute">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          Scores are an editorial estimate from the content itself. They are not a prediction of views.
        </p>
      </CardVisual>
    </Card>
  );
}

/* ------------------------------------------------------------------ Fewer */

function Slot({ i }: { i: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = usePrefersReducedMotion();
  const filled = i < 6;
  // Filled slots pop in one after another; the skipped ones trace in last.
  const p = useScrub(ref, [`start ${0.98 - i * 0.022}`, `start ${0.8 - i * 0.022}`]);
  const scale = useTransform(p, [0, 1], [filled ? 0.55 : 0.9, 1]);
  const opacity = useTransform(p, [0, 1], [0, 1]);
  const style = reduce ? { scale: 1, opacity: 1 } : { scale, opacity };
  return filled ? (
    <motion.span
      ref={ref}
      style={style}
      className="grid aspect-[9/16] place-items-center rounded-md bg-maroon text-white"
    >
      <Check className="size-3.5" strokeWidth={3} />
    </motion.span>
  ) : (
    <motion.span ref={ref} style={style} className="aspect-[9/16] rounded-md border-2 border-dashed border-mute/40" />
  );
}

function FewerCard() {
  return (
    <Card className="lg:col-span-5" lag={0.06}>
      <CardTitle>Fewer clips beat filler.</CardTitle>
      <CardBody>Ask for 10. If only 6 moments hold up, you get 6, plus a plain reason why.</CardBody>
      <CardVisual>
        <div role="img" aria-label="Ten requested clip slots: six filled, four skipped">
          <div className="grid grid-cols-10 gap-1.5">
            {Array.from({ length: 10 }, (_, i) => (
              <Slot key={i} i={i} />
            ))}
          </div>
          <p className="mt-3 flex items-center justify-between text-[0.8125rem]">
            <span className="font-semibold text-ink">6 clips ready</span>
            <span className="text-mute">4 skipped: no clear payoff</span>
          </p>
        </div>
      </CardVisual>
    </Card>
  );
}

/* ---------------------------------------------------------------- Framing */

/*
 * One real 16:9 sample frame drives both views, so the output is always exactly what sits inside the crop
 * window. The speaker sways a little (a still frame cannot move on its own), the crop follows her face on a
 * smoothed path, and as the card scrolls in the crop glides from a plain centered crop onto the face.
 * Every position below is a percentage of the frame.
 */
const FRAME_SRC = "/product/stills/interview.webp";
/** 32 x 18 copy of the frame, painted underneath so the area shows the person, never a blank box, while it loads. */
const FRAME_LQIP =
  "data:image/webp;base64,UklGRgwBAABXRUJQVlA4IAABAABwBQCdASogABIAPtFUo0uoJKMhsAgBABoJQBWAtQSmA1MK0662mvXHZiWD+ewhAseHNHBUAP6lpWOK+KZblMjhq1BJQhzHPHZatquZz3KLIqQNnm2E49IyipgYy1nR+S4hYuNFcu8dO6dAL+FFIi8UwZwxRgRd8R8OtNIdnHQ9MATquY+Tsq20QDa1JFj+E3VkcwxldRZRnu53VijyZcoCwLzt+ZruiIjgr3Yioy/UWkOqrSYhe5QUGWa71W5HWApbmEAdoF0o2odap5n8jIb+iFpjm4/stsm7uhLjDiZMVHZ14qAdGdyUGfjRh90ciB+eY8oDTLzjl+PvTCVSxSAA";
const FACE = { x: 45, y: 24.5, w: 11, h: 25 }; // the speaker's face in the sample frame
const CROP_W = (9 / 16) * (9 / 16) * 100; // a 9:16 window in a 16:9 frame covers 31.64% of its width
const ZOOM = 1.06; // headroom so the sway never reveals an edge
const SWAY = 2.2; // how far the speaker drifts either way
const SWAY_PERIOD = 7000;
const FACE_X = 50 + (FACE.x - 50) * ZOOM;
const CENTERED_LEFT = 50 - CROP_W / 2;
const FACE_LEFT = FACE_X - CROP_W / 2;
const pct = (v: number) => `${v}%`;
const FRAMING_LABEL = {
  face: "Sample interview frame. A 9:16 crop window follows her face, so the vertical output keeps her in frame.",
  fit: "Sample interview frame. Fit framing keeps the whole 16:9 frame inside the vertical output, with bars above and below.",
} as const;

/** The sample frame, swaying as one layer. `children` ride along with it (the face brackets in the source view). */
function FrameScene({ sway, children }: { sway: MotionValue<string> | string; children?: ReactNode }) {
  return (
    <motion.div
      className="absolute inset-0 bg-cover bg-center"
      style={{ scale: ZOOM, x: sway, backgroundImage: `url("${FRAME_LQIP}")` }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={FRAME_SRC}
        alt=""
        width={1280}
        height={720}
        decoding="async"
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover"
      />
      {children}
    </motion.div>
  );
}

/** Face-detection brackets around the speaker's face. */
function FaceMarker({ opacity, className }: { opacity: MotionValue<number> | number; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("absolute", className)}
      style={{
        left: pct(FACE.x - FACE.w / 2),
        top: pct(FACE.y - FACE.h / 2),
        width: pct(FACE.w),
        height: pct(FACE.h),
      }}
    >
      <motion.svg
        viewBox="0 0 10 10"
        preserveAspectRatio="none"
        className="absolute inset-0 size-full text-white/90"
        style={{ opacity }}
      >
        <path
          d="M0 3V0h3M7 0h3v3M10 7v3H7M3 10H0V7"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
      </motion.svg>
    </span>
  );
}

function FramingCard() {
  const [mode, setMode] = useState<"face" | "fit">("face");
  const face = mode === "face";
  const reduce = usePrefersReducedMotion();
  const frame = useRef<HTMLDivElement>(null);
  const inView = useInView(frame, { amount: 0.2 });

  // The speaker's drift: a slow sine, run only while the frame is on screen.
  const sway = useMotionValue(0);
  const phase = useRef(0);
  useEffect(() => {
    if (reduce || !inView) {
      if (reduce) sway.set(0);
      return;
    }
    let raf = 0;
    const start = performance.now() - phase.current;
    const tick = (now: number) => {
      phase.current = now - start;
      sway.set(Math.sin((phase.current / SWAY_PERIOD) * Math.PI * 2) * SWAY);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduce, sway]);

  // Scroll-scrubbed lock-on, and a crop path that trails the face slightly, like the app's smoothed tracking.
  const lock = useScrub(frame, ["start 0.95", "start 0.5"]);
  const follow = useSpring(sway, { stiffness: 70, damping: 16, mass: 0.6 });
  const cropLeft = useTransform([lock, follow], ([l, s]: number[]) =>
    Math.min(100 - CROP_W, Math.max(0, CENTERED_LEFT + l * (FACE_LEFT + s - CENTERED_LEFT))),
  );
  const swayX = useTransform(sway, pct);
  const cropX = useTransform(cropLeft, (v) => pct((v / CROP_W) * 100));
  const stageX = useTransform(cropLeft, (v) => pct(-v));
  const markerOpacity = useTransform(lock, [0.55, 1], [0, 1]);

  const still = {
    sway: "0%",
    cropX: pct((FACE_LEFT / CROP_W) * 100),
    stageX: pct(-FACE_LEFT),
    marker: 1,
  };
  const live = reduce ? still : { sway: swayX, cropX, stageX, marker: markerOpacity };
  const fade = "transition-opacity duration-300 ease-brand motion-reduce:transition-none";

  return (
    <Card className="lg:col-span-6">
      <CardTitle>Framing that follows the face.</CardTitle>
      <CardBody>
        Face tracking on your computer keeps people in frame as they move. Slides and screen recordings get fit
        framing. No face found? Shortzy uses a centered crop and tells you.
      </CardBody>

      <CardVisual>
        <div className="rounded-2xl bg-paper p-4">
          <div role="group" aria-label="Framing mode" className="mb-4 inline-flex rounded-xl bg-white/70 p-1">
            {(
              [
                { id: "face", label: "Face tracking", Icon: ScanFace },
                { id: "fit", label: "Fit for slides", Icon: Presentation },
              ] as const
            ).map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                aria-pressed={mode === id}
                onClick={() => setMode(id)}
                className={cn(
                  "relative flex min-h-11 items-center gap-1.5 rounded-lg px-3 text-[0.8125rem] font-semibold transition-[color,transform] duration-100 active:scale-[0.97]",
                  mode === id ? "text-maroon" : "text-mute hover:text-ink",
                )}
              >
                {mode === id && (
                  <motion.span
                    layoutId="framing-pill"
                    transition={{ type: "spring", bounce: 0, visualDuration: 0.3 }}
                    aria-hidden="true"
                    className="absolute inset-0 rounded-lg bg-white shadow-[0_1px_0_rgba(41,38,40,0.08)]"
                  />
                )}
                <Icon className="relative size-4" aria-hidden="true" /> <span className="relative">{label}</span>
              </button>
            ))}
          </div>

          <div
            role="img"
            aria-label={FRAMING_LABEL[mode]}
            className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4"
          >
            <ScrubIn y={20}>
              <div ref={frame} className="relative aspect-video overflow-hidden rounded-lg bg-deep">
                <FrameScene sway={live.sway}>
                  <FaceMarker opacity={live.marker} className={cn(fade, face ? "opacity-100" : "opacity-0")} />
                </FrameScene>
                {/* Face tracking: the 9:16 window, everything outside it dimmed. */}
                <motion.div
                  className={cn("absolute inset-y-0 left-0", fade, face ? "opacity-100" : "opacity-0")}
                  style={{ width: pct(CROP_W), x: live.cropX }}
                >
                  <div className="absolute inset-0 rounded-[3px] border-[3px] border-maroon shadow-[0_0_0_999px_rgba(41,38,40,0.5)]" />
                  <span className="absolute -top-px left-1/2 -translate-x-1/2 rounded-b-md bg-maroon px-1.5 py-px font-mono text-[0.625rem] text-white">
                    9:16
                  </span>
                </motion.div>
                {/* Fit: the whole frame is kept. */}
                <div
                  className={cn(
                    "absolute inset-0 rounded-lg border-[3px] border-maroon",
                    fade,
                    face ? "opacity-0" : "opacity-100",
                  )}
                />
                <SampleChip className="absolute right-2 top-2" />
              </div>
            </ScrubIn>
            <ScrubIn x={24} y={0} from={0.94} to={0.68} className="w-[64px] sm:w-[84px]">
              <div className="relative aspect-[9/16] overflow-hidden rounded-md bg-deep ring-1 ring-pebble">
                {/* Face tracking output: exactly what is inside the crop window. */}
                <div className={cn("absolute inset-0", fade, face ? "opacity-100" : "opacity-0")}>
                  <motion.div
                    className="absolute inset-y-0 left-0"
                    style={{ width: pct(10000 / CROP_W), x: live.stageX }}
                  >
                    <FrameScene sway={live.sway} />
                  </motion.div>
                </div>
                {/* Fit output: the whole frame, letterboxed. */}
                <div
                  className={cn(
                    "absolute inset-x-0 top-1/2 aspect-video -translate-y-1/2 overflow-hidden",
                    fade,
                    face ? "opacity-0" : "opacity-100",
                  )}
                >
                  <FrameScene sway={live.sway} />
                </div>
              </div>
              <p className="mt-1.5 text-center font-mono text-[0.625rem] text-mute">Output</p>
            </ScrubIn>
          </div>
        </div>
      </CardVisual>
    </Card>
  );
}

/* ------------------------------------------------------------------- Cost */

/*
 * A coded copy of the app's estimate step (its own tokens and Inter), at a readable size. The figures are
 * the app's 24-minute sample on Qwen 3.8 Omni Flash, so the model always sits next to the price.
 */
const ESTIMATE = {
  provider: "Qwen",
  model: "Qwen 3.8 Omni Flash",
  logo: "/brand/providers/qwen.png",
  from: "$0.03",
  to: "$0.06",
  recap: [
    { value: "24:00", label: "Selected video" },
    { value: "Up to 6", label: "Finished shorts" },
    { value: "On your computer", label: "Editing and export" },
  ],
} as const;

/*
 * The frame around the panel is a size container, so the panel adapts to its own width rather than the
 * viewport (it also reflows with larger text):
 *  - header: logo, model and Sample chip on one line from 21rem; below that the model drops under them;
 *  - recap: value over label, stacked, below 16rem; label and value on one line from 16rem; the app's three
 *    columns from 24rem.
 */
const RECAP_ROW = "@min-[16rem]:flex-row @min-[16rem]:items-baseline @min-[16rem]:justify-between @min-[16rem]:gap-3";
const RECAP_COLS = "@min-[24rem]:flex-col-reverse @min-[24rem]:items-start @min-[24rem]:justify-end @min-[24rem]:gap-0.5";

function EstimatePanel() {
  return (
    <>
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-2 [grid-template-areas:'logo_chip'_'model_model'] @min-[21rem]:grid-cols-[auto_minmax(0,1fr)_auto] @min-[21rem]:[grid-template-areas:'logo_model_chip']">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={ESTIMATE.logo}
          alt=""
          width={28}
          height={28}
          loading="lazy"
          className="size-7 object-contain [grid-area:logo]"
        />
        <p className="min-w-0 text-[0.75rem] font-semibold leading-snug tracking-[0.035em] text-[#69656b] [grid-area:model]">
          {ESTIMATE.provider} · {ESTIMATE.model}
        </p>
        <SampleChip className="justify-self-end bg-[#f7f6f5] ring-1 ring-[#e8e6e8] [grid-area:chip]" />
      </div>

      <div className="mt-4 rounded-xl bg-[#f7f6f5] px-4 py-4 sm:px-5 sm:py-5">
        <p className="text-[0.8125rem] leading-5 text-[#69656b]">Estimated AI cost for your selected video</p>
        {/* Sized to the panel; if even the smallest size cannot fit, it wraps after "to", never inside an amount. */}
        <p className="mt-1.5 flex flex-wrap items-baseline gap-x-1.5">
          <span className="text-[clamp(1.375rem,9cqw,2.125rem)] font-[650] leading-tight tracking-[-0.025em] tabular-nums">
            <span className="whitespace-nowrap">{ESTIMATE.from} to</span> <span className="whitespace-nowrap">{ESTIMATE.to}</span>
          </span>
          <span className="text-[0.8125rem] text-[#69656b]">USD</span>
        </p>
      </div>

      <dl className="mt-4 grid gap-3 border-b border-[#e8e6e8] pb-4 @min-[16rem]:gap-2 @min-[24rem]:grid-cols-3 @min-[24rem]:gap-4">
        {ESTIMATE.recap.map((r) => (
          <div key={r.label} className={cn("flex flex-col-reverse gap-0.5", RECAP_ROW, RECAP_COLS)}>
            <dt className="text-[0.75rem] leading-normal text-[#69656b]">{r.label}</dt>
            <dd className="text-[0.875rem] font-[550] leading-snug @min-[16rem]:text-right @min-[24rem]:text-left">
              {r.value}
            </dd>
          </div>
        ))}
      </dl>

      <p className="mt-4 text-[0.8125rem] leading-relaxed text-[#69656b]">
        Your provider bills the AI usage; actual cost may vary.
      </p>
    </>
  );
}

function CostCard() {
  const frame = useRef<HTMLDivElement>(null);
  const reduce = usePrefersReducedMotion();
  const p = useScrub(frame, ["start 1", "start 0.55"]);
  const scale = useTransform(p, [0, 1], [1.12, 1]);
  const y = useTransform(p, [0, 1], ["6%", "0%"]);

  return (
    <Card className="lg:col-span-6" lag={0.06}>
      <CardTitle>Know the cost before you click.</CardTitle>
      <CardBody>
        Shortzy works out your AI cost from the video&apos;s length and your model, and shows it as a range. Checking
        it costs nothing, and nothing runs until you press Find my clips.
      </CardBody>

      <CardVisual>
        <figure>
          <div ref={frame} className="@container overflow-hidden rounded-2xl border border-pebble bg-white">
            <motion.div
              style={reduce ? { scale: 1, y: "0%" } : { scale, y }}
              className={cn(appFont.className, "origin-top p-4 text-[#252327] antialiased sm:p-6")}
            >
              <EstimatePanel />
            </motion.div>
          </div>
          <figcaption className="mt-3 text-[0.75rem] leading-snug text-mute">
            Sample estimate from the app. Your cost depends on the video&apos;s length and your model, and your
            provider&apos;s bill is final.
          </figcaption>
        </figure>
      </CardVisual>
    </Card>
  );
}

export function Features() {
  return (
    <section id="features" aria-labelledby="features-title" className="py-24 sm:py-32">
      <Container>
        <div className="max-w-[760px]">
          <ScrubIn y={16} from={1} to={0.8}>
            <Eyebrow>What&apos;s inside</Eyebrow>
          </ScrubIn>
          <ScrubHeadline
            parts={[{ text: "It makes the tedious calls." }, { text: "You make the final ones.", className: "text-maroon" }]}
          />
          <ScrubIn y={20} from={0.96} to={0.7}>
            <p className="mt-5 max-w-[56ch] text-[1.0625rem] leading-relaxed text-mute sm:text-[1.125rem]">
              Every pick comes with its reasoning, and every setting can be changed. Here&apos;s what you get.
            </p>
          </ScrubIn>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5">
          <CaptionsCard />
          <RankedCard />
          <FewerCard />
          <FramingCard />
          <CostCard />
        </div>
      </Container>
    </section>
  );
}
