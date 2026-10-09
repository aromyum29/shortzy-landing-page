"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Reveal } from "@/components/ui/reveal";
import { Check, Info, ScanFace, Presentation } from "lucide-react";
import { Container, Eyebrow } from "@/components/ui/container";
import { Captions, CAPTION_PRESETS, type CaptionPreset } from "@/components/mockups/captions";
import { LoopVideo } from "@/components/mockups/loop-video";
import { useWordTicker } from "@/hooks/use-word-ticker";
import { cn } from "@/lib/utils";

function Card({ className, children, delay = 0 }: { className?: string; children: React.ReactNode; delay?: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7, delay, ease: [0.2, 0.8, 0.2, 1] }}
      className={cn("flex flex-col rounded-[24px] border border-pebble bg-white p-6 sm:p-8", className)}
    >
      {children}
    </motion.article>
  );
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-display text-[clamp(1.4rem,2.2vw,1.75rem)] font-bold leading-[1.08] tracking-[-0.025em]">
      {children}
    </h3>
  );
}

function CardBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("mt-3 text-[16px] leading-relaxed text-mute", className)}>{children}</p>;
}

/* ---------------------------------------------------------------- Captions */

const LINE = "the one pricing lesson I wish I learned on day one".split(" ");

function CaptionsCard() {
  const [preset, setPreset] = useState<CaptionPreset>("bold-pop");
  const active = useWordTicker(LINE.length, 400);

  return (
    <Card className="lg:col-span-7 lg:row-span-2">
      <div className="grid h-full gap-8 sm:grid-cols-[minmax(0,220px)_1fr] sm:items-center lg:grid-cols-[minmax(0,260px)_1fr]">
        <div className="mx-auto w-full max-w-[240px] sm:max-w-none">
          <div className="@container relative aspect-[9/16] overflow-hidden rounded-[18px] bg-deep">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/product/stills/tutorial.webp"
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover object-[47%_center] motion-safe:animate-[push_14s_ease-in-out_infinite_alternate]"
            />
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink/45 to-transparent" />
            <Captions preset={preset} words={LINE} active={active} />
            <span className="absolute left-3 top-3 rounded-md bg-white/90 px-2 py-0.5 font-mono text-[11px] text-ink">
              Preview
            </span>
          </div>
        </div>

        <div>
          <CardTitle>Captions people actually read.</CardTitle>
          <CardBody>
            Word-timed captions in four presets. Change fonts, colours and placement if you like, or keep the
            defaults and move on.
          </CardBody>

          <fieldset className="mt-6">
            <legend className="sr-only">Caption style preview</legend>
            <div className="grid gap-2">
              {CAPTION_PRESETS.map((p) => {
                const checked = preset === p.id;
                return (
                  <label
                    key={p.id}
                    className={cn(
                      "relative flex cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3 transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-4 has-[:focus-visible]:outline-maroon",
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
                      <span className={cn("block text-[15px] font-semibold", checked && "text-maroon-pressed")}>
                        {p.name}
                      </span>
                      <span className="block text-[13px] leading-snug text-mute">{p.blurb}</span>
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
                );
              })}
            </div>
          </fieldset>
        </div>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ Ranked */

const DIMENSIONS = ["Opening", "Momentum", "Payoff", "Clarity", "Relevance", "Audio and visual fit"];

function RankedCard() {
  return (
    <Card className="lg:col-span-5" delay={0.08}>
      <CardTitle>Ranked, with reasons.</CardTitle>
      <CardBody>
        Every clip arrives titled and scored on six things, so you know what to post first and why it was picked.
      </CardBody>

      <div className="group mt-6 overflow-hidden rounded-2xl border border-pebble bg-white">
        <div className="relative transition-transform duration-700 ease-brand group-hover:scale-[1.02]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/product/screens/ranked-card.webp"
            alt="Shortzy results: clip 1 'Trust is the growth strategy nobody can copy' with Viral potential 94/100, AI estimate, and clip 2 with 91/100"
            width={690}
            height={706}
            loading="lazy"
            className="block h-auto w-full"
          />
          <LoopVideo
            src="/product/clips/podcast-clip-1"
            poster="/product/clips/podcast-clip-1.webp"
            className="absolute left-[8.84%] top-[11.47%] h-[56.66%] w-[32.61%] object-cover"
          />
        </div>
      </div>
      <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="What each score is built from">
        {DIMENSIONS.map((d) => (
          <li key={d} className="rounded-full bg-paper px-2.5 py-1 text-[12px] font-medium text-ink/80">
            {d}
          </li>
        ))}
      </ul>
      <p className="mt-4 flex items-start gap-2 text-[13px] leading-snug text-mute">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        Scores are an editorial estimate from the content itself. They are not a prediction of views.
      </p>
    </Card>
  );
}

/* ------------------------------------------------------------------ Fewer */

function FewerCard() {
  return (
    <Card className="lg:col-span-5" delay={0.16}>
      <CardTitle>Fewer clips beat filler.</CardTitle>
      <CardBody>Ask for 10. If only 6 moments hold up, you get 6, plus a plain reason why.</CardBody>
      <div className="mt-6" role="img" aria-label="Ten requested clip slots: six filled, four skipped">
        <div className="grid grid-cols-10 gap-1.5">
          {Array.from({ length: 10 }, (_, i) =>
            i < 6 ? (
              <span key={i} className="grid aspect-[9/16] place-items-center rounded-md bg-maroon text-white">
                <Check className="size-3.5" strokeWidth={3} />
              </span>
            ) : (
              <span key={i} className="aspect-[9/16] rounded-md border-2 border-dashed border-mute/40" />
            ),
          )}
        </div>
        <p className="mt-3 flex items-center justify-between text-[13px]">
          <span className="font-semibold text-ink">6 clips ready</span>
          <span className="text-mute">4 skipped: no clear payoff</span>
        </p>
      </div>
    </Card>
  );
}

/* ---------------------------------------------------------------- Framing */

function FramingCard() {
  const [mode, setMode] = useState<"face" | "fit">("face");

  return (
    <Card className="lg:col-span-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <CardTitle>Framing that follows the speaker.</CardTitle>
        <div role="group" aria-label="Framing mode" className="flex rounded-xl bg-paper p-1">
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
                "flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-[13px] font-semibold transition-colors",
                mode === id ? "bg-white text-maroon shadow-[0_1px_0_rgba(41,38,40,0.08)]" : "text-mute hover:text-ink",
              )}
            >
              <Icon className="size-4" aria-hidden="true" /> {label}
            </button>
          ))}
        </div>
      </div>
      <CardBody>
        Talking heads stay in frame as they move. Slides and screen recordings get fit framing so nothing important
        is cut off. If no face is found, Shortzy tells you it used a centred crop.
      </CardBody>

      <div className="mt-6 grid grid-cols-[1fr_auto] items-center gap-4 rounded-2xl bg-paper p-4">
        <div className="relative aspect-video overflow-hidden rounded-lg bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={mode}
            src={mode === "face" ? "/product/stills/interview.webp" : "/product/screens/library-16x9.webp"}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover motion-safe:animate-[fade-in_400ms_ease-out]"
          />
          {mode === "face" ? (
            <div className="absolute inset-y-0 left-[48%] w-[31.6%] -translate-x-1/2 motion-safe:animate-[track_5s_ease-in-out_infinite]">
              <div className="absolute inset-0 rounded-[3px] border-[3px] border-maroon shadow-[0_0_0_999px_rgba(41,38,40,0.45)]" />
              <span className="absolute -top-px left-1/2 -translate-x-1/2 rounded-b-md bg-maroon px-1.5 py-px font-mono text-[10px] text-white">
                9:16
              </span>
            </div>
          ) : (
            <div className="absolute inset-0 rounded-[3px] border-[3px] border-maroon" />
          )}
        </div>
        <div className="w-[64px] sm:w-[84px]">
          <div className="relative aspect-[9/16] overflow-hidden rounded-md bg-deep ring-1 ring-pebble">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={mode}
              src={mode === "face" ? "/product/stills/interview.webp" : "/product/screens/library-16x9.webp"}
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
          <p className="mt-1.5 text-center font-mono text-[10px] text-mute">Output</p>
        </div>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------- Cost */

function CostCard() {
  return (
    <Card className="lg:col-span-6" delay={0.08}>
      <CardTitle>Know the cost before you click.</CardTitle>
      <CardBody>
        Shortzy estimates your AI cost from the video length and the model you picked, and shows it as a range.
        Checking an estimate is free. Nothing runs until you start it.
      </CardBody>
      <div className="h-6 shrink-0" />

      <figure className="group mt-auto">
        <div className="overflow-hidden rounded-2xl border border-pebble bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/product/screens/estimate-card.webp"
            alt="Shortzy cost estimate step: estimated AI cost for the selected video, shown as a range before you continue"
            width={800}
            height={480}
            loading="lazy"
            className="block h-auto w-full transition-transform duration-700 ease-brand group-hover:scale-[1.02]"
          />
        </div>
        <figcaption className="mt-3 text-[12px] leading-snug text-mute">
          Sample estimate from the app for a 24-minute video. Your cost depends on the video&apos;s length and the
          model you choose, and your provider&apos;s bill is final.
        </figcaption>
      </figure>
    </Card>
  );
}

export function Features() {
  return (
    <section id="features" aria-labelledby="features-title" className="py-24 sm:py-32">
      <Container>
        <Reveal className="max-w-[760px]">
          <Eyebrow>What&apos;s inside</Eyebrow>
          <h2
            id="features-title"
            className="mt-4 font-display text-[clamp(2.1rem,4.6vw,3.6rem)] font-bold leading-[0.98] tracking-[-0.035em]"
          >
            It makes the tedious calls. <span className="text-maroon">You make the final ones.</span>
          </h2>
          <p className="mt-5 max-w-[56ch] text-[17px] leading-relaxed text-mute sm:text-[18px]">
            Every pick comes with its reasoning, and every setting can be changed. Here&apos;s what you get.
          </p>
        </Reveal>

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
