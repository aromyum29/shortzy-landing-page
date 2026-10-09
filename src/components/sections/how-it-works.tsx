"use client";

import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { Check, Download, Link2 } from "lucide-react";
import { Container, Eyebrow } from "@/components/ui/container";
import { Mascot, type MascotPose } from "@/components/brand/mascot";
import { CLIPS, SEGMENTS, waveform } from "@/components/mockups/app-window";
import { ClipThumb } from "@/components/mockups/phone";
import { useMediaQuery } from "@/hooks/use-media-query";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { cn } from "@/lib/utils";

const STEPS: { title: string; body: string; pose: MascotPose; status: string }[] = [
  {
    title: "Add a video",
    body: "Paste a YouTube link or drop in a file from your computer. Podcasts, interviews and tutorials work best.",
    pose: "welcome",
    status: "Link added",
  },
  {
    title: "Say what you want",
    body: "Pick 1 to 10 clips, a length and a caption style. Add a topic if you're after something specific. You see the estimated AI cost before anything runs.",
    pose: "welcome",
    status: "Estimate ready",
  },
  {
    title: "Shortzy finds the moments",
    body: "Your AI reads the video and looks for a clear hook and a complete payoff. If only six moments hold up, you get six, not filler.",
    pose: "thinking",
    status: "Finding moments",
  },
  {
    title: "Your computer does the editing",
    body: "Each moment is trimmed, reframed to 9:16 and captioned on your computer. Your original file is never changed.",
    pose: "clipping",
    status: "Editing on your computer",
  },
  {
    title: "Review and export",
    body: "Clips arrive titled and ranked, with the reasons they were picked. Download one MP4 or the whole set as a ZIP.",
    pose: "celebration",
    status: "6 clips ready",
  },
];

/** Progress boundaries for each step (5 steps). */
const BOUNDS = [0, 0.18, 0.36, 0.58, 0.8, 1];
const SCAN: [number, number] = [0.38, 0.56];

type Layout = {
  aspect: string;
  /** Hide the option chips once scanning starts, to free room on small screens. */
  chipsFadeOut: boolean;
  track: { top: number; h: number; left: number; w: number };
  slot: (rank: number) => { left: number; top: number; w: number; h: number };
};

const DESKTOP: Layout = {
  aspect: "16 / 10",
  chipsFadeOut: false,
  track: { top: 17, h: 11, left: 4, w: 92 },
  slot: (r) => {
    const h = 40;
    const w = h * (10 / 16) * (9 / 16);
    const gap = (92 - 6 * w) / 5;
    return { left: 4 + r * (w + gap), top: 53, w, h };
  },
};

const MOBILE: Layout = {
  aspect: "4 / 5",
  chipsFadeOut: true,
  track: { top: 14, h: 9, left: 5, w: 90 },
  slot: (r) => {
    const h = 29;
    const w = h * (5 / 4) * (9 / 16);
    const gap = 4;
    const start = (100 - (3 * w + 2 * gap)) / 2;
    return { left: start + (r % 3) * (w + gap), top: 34 + Math.floor(r / 3) * (h + 3), w, h };
  },
};

function useFade(p: MotionValue<number>, inAt: [number, number], outAt?: [number, number]) {
  return useTransform(
    p,
    outAt ? [inAt[0], inAt[1], outAt[0], outAt[1]] : [inAt[0], inAt[1]],
    outAt ? [0, 1, 1, 0] : [0, 1],
  );
}

