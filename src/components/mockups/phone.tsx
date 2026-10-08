"use client";

import { Heart, MessageCircle, Send } from "lucide-react";
import { Scene, type SceneName } from "./scene";
import { Captions, type CaptionPreset } from "./captions";
import { useWordTicker } from "@/hooks/use-word-ticker";
import { cn } from "@/lib/utils";

export const SAMPLE_LINE = "nobody tells you this about pricing your first product".split(" ");

/** A generic phone playing a finished short. No platform branding. */
export function Phone({
  scene = "host",
  preset = "bold-pop",
  words = SAMPLE_LINE,
  title = "Why we killed our free plan",
  className,
}: {
  scene?: SceneName;
  preset?: CaptionPreset;
  words?: string[];
  title?: string;
  className?: string;
}) {
  const active = useWordTicker(words.length, 380);

  return (
    <div
      className={cn(
        "relative aspect-[9/19] w-full rounded-[13%/6.2%] bg-ink p-[3.2%] shadow-[0_30px_60px_-20px_rgba(41,38,40,0.45)]",
        className,
      )}
      role="img"
      aria-label={`Phone showing a finished vertical short titled "${title}" with captions`}
    >
      <div className="@container relative h-full w-full overflow-hidden rounded-[10.5%/5%] bg-deep">
        <Scene name={scene} vertical className="absolute inset-0" />
        <div className="absolute inset-x-0 top-0 h-[16%] bg-gradient-to-b from-ink/35 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-[30%] bg-gradient-to-t from-ink/60 to-transparent" />
        <div className="absolute left-1/2 top-[2.2%] h-[3.2%] w-[30%] -translate-x-1/2 rounded-full bg-ink" />
        <Captions preset={preset} words={words} active={active} className="bottom-[27%]" />

        <div className="absolute bottom-[16%] right-[4%] flex flex-col items-center gap-[5cqw] text-white">
          {[Heart, MessageCircle, Send].map((Icon, i) => (
            <span key={i} className="grid size-[11cqw] place-items-center rounded-full bg-ink/35">
              <Icon className="size-[6cqw]" strokeWidth={2.2} />
            </span>
          ))}
        </div>

        <div className="absolute inset-x-[5%] bottom-[5%] text-white">
          <p className="text-[4.6cqw] font-semibold leading-tight">{title}</p>
          <p className="mt-[1cqw] text-[3.6cqw] opacity-80">@yourchannel · 0:42</p>
          <div className="mt-[3cqw] h-[0.9cqw] overflow-hidden rounded-full bg-white/30">
            <div className="h-full w-[38%] rounded-full bg-oat" />
          </div>
        </div>
      </div>
    </div>
  );
}

/** A 9:16 clip thumbnail as it appears in Shortzy's results grid. */
export function ClipThumb({
  scene,
  words,
  preset = "bold-pop",
  active = 0,
  className,
}: {
  scene: SceneName;
  words?: string[];
  preset?: CaptionPreset;
  active?: number;
  className?: string;
}) {
  return (
    <div className={cn("@container relative aspect-[9/16] overflow-hidden rounded-lg bg-deep", className)}>
      <Scene name={scene} vertical className="absolute inset-0" />
      {words && <Captions preset={preset} words={words} active={active} />}
    </div>
  );
}
