"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { ArrowRight, Check, Cloud, FileVideo, FolderOpen, Laptop, Link2 } from "lucide-react";
import { Container, Eyebrow } from "@/components/ui/container";
import { Mascot, type MascotPose } from "@/components/brand/mascot";
import { CLIPS } from "@/components/mockups/app-demo/data";
import { useElementWidth } from "@/hooks/use-element-width";
import { useMediaQuery } from "@/hooks/use-media-query";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { cn } from "@/lib/utils";

/*
 * How it works: a pinned, scroll-driven walkthrough of what Shortzy does under
 * the hood. No app screens here (the hero shows those): one clean diagram whose
 * pieces move from step to step. The long video sits on a timeline; moments
 * light up as they are scored, lift out into 9:16 shorts, then line up ranked.
 * Reduced motion and short windows get the same diagram, unpinned, with the
 * steps as buttons.
 */

type Step = { title: string; body: string; behind: string; pose: MascotPose; where: "local" | "ai" };

const STEPS: Step[] = [
  {
    title: "Add a video",
    body: "Paste a YouTube link or drop in your own file.",
    behind: "Shortzy saves a working copy in your workspace folder. Your original is never touched.",
    pose: "welcome",
    where: "local",
  },
  {
    title: "Pick what you want, see the cost",
    body: "Choose 1 to 10 clips and a caption style. See the estimated AI cost before anything runs.",
    behind: "The estimate comes from the video's length, your model and your choices. No paid AI call yet.",
    pose: "welcome",
    where: "local",
  },
  {
    title: "Shortzy and your AI find the moments",
    body: "Your AI reads a prepared copy of the audio and video. Shortzy's virality score rates every moment.",
    behind: "Scored on opening, momentum, payoff, clarity, relevance and audio and visual fit. If only 6 hold up, you get 6.",
    pose: "thinking",
    where: "ai",
  },
  {
    title: "Shortzy does the editing",
    body: "Using its own virality score logic, Shortzy cuts the strongest moments, reframes them to 9:16 and captions them.",
    behind: "All of it runs in Shortzy on your Mac or Windows PC, with on-device face tracking to keep people in frame.",
    pose: "clipping",
    where: "local",
  },
  {
    title: "Review and export",
    body: "Clips arrive ranked by score, with the reasons each was picked. Export one MP4 or the whole set as a ZIP.",
    behind: "The score is an AI estimate to help you choose, not a views promise. Earlier sets stay in your folder.",
    pose: "celebration",
    where: "local",
  },
];

/** Scroll progress where each step starts (5 steps). */
const BOUNDS = [0, 0.2, 0.4, 0.6, 0.8, 1];

const SPRING = { type: "spring", bounce: 0, visualDuration: 0.55 } as const;
const QUICK = { duration: 0.22, ease: [0.2, 0.8, 0.2, 1] } as const;

/** The six moments on the sample timeline, in time order. `rank` points into CLIPS (best first). */
const MOMENTS = [
  { at: 0.07, w: 0.05, rank: 2 },
  { at: 0.21, w: 0.06, rank: 0 },
  { at: 0.36, w: 0.045, rank: 5 },
  { at: 0.52, w: 0.055, rank: 1 },
  { at: 0.67, w: 0.05, rank: 3 },
  { at: 0.83, w: 0.045, rank: 4 },
];

/** A fixed, rounded waveform so server and client render the same bars. */
const BARS = Array.from({ length: 84 }, (_, i) =>
  (0.22 + 0.68 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.37 + 1))).toFixed(2),
);

const CRITERIA = ["Opening", "Momentum", "Payoff", "Clarity", "Relevance", "Audio and visual fit"];
const CRITERIA_FILL = [0.92, 0.78, 0.95, 0.86, 0.7, 0.82];

type Box = { left: number; top: number; w: number; h: number };
type Layout = {
  aspect: number;
  track: Box;
  /** Where the step-specific panel sits, in % of the stage. */
  panel: { top: number; bottom: number };
  /** Where the chips row sits in steps 4 and 5. */
  chips: number;
  slot: (i: number) => Box;
};