function MorphClip({ p, index, layout }: { p: MotionValue<number>; index: number; layout: Layout }) {
  const seg = SEGMENTS[index];
  const rank = seg.rank - 1;
  const clip = CLIPS[rank];
  const { track } = layout;
  const from = { left: track.left + seg.at * track.w, top: track.top, w: seg.w * track.w, h: track.h };
  const to = layout.slot(rank);

  const hitAt = SCAN[0] + seg.at * (SCAN[1] - SCAN[0]);
  const a = 0.58 + rank * 0.022;
  const b = a + 0.12;

  const left = useTransform(p, [a, b], [from.left, to.left]);
  const top = useTransform(p, [a, b], [from.top, to.top]);
  const width = useTransform(p, [a, b], [from.w, to.w]);
  const height = useTransform(p, [a, b], [from.h, to.h]);
  const radius = useTransform(p, [a, b], [6, 12]);
  const opacity = useTransform(p, [hitAt, hitAt + 0.012], [0, 1]);
  const thumb = useTransform(p, [a + 0.05, b], [0, 1]);
  const meta = useTransform(p, [0.8, 0.86], [0, 1]);

  return (
    <motion.div
      className="absolute overflow-hidden border-2 border-maroon bg-oat/80"
      style={{
        left: useMotionTemplate`${left}%`,
        top: useMotionTemplate`${top}%`,
        width: useMotionTemplate`${width}%`,
        height: useMotionTemplate`${height}%`,
        borderRadius: radius,
        opacity,
      }}
    >
      <motion.div className="absolute inset-0" style={{ opacity: thumb }}>
        <ClipThumb scene={clip.scene} words={clip.words} active={1} className="h-full rounded-none" />
      </motion.div>
      <motion.div style={{ opacity: meta }} className="@container absolute inset-0">
        <span className="absolute left-[6%] top-[4%] rounded-[1.5cqw] bg-white px-[4cqw] py-[1.5cqw] font-mono text-[9cqw] font-medium leading-none text-ink">
          #{rank + 1}
        </span>
        <span className="absolute inset-x-[6%] bottom-[4%] truncate rounded-full bg-white px-[4cqw] py-[2cqw] text-center text-[8cqw] font-semibold leading-none text-maroon-pressed">
          {clip.reason}
        </span>
      </motion.div>
    </motion.div>
  );
}

