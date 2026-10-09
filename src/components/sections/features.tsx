"use client";

import { useState } from "react";
import { Check, Info, ScanFace, Presentation } from "lucide-react";
import { Container, Eyebrow } from "@/components/ui/container";
import { Captions, CAPTION_PRESETS, type CaptionPreset } from "@/components/mockups/captions";
import { Scene } from "@/components/mockups/scene";
import { ClipThumb } from "@/components/mockups/phone";
import { useWordTicker } from "@/hooks/use-word-ticker";
import { cn } from "@/lib/utils";

function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <article className={cn("flex flex-col rounded-[24px] border border-pebble bg-white p-6 sm:p-8", className)}>
      {children}
    </article>
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
            <Scene name="studio" vertical className="absolute inset-0" />
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

const DIMENSIONS = [
  { name: "Opening", v: 0.92 },
  { name: "Momentum", v: 0.78 },
  { name: "Payoff", v: 0.95 },
  { name: "Clarity", v: 0.86 },
  { name: "Relevance", v: 0.8 },
  { name: "Audio and visual fit", v: 0.72 },
];

function RankedCard() {
  return (
    <Card className="lg:col-span-5">
      <CardTitle>Ranked, with reasons.</CardTitle>
      <CardBody>
        Every clip arrives titled and scored on six things, so you know what to post first and why it was picked.
      </CardBody>

      <div className="mt-6 flex gap-4 rounded-2xl bg-paper p-4">
        <ClipThumb scene="host" words={["we", "killed", "free"]} active={1} className="w-[72px] shrink-0 self-start" />
        <div className="min-w-0 flex-1">
          <p className="flex items-baseline justify-between gap-2">
            <span className="truncate text-[14px] font-semibold">Why we killed our free plan</span>
            <span className="font-mono text-[12px] text-maroon tabular">#1</span>
          </p>
          <ul className="mt-2.5 space-y-1.5" aria-label="Score breakdown">
            {DIMENSIONS.map((d) => (
              <li key={d.name} className="grid grid-cols-[minmax(0,1fr)_88px] items-center gap-2 text-[12px] text-mute">
                <span className="truncate">{d.name}</span>
                <span className="h-1.5 overflow-hidden rounded-full bg-pebble/60" aria-hidden="true">
                  <span className="block h-full rounded-full bg-maroon" style={{ width: `${d.v * 100}%` }} />
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
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
    <Card className="lg:col-span-5">
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
        <div className="relative aspect-video overflow-hidden rounded-lg">
          <Scene name={mode === "face" ? "host" : "tutorial"} className="absolute inset-0" />
          {mode === "face" ? (
            <div className="absolute inset-y-0 left-1/2 w-[31.6%] -translate-x-1/2 motion-safe:animate-[track_5s_ease-in-out_infinite]">
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
          <div className="relative aspect-[9/16] overflow-hidden rounded-md bg-white ring-1 ring-pebble">
            {mode === "face" ? (
              <Scene name="host" vertical className="absolute inset-0" />
            ) : (
              <div className="absolute inset-x-0 top-1/2 aspect-video -translate-y-1/2">
                <Scene name="tutorial" className="absolute inset-0" />
              </div>
            )}
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
    <Card className="lg:col-span-6">
      <CardTitle>Know the cost before you click.</CardTitle>
      <CardBody>
        Shortzy estimates your AI cost from the video length and the model you picked, and shows it as a range.
        Checking an estimate is free. Nothing runs until you start it.
      </CardBody>
      <div className="h-6 shrink-0" />

      <div className="mt-auto rounded-2xl bg-paper p-4 sm:p-5" aria-hidden="true">
        <div className="flex items-center justify-between text-[13px]">
          <span className="font-semibold">Video length</span>
          <span className="rounded-lg border border-mute bg-white px-2.5 py-1 font-mono text-[12px] tabular">60 min</span>
        </div>
        <div className="relative mt-3 h-2 rounded-full bg-pebble/70">
          <div className="absolute inset-y-0 left-0 w-[40%] rounded-full bg-maroon" />
          <div className="absolute left-[40%] top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-maroon bg-white" />
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-pebble bg-white px-3 py-2.5 text-[13px]">
          <span className="font-semibold">Gemini</span>
          <span className="rounded-full bg-rose px-2 py-0.5 text-[11px] font-semibold text-maroon-pressed">
            Recommended
          </span>
          <span className="ml-auto flex items-center gap-1.5 whitespace-nowrap text-mute">
            Estimated range
            <span className="flex gap-0.5">
              <span className="h-2.5 w-6 rounded-sm bg-oat" />
              <span className="h-2.5 w-10 rounded-sm bg-oat/50" />
            </span>
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between text-[12px] text-mute">
          <span>Up to 10 shorts, edited on your computer</span>
          <span className="rounded-lg bg-maroon px-3 py-1.5 font-semibold text-white">Start</span>
        </div>
      </div>
    </Card>
  );
}

export function Features() {
  return (
    <section id="features" aria-labelledby="features-title" className="py-24 sm:py-32">
      <Container>
        <div className="max-w-[760px]">
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