const WIDE: Layout = {
  aspect: 16 / 10,
  track: { left: 5, top: 21, w: 90, h: 13 },
  panel: { top: 43, bottom: 5 },
  chips: 44,
  slot: (i) => {
    const h = 36;
    const w = (h * (9 / 16)) / (16 / 10);
    const gap = 2.6;
    const start = (100 - (6 * w + 5 * gap)) / 2;
    return { left: start + i * (w + gap), top: 56, w, h };
  },
};

const COMPACT: Layout = {
  aspect: 4 / 5,
  track: { left: 6, top: 19, w: 88, h: 10 },
  panel: { top: 36, bottom: 4 },
  chips: 37,
  slot: (i) => {
    const h = 23;
    const w = (h * (9 / 16)) / (4 / 5);
    const gap = 4;
    const start = (100 - (3 * w + 2 * gap)) / 2;
    return { left: start + (i % 3) * (w + gap), top: 45 + Math.floor(i / 3) * (h + 2.5), w, h };
  },
};

const pct = (v: number) => `${v}%`;

/* -------------------------------------------------------------------- Pieces */

function Chip({ children, tone = "plain", className }: { children: React.ReactNode; tone?: "plain" | "maroon" | "oat"; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[0.6875rem] font-semibold leading-none @[34rem]:text-[0.75rem]",
        tone === "maroon" && "border-maroon bg-maroon text-white",
        tone === "oat" && "border-oat bg-oat text-ink",
        tone === "plain" && "border-pebble bg-white text-ink",
        className,
      )}
    >
      {children}
    </span>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("font-mono text-[0.625rem] uppercase tracking-[0.12em] text-mute @[34rem]:text-[0.6875rem]", className)}>
      {children}
    </span>
  );
}

/** Step 1: the video comes in from a link or a file and lands in your folder. */
function ImportPanel() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 @[34rem]:flex-row @[34rem]:gap-6">
      <div className="flex flex-row gap-2 @[34rem]:flex-col">
        <Chip>
          <Link2 className="size-3.5 text-maroon" aria-hidden="true" /> YouTube link
        </Chip>
        <Chip>
          <FileVideo className="size-3.5 text-maroon" aria-hidden="true" /> Your own file
        </Chip>
      </div>
      <ArrowRight className="size-4 rotate-90 text-mute @[34rem]:rotate-0" aria-hidden="true" />
      <div className="rounded-2xl border border-pebble bg-white px-4 py-3">
        <p className="flex items-center gap-2 text-[0.8125rem] font-semibold">
          <FolderOpen className="size-4 text-maroon" aria-hidden="true" /> Your workspace folder
        </p>
        <ul className="mt-2 space-y-1 text-[0.75rem] text-mute">
          <li className="flex items-center gap-1.5">
            <Check className="size-3.5 text-success" strokeWidth={3} aria-hidden="true" /> Working copy saved
          </li>
          <li className="flex items-center gap-1.5">
            <Check className="size-3.5 text-success" strokeWidth={3} aria-hidden="true" /> Original never touched
          </li>
        </ul>
      </div>
    </div>
  );
}

