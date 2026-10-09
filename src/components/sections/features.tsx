"use client";

import { useRef, useState, type ReactNode } from "react";
import { motion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { Check, Info, ScanFace, Presentation } from "lucide-react";
import { Container, Eyebrow } from "@/components/ui/container";
import { Captions, CAPTION_PRESETS, type CaptionPreset } from "@/components/mockups/captions";
import { LoopVideo } from "@/components/mockups/loop-video";
import { useWordTicker } from "@/hooks/use-word-ticker";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
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

/** Card that rises, un-tilts and settles as it scrolls in. `lag` lets a right-hand card trail its neighbour. */
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
        Word-timed captions in four presets. Change fonts, colours and placement if you like, or keep the defaults and
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
            <span className="absolute left-3 top-3 rounded-md bg-white/90 px-2 py-0.5 font-mono text-[0.6875rem] text-ink">
              Preview
            </span>
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
              {["Font", "Colour", "Placement", "Size", "Language"].map((t) => (
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
        Every clip arrives titled and scored on six things, so you know what to post first and why it was picked.
      </CardBody>

      <CardVisual>
        <div className="flex gap-4 rounded-2xl bg-paper p-4">
          <div className="relative w-[76px] shrink-0 self-start overflow-hidden rounded-lg bg-deep">
            <LoopVideo
              src="/product/clips/podcast-clip-1"
              poster="/product/clips/podcast-clip-1.webp"
              className="block aspect-[9/16] w-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="flex items-baseline justify-between gap-2">
              <span className="truncate text-[0.875rem] font-semibold">Trust is the growth strategy nobody can copy</span>
              <span className="font-mono text-[0.75rem] text-maroon tabular">#1</span>
            </p>
            <ul className="mt-2.5 space-y-1.5" aria-label="Score breakdown">
              {DIMENSIONS.map((d, i) => (
                <li
                  key={d.name}
                  className="grid grid-cols-[minmax(0,1fr)_88px] items-center gap-2 text-[0.75rem] text-mute"
                >
                  <span className="truncate">{d.name}</span>
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

function FramingCard() {
  const [mode, setMode] = useState<"face" | "fit">("face");
  const src = mode === "face" ? "/product/stills/interview.webp" : "/product/screens/library-16x9.webp";

  return (
    <Card className="lg:col-span-6">
      <CardTitle>Framing that follows the speaker.</CardTitle>
      <CardBody>
        Talking heads stay in frame as they move. Slides and screen recordings get fit framing so nothing important is
        cut off. If no face is found, Shortzy tells you it used a centred crop.
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

          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
            <ScrubIn y={20}>
              <div className="relative aspect-video overflow-hidden rounded-lg bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  key={mode}
                  src={src}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover motion-safe:animate-[fade-in_400ms_ease-out]"
                />
                {mode === "face" ? (
                  <div className="absolute inset-y-0 left-[48%] w-[31.6%] -translate-x-1/2 motion-safe:animate-[track_5s_ease-in-out_infinite]">
                    <div className="absolute inset-0 rounded-[3px] border-[3px] border-maroon shadow-[0_0_0_999px_rgba(41,38,40,0.45)]" />
                    <span className="absolute -top-px left-1/2 -translate-x-1/2 rounded-b-md bg-maroon px-1.5 py-px font-mono text-[0.625rem] text-white">
                      9:16
                    </span>
                  </div>
                ) : (
                  <div className="absolute inset-0 rounded-[3px] border-[3px] border-maroon" />
                )}
              </div>
            </ScrubIn>
            <ScrubIn x={24} y={0} from={0.94} to={0.68} className="w-[64px] sm:w-[84px]">
              <div className="relative aspect-[9/16] overflow-hidden rounded-md bg-deep ring-1 ring-pebble">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  key={mode}
                  src={src}
                  alt=""
                  loading="lazy"
                  className={cn(
                    "absolute motion-safe:animate-[fade-in_400ms_ease-out]",
                    mode === "face"
                      ? "inset-0 h-full w-full object-cover object-[48%_center]"
                      : "inset-x-0 top-1/2 aspect-video w-full -translate-y-1/2 object-cover",
                  )}
                />
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
        Shortzy estimates your AI cost from the video length and the model you picked, and shows it as a range.
        Checking an estimate is free. Nothing runs until you start it.
      </CardBody>

      <CardVisual>
        <figure>
          <div ref={frame} className="overflow-hidden rounded-2xl border border-pebble bg-white">
            <motion.img
              src="/product/screens/estimate-card.webp"
              alt="Shortzy cost estimate step: estimated AI cost for the selected video, shown as a range before you continue"
              width={800}
              height={480}
              loading="lazy"
              style={reduce ? { scale: 1, y: "0%" } : { scale, y }}
              className="block h-auto w-full origin-top"
            />
          </div>
          <figcaption className="mt-3 text-[0.75rem] leading-snug text-mute">
            Sample estimate from the app for a 24-minute video. Your cost depends on the video&apos;s length and the
            model you choose, and your provider&apos;s bill is final.
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