function Stage({ p, step, layout }: { p: MotionValue<number>; step: number; layout: Layout }) {
  const bars = waveform(96, 2.1);
  const { track } = layout;
  const importBar = useTransform(p, [0, 0.1], [0.04, 1]);
  const dropOpacity = useTransform(p, [0.33, 0.37], [1, 0]);
  const scan = useTransform(p, SCAN, [track.left, track.left + track.w]);
  const playhead = useFade(p, [SCAN[0] - 0.01, SCAN[0]], [SCAN[1], SCAN[1] + 0.01]);
  const zip = useFade(p, [0.82, 0.88]);
  // Scroll-linked opacity can run as a native animation created once, so pick
  // between two motion values instead of changing one transform's output.
  const chipsFade = useTransform(p, [0.37, 0.4], [1, 0]);
  const chipsOpacity = layout.chipsFadeOut ? chipsFade : 1;
  const chips = [
    { label: "8 clips", at: 0.2 },
    { label: "30 to 60 s", at: 0.225 },
    { label: "9:16", at: 0.25 },
    { label: "Bold pop captions", at: 0.275 },
    { label: "Topic: pricing", at: 0.3 },
  ];

  return (
    <div
      className="relative w-full overflow-hidden rounded-[24px] border border-pebble bg-white"
      style={{ aspectRatio: layout.aspect }}
    >
      {/* Header */}
      <div className="absolute inset-x-[4%] top-[4.5%] flex items-center justify-between gap-3">
        <p className="min-w-0 truncate font-display text-[clamp(14px,1.6vw,20px)] font-semibold tracking-[-0.01em]">
          Founders Podcast · Ep. 42
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <motion.span
            style={{ opacity: zip }}
            className="hidden items-center gap-1.5 rounded-lg border-2 border-maroon px-2.5 py-1 text-[12px] font-semibold text-maroon sm:flex"
          >
            <Download className="size-3.5" /> ZIP
          </motion.span>
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-[12px] font-semibold",
              step === 4 ? "bg-success-bg text-success" : "bg-rose text-maroon-pressed",
            )}
          >
            {STEPS[step].status}
          </span>
        </div>
      </div>

      {/* Timeline */}
      <div
        className="absolute"
        style={{ top: `${track.top}%`, height: `${track.h}%`, left: `${track.left}%`, width: `${track.w}%` }}
      >
        <motion.div className="absolute inset-0 flex origin-left items-center gap-[2px]" style={{ scaleX: importBar }}>
          {bars.map((h, i) => (
            <span key={i} className="flex-1 rounded-full bg-pebble" style={{ height: `${(h * 100).toFixed(1)}%` }} />
          ))}
        </motion.div>
      </div>
      <div
        className="tabular absolute flex justify-between font-mono text-[10px] text-mute sm:text-[11px]"
        style={{ top: `${track.top + track.h + 1.5}%`, left: `${track.left}%`, width: `${track.w}%` }}
      >
        <span>00:00</span>
        <span>29:06</span>
        <span>58:12</span>
      </div>
      <motion.div
        className="absolute w-[2px] rounded-full bg-maroon"
        style={{
          left: useMotionTemplate`${scan}%`,
          top: `${track.top - 2}%`,
          height: `${track.h + 4}%`,
          opacity: playhead,
        }}
      />

      {/* Options chips */}
      <motion.div
        className="absolute flex flex-wrap gap-1.5 sm:gap-2"
        style={{
          top: `${track.top + track.h + 7}%`,
          left: `${track.left}%`,
          right: `${track.left}%`,
          opacity: chipsOpacity,
        }}
      >
        {chips.map((c) => (
          <Chip key={c.label} p={p} at={c.at}>
            {c.label}
          </Chip>
        ))}
        <Chip p={p} at={0.325} tone="success">
          <Check className="size-3" strokeWidth={3} /> Estimate shown · you approve
        </Chip>
      </motion.div>

      {/* Import drop zone */}
      <motion.div
        style={{ opacity: dropOpacity }}
        className="absolute inset-x-[4%] bottom-[6%] top-[47%] flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-mute/50 bg-paper/60 px-4 text-center"
      >
        <p className="text-[13px] font-semibold sm:text-[15px]">Paste a YouTube link or drop a video</p>
        <div className="mt-3 flex w-full max-w-[420px] items-center gap-2 rounded-xl border border-mute bg-white p-1.5 pl-3 text-left">
          <Link2 className="size-4 shrink-0 text-mute" />
          <span className="min-w-0 flex-1 truncate text-[12px] text-ink sm:text-[13px]">youtube.com/watch?v=founders-ep42</span>
          <span className="rounded-lg bg-maroon px-3 py-1.5 text-[12px] font-semibold text-white">Import</span>
        </div>
        <p className="mt-2 text-[12px] text-mute">or choose a file from your computer</p>
      </motion.div>

      {SEGMENTS.map((_, i) => (
        <MorphClip key={i} p={p} index={i} layout={layout} />
      ))}
    </div>
  );
}

function Chip({
  p,
  at,
  tone,
  children,
}: {
  p: MotionValue<number>;
  at: number;
  tone?: "success";
  children: React.ReactNode;
}) {
  const opacity = useTransform(p, [at, at + 0.015], [0, 1]);
  const y = useTransform(p, [at, at + 0.015], [6, 0]);
  return (
    <motion.span
      style={{ opacity, y }}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold sm:text-[12px]",
        tone === "success"
          ? "border-success/40 bg-success-bg text-success"
          : "border-maroon/30 bg-rose text-maroon-pressed",
      )}
    >
      {children}
    </motion.span>
  );
}