/** Step 2: three inputs make the estimate. */
function EstimatePanel({ animate }: { animate: boolean }) {
  const inputs = ["44:48 video", "Gemini Flash 3.8", "6 clips"];
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3">
      <div className="flex flex-wrap items-center justify-center gap-1.5 @[34rem]:gap-2">
        {inputs.map((t, i) => (
          <span key={t} className="contents">
            {i > 0 && <span className="font-mono text-[0.75rem] text-mute">+</span>}
            <motion.span
              initial={animate ? { opacity: 0, y: 6 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...QUICK, delay: animate ? 0.08 * i : 0 }}
            >
              <Chip>{t}</Chip>
            </motion.span>
          </span>
        ))}
      </div>
      <span className="font-mono text-[0.75rem] text-mute">=</span>
      <motion.div
        initial={animate ? { opacity: 0, scale: 0.94 } : false}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ ...SPRING, delay: animate ? 0.3 : 0 }}
        className="rounded-2xl bg-maroon px-5 py-3 text-center text-white"
      >
        <p className="font-display text-[1.375rem] font-bold leading-none tracking-[-0.02em] @[34rem]:text-[1.75rem]">
          $0.43 to $1.33
        </p>
        <p className="mt-1 text-[0.6875rem] text-rose">Estimate · sample 44:48 video on Gemini Flash 3.8</p>
      </motion.div>
      <p className="text-center text-[0.6875rem] text-mute @[34rem]:text-[0.75rem]">
        No paid AI call yet. Your provider bills the real usage.
      </p>
    </div>
  );
}