export function HowItWorks() {
  const ref = useRef<HTMLElement>(null);
  const reduce = usePrefersReducedMotion();
  const isDesktop = useMediaQuery("(min-width: 1024px)", true);
  const layout = isDesktop ? DESKTOP : MOBILE;

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const still = useMotionValue(1);
  const p = reduce ? still : scrollYProgress;

  const [scrollStep, setStep] = useState(0);
  const step = reduce ? STEPS.length - 1 : scrollStep;
  useMotionValueEvent(p, "change", (v) => {
    const i = Math.min(STEPS.length - 1, Math.max(0, BOUNDS.findLastIndex((b) => v >= b)));
    setStep((s) => (s === i ? s : i));
  });

  const goTo = (i: number) => {
    const el = ref.current;
    if (!el || reduce) return;
    const range = el.offsetHeight - window.innerHeight;
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + range * (BOUNDS[i] + 0.04), behavior: "smooth" });
  };

  return (
    <section
      id="how-it-works"
      ref={ref}
      aria-labelledby="how-title"
      className={cn("relative bg-paper", reduce ? "py-24" : "h-[460vh] lg:h-[440vh]")}
    >
      <div className={cn(!reduce && "sticky top-[72px] flex h-[calc(100svh-72px)] items-center overflow-hidden")}>
        <Container className="grid items-center gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,8fr)] lg:gap-14">
          <div className="lg:order-1">
            <Eyebrow>How it works</Eyebrow>
            <h2
              id="how-title"
              className="mt-3 font-display text-[clamp(1.6rem,3.4vw,2.75rem)] font-bold leading-[1.02] tracking-[-0.03em] lg:max-w-[18ch]"
            >
              Here&apos;s what happens after you paste a link.
            </h2>

            <ol className={cn("mt-5 space-y-1 lg:mt-8", !reduce && "sr-only lg:not-sr-only")}>
              {STEPS.map((s, i) => {
                const active = reduce || i === step;
                return (
                  <li key={s.title}>
                    <button
                      type="button"
                      onClick={() => goTo(i)}
                      aria-current={!reduce && i === step ? "step" : undefined}
                      className={cn(
                        "group grid w-full grid-cols-[36px_1fr] gap-x-2 rounded-xl px-3 py-2.5 text-left transition-colors",
                        active ? "bg-white" : "hover:bg-white/60",
                      )}
                    >
                      <span
                        className={cn(
                          "pt-0.5 font-mono text-[13px] tabular",
                          active ? "text-maroon" : "text-mute",
                        )}
                      >
                        0{i + 1}
                      </span>
                      <span>
                        <span
                          className={cn(
                            "block text-[17px] font-semibold leading-snug",
                            active ? "text-ink" : "text-ink/60",
                          )}
                        >
                          {s.title}
                        </span>
                        <span
                          className={cn(
                            "grid transition-[grid-template-rows,opacity] duration-300",
                            active ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                          )}
                        >
                          <span className="overflow-hidden">
                            <span className="block pt-1 text-[15px] leading-relaxed text-mute">{s.body}</span>
                          </span>
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>

            <div className="relative mt-6 hidden h-[150px] lg:block" aria-hidden="true">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={STEPS[step].pose}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="absolute left-0 top-0"
                >
                  <Mascot pose={STEPS[step].pose} size={150} />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div className="lg:order-2">
            <div className={cn("mx-auto w-full lg:max-w-none", !reduce && "max-w-[min(100%,calc((100svh-370px)*0.8))]")}>
              {/* Remount when the motion preference resolves: scroll-linked values bind to their source once. */}
              <Stage key={reduce ? "static" : "scroll"} p={p} step={step} layout={layout} />
            </div>

            {/* Mobile / tablet step readout (visual only; the full list above is read by screen readers) */}
            <div className={cn("mt-5 lg:hidden", reduce && "hidden")} aria-hidden="true">
              <div className="flex items-center gap-2">
                {STEPS.map((s, i) => (
                  <span
                    key={s.title}
                    className={cn("h-1.5 flex-1 rounded-full", i <= step ? "bg-maroon" : "bg-pebble")}
                  />
                ))}
              </div>
              <div className="mt-4 flex items-start gap-3">
                <Mascot pose={STEPS[step].pose} size={64} className="shrink-0" />
                <div className="min-w-0">
                  <p className="font-mono text-[12px] text-maroon">Step 0{step + 1} of 05</p>
                  <p className="mt-0.5 text-[18px] font-semibold leading-snug">{STEPS[step].title}</p>
                  <p className="mt-1 text-[14px] leading-relaxed text-mute">{STEPS[step].body}</p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>

    </section>
  );
}