/** Step 3: a prepared copy goes to your AI; Shortzy's virality score rates what comes back. */
function ScorePanel({ animate }: { animate: boolean }) {
  return (
    <div className="grid h-full grid-cols-1 content-center gap-3 @[34rem]:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] @[34rem]:gap-4">
      <div className="rounded-2xl border border-pebble bg-white p-3">
        <p className="flex items-center gap-2 text-[0.8125rem] font-semibold">
          <Cloud className="size-4 text-maroon" aria-hidden="true" /> Your AI
          <span className="ml-auto flex items-center gap-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/providers/gemini.png" alt="" width={16} height={16} className="size-4" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/providers/qwen.png" alt="" width={16} height={16} className="size-4" />
          </span>
        </p>
        <div className="mt-2.5 space-y-1.5 font-mono text-[0.625rem] text-mute @[34rem]:text-[0.6875rem]">
          <p className="flex items-center gap-1.5">
            <span className="text-maroon">→</span> Prepared audio and video
          </p>
          <p className="flex items-center gap-1.5">
            <span className="text-maroon">←</span> Moments and an editing plan
          </p>
        </div>
      </div>
      <div className="rounded-2xl bg-ink p-3 text-white">
        <p className="flex items-center justify-between gap-2 text-[0.8125rem] font-semibold">
          Shortzy virality score
          <span className="font-mono text-[0.625rem] font-normal uppercase tracking-[0.1em] text-white/60">AI estimate</span>
        </p>
        <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5">
          {CRITERIA.map((c, i) => (
            <li key={c} className="min-w-0">
              <span className="block truncate text-[0.625rem] text-white/75 @[34rem]:text-[0.6875rem]">{c}</span>
              <span className="mt-0.5 block h-1 overflow-hidden rounded-full bg-white/15">
                <motion.span
                  className="block h-full origin-left rounded-full bg-coral"
                  initial={animate ? { scaleX: 0 } : false}
                  animate={{ scaleX: CRITERIA_FILL[i] }}
                  transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1], delay: animate ? 0.5 + i * 0.07 : 0 }}
                />
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** One moment: a lit segment on the timeline in step 3, a 9:16 short in steps 4 and 5. */
function Moment({ index, step, layout, animate }: { index: number; step: number; layout: Layout; animate: boolean }) {
  const m = MOMENTS[index];
  const clip = CLIPS[m.rank];
  const { track } = layout;
  const onTrack: Box = { left: track.left + m.at * track.w, top: track.top, w: m.w * track.w, h: track.h };
  const box = step >= 3 ? layout.slot(step === 3 ? index : m.rank) : onTrack;
  const visible = step >= 2;
  const asShort = step >= 3;

  return (
    <motion.div
      aria-hidden="true"
      className="absolute overflow-hidden"
      initial={false}
      animate={{
        left: pct(box.left),
        top: pct(box.top),
        width: pct(box.w),
        height: pct(box.h),
        opacity: visible ? 1 : 0,
        borderRadius: asShort ? 12 : 4,
      }}
      transition={{
        ...SPRING,
        delay: animate && step === 3 ? index * 0.05 : animate && step === 4 ? m.rank * 0.04 : 0,
        opacity: { ...QUICK, delay: animate && step === 2 ? 0.25 + m.at * 0.9 : 0 },
      }}
    >
      <span className={cn("absolute inset-0 transition-colors duration-300", asShort ? "bg-ink" : "bg-maroon/85")} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={clip.poster}
        alt=""
        loading="lazy"
        decoding="async"
        className={cn("absolute inset-0 size-full object-cover transition-opacity duration-500", asShort ? "opacity-100" : "opacity-0")}
      />
      {/* Crop corners while Shortzy frames the short */}
      <span
        className={cn(
          "absolute inset-[6%] rounded-md border border-white/70 transition-opacity duration-300",
          step === 3 ? "opacity-100" : "opacity-0",
        )}
      />
      <span
        className={cn(
          "tabular absolute left-[8%] top-[5%] rounded-md bg-white px-1.5 py-0.5 font-mono text-[0.625rem] font-medium leading-none text-ink transition-opacity duration-300",
          step === 4 ? "opacity-100" : "opacity-0",
        )}
      >
        #{m.rank + 1}
      </span>
      <span
        className={cn(
          "tabular absolute inset-x-[8%] bottom-[5%] rounded-full bg-oat py-0.5 text-center font-mono text-[0.625rem] font-medium leading-none text-ink transition-opacity duration-300",
          step === 4 ? "opacity-100" : "opacity-0",
        )}
      >
        {clip.score}
      </span>
    </motion.div>
  );
}

/** The score chip floating above each lit segment in step 3. */
function ScoreFlag({ index, show, layout, animate }: { index: number; show: boolean; layout: Layout; animate: boolean }) {
  const m = MOMENTS[index];
  const { track } = layout;
  return (
    <motion.span
      aria-hidden="true"
      className="tabular absolute -translate-x-1/2 rounded-full bg-ink px-1.5 py-0.5 font-mono text-[0.625rem] font-medium leading-none text-white"
      style={{ left: pct(track.left + (m.at + m.w / 2) * track.w), top: `calc(${pct(track.top + track.h)} + 8px)` }}
      initial={false}
      animate={{ opacity: show ? 1 : 0, y: show ? 0 : -4 }}
      transition={{ ...QUICK, delay: animate && show ? 0.45 + m.at * 0.9 : 0 }}
    >
      {CLIPS[m.rank].score}
    </motion.span>
  );
}

/** The diagram for one step. */
function Engine({ step, animate }: { step: number; animate: boolean }) {
  const [ref, width] = useElementWidth<HTMLDivElement>();
  const layout = width > 0 && width < 520 ? COMPACT : WIDE;
  const { track } = layout;
  const s = STEPS[step];

  return (
    <div className="@container overflow-hidden rounded-[20px] border border-pebble bg-white sm:rounded-[24px]">
      <div ref={ref} className="relative bg-paper/60" style={{ aspectRatio: layout.aspect }}>
        {/* Header: where this step runs */}
        <div className="absolute inset-x-[5%] top-[5%] flex items-center justify-between gap-3">
          <Label>Under the hood</Label>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={s.where}
              initial={animate ? { opacity: 0, y: -4 } : false}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={QUICK}
            >
              {s.where === "ai" ? (
                <Chip tone="oat">
                  <Cloud className="size-3.5" aria-hidden="true" /> Your AI + Shortzy
                </Chip>
              ) : (
                <Chip>
                  <Laptop className="size-3.5 text-maroon" aria-hidden="true" /> On your computer
                </Chip>
              )}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* The long video */}
        <div
          className="absolute flex items-center justify-between"
          style={{ left: pct(track.left), width: pct(track.w), top: pct(track.top - 5.5) }}
          aria-hidden="true"
        >
          <Label className="normal-case tracking-normal">Sample podcast · 44:48</Label>
          <Label className="normal-case tracking-normal">{step >= 2 ? "6 moments" : "your video"}</Label>
        </div>
        <div
          aria-hidden="true"
          className="absolute overflow-hidden rounded-md bg-white ring-1 ring-pebble"
          style={{ left: pct(track.left), top: pct(track.top), width: pct(track.w), height: pct(track.h) }}
        >
          <motion.div
            className="absolute inset-0 flex origin-left items-center gap-[2px] px-1.5"
            initial={false}
            animate={{ scaleX: step === 0 && animate ? [0.04, 1] : 1 }}
            transition={{ duration: 1.2, ease: [0.2, 0.8, 0.2, 1] }}
          >
            {BARS.map((h, i) => (
              <span
                key={i}
                className={cn("flex-1 rounded-full transition-colors duration-500", step >= 2 ? "bg-pebble/70" : "bg-mute/45")}
                style={{ height: `${Number(h) * 70}%` }}
              />
            ))}
          </motion.div>
          {/* The read head sweeping the video in step 3 */}
          {step === 2 && animate && (
            <motion.span
              className="absolute inset-y-0 w-[2px] bg-maroon"
              initial={{ left: "0%" }}
              animate={{ left: "100%" }}
              transition={{ duration: 1.1, ease: "linear", delay: 0.2 }}
            />
          )}
        </div>

        {MOMENTS.map((_, i) => (
          <ScoreFlag key={i} index={i} show={step === 2} layout={layout} animate={animate} />
        ))}
        {MOMENTS.map((_, i) => (
          <Moment key={i} index={i} step={step} layout={layout} animate={animate} />
        ))}

        {/* Step panels */}
        <div
          className="absolute inset-x-[5%]"
          style={{ top: pct(layout.panel.top), bottom: pct(layout.panel.bottom) }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {step <= 2 && (
              <motion.div
                key={step}
                className="h-full"
                initial={animate ? { opacity: 0, y: 10 } : false}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={QUICK}
              >
                {step === 0 && <ImportPanel />}
                {step === 1 && <EstimatePanel animate={animate} />}
                {step === 2 && <ScorePanel animate={animate} />}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Steps 4 and 5: what happens to each short */}
        <div className="absolute inset-x-[5%] flex justify-center" style={{ top: pct(layout.chips) }}>
          <AnimatePresence mode="wait" initial={false}>
            {step === 3 && (
              <motion.div
                key="edit"
                className="flex flex-wrap justify-center gap-1.5"
                initial={animate ? { opacity: 0, y: 6 } : false}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={QUICK}
              >
                {["Cut", "Reframe 9:16", "Captions"].map((t, i) => (
                  <motion.span
                    key={t}
                    initial={animate ? { opacity: 0 } : false}
                    animate={{ opacity: 1 }}
                    transition={{ ...QUICK, delay: animate ? 0.35 + i * 0.25 : 0 }}
                  >
                    <Chip>
                      <Check className="size-3.5 text-success" strokeWidth={3} aria-hidden="true" /> {t}
                    </Chip>
                  </motion.span>
                ))}
              </motion.div>
            )}
            {step === 4 && (
              <motion.div
                key="export"
                className="flex flex-wrap justify-center gap-1.5"
                initial={animate ? { opacity: 0, y: 6 } : false}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={QUICK}
              >
                <Chip tone="maroon">Ranked by virality score</Chip>
                <Chip>
                  <FolderOpen className="size-3.5 text-maroon" aria-hidden="true" /> MP4 · ZIP to your folder
                </Chip>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* What is happening, in one line */}
      <div className="border-t border-pebble/70 px-4 py-3 sm:px-5 sm:py-3.5" aria-hidden="true">
        <div className="grid">
          {STEPS.map((o, i) => (
            <p
              key={o.title}
              className={cn(
                "col-start-1 row-start-1 text-[0.8125rem] leading-snug text-mute transition-opacity duration-300 sm:text-[0.875rem]",
                i === step ? "opacity-100" : "opacity-0",
              )}
            >
              <span className="tabular mr-2 font-mono text-maroon">0{i + 1}</span>
              {o.behind}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------- Section */

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
    <div aria-hidden="true" className="mb-3 lg:hidden">
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
      <div className="mt-1.5 grid [@media(max-height:719px)]:hidden">
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

export function HowItWorks() {
  const trackRef = useRef<HTMLDivElement>(null);
  const reduce = usePrefersReducedMotion();
  const isDesktop = useMediaQuery("(min-width: 1024px)", true);
  // Pin only where the stage fits the screen; otherwise the steps become buttons.
  const tall = useMediaQuery(isDesktop ? "(min-height: 620px)" : "(min-height: 640px)", true);
  const pinned = !reduce && tall;

  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });
  const [scrollStep, setScrollStep] = useState(0);
  const [picked, setPicked] = useState(0);
  const step = pinned ? scrollStep : picked;
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const i = Math.min(STEPS.length - 1, Math.max(0, BOUNDS.findLastIndex((b) => v >= b)));
    setScrollStep((s) => (s === i ? s : i));
  });

  const goTo = (i: number) => {
    const el = trackRef.current;
    if (!el) return;
    const range = el.offsetHeight - window.innerHeight;
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + range * ((BOUNDS[i] + BOUNDS[i + 1]) / 2), behavior: "smooth" });
  };
  const choose = (i: number) => (pinned ? goTo(i) : setPicked(i));
  const buttons = !pinned || isDesktop;

  return (
    <section id="how-it-works" aria-labelledby="how-title" className="relative bg-paper">
      <Container className="pt-24 sm:pt-32">
        <Eyebrow>How it works</Eyebrow>
        <h2
          id="how-title"
          className="mt-4 text-balance font-display text-[clamp(2.1rem,4.6vw,3.6rem)] font-bold leading-[0.98] tracking-[-0.035em]"
        >
          What happens <span className="text-maroon">under the hood.</span>
        </h2>
      </Container>

      <div ref={trackRef} className={cn(pinned ? "h-[420vh] lg:h-[400vh]" : "pb-24 pt-10 sm:pb-32 sm:pt-14")}>
        <div className={cn(pinned && "sticky top-[72px] flex h-[calc(100svh-72px)] items-center overflow-hidden")}>
          <Container className="grid items-center gap-8 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-12">
            <div className={cn(pinned && "hidden lg:block")}>
              <ol className="space-y-1">
                {STEPS.map((s, i) => {
                  const active = i === step;
                  const Item = buttons ? "button" : "div";
                  return (
                    <li key={s.title}>
                      <Item
                        {...(buttons
                          ? { type: "button" as const, onClick: () => choose(i), "aria-pressed": pinned ? undefined : active }
                          : {})}
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
                          <span className={cn("block text-[1.0625rem] font-semibold leading-snug", active ? "text-ink" : "text-mute")}>
                            {s.title}
                          </span>
                          <span
                            className={cn(
                              "grid transition-[grid-template-rows,opacity] duration-300 ease-brand",
                              active ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                            )}
                          >
                            <span className="overflow-hidden">
                              <span className="block pt-1 text-[0.9375rem] leading-relaxed text-mute">{s.body}</span>
                              <span className="sr-only">Under the hood: {s.behind}</span>
                            </span>
                          </span>
                        </span>
                      </Item>
                    </li>
                  );
                })}
              </ol>
              <PoseStack pose={STEPS[step].pose} size={110} className="mt-5 hidden lg:grid" />
            </div>

            <div className="min-w-0">
              {pinned && <Readout step={step} />}
              {pinned && !isDesktop && (
                <ol className="sr-only">
                  {STEPS.map((s) => (
                    <li key={s.title}>
                      {s.title}. {s.body} Under the hood: {s.behind}
                    </li>
                  ))}
                </ol>
              )}
              <div className="mx-auto w-full max-w-[560px] lg:max-w-none [@media(max-height:820px)]:lg:max-w-[46rem]">
                <Engine step={step} animate={!reduce} />
              </div>
            </div>
          </Container>
        </div>
      </div>
    </section>
  );
}
