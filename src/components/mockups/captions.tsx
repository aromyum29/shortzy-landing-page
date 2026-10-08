import { cn } from "@/lib/utils";

export type CaptionPreset = "bold-pop" | "word-highlight" | "condensed" | "clean-box" | "none";

export const CAPTION_PRESETS: { id: CaptionPreset; name: string; blurb: string }[] = [
  { id: "bold-pop", name: "Bold pop", blurb: "Big, punchy words that land one beat at a time." },
  { id: "word-highlight", name: "Word highlight", blurb: "Full lines, with the spoken word marked as it's said." },
  { id: "condensed", name: "Condensed", blurb: "Tall, narrow type that fits more without covering faces." },
  { id: "clean-box", name: "Clean box", blurb: "Calm sentence case on a solid box. Great for tutorials." },
  { id: "none", name: "No captions", blurb: "Just the clip. Add your own later." },
];

const CHUNK: Record<Exclude<CaptionPreset, "none">, number> = {
  "bold-pop": 3,
  "word-highlight": 4,
  condensed: 4,
  "clean-box": 6,
};

/**
 * Renders a caption line inside a 9:16 frame. The parent must be an
 * `@container` so sizes scale with the frame (cqw units).
 */
export function Captions({
  preset,
  words,
  active,
  className,
}: {
  preset: CaptionPreset;
  words: string[];
  active: number;
  className?: string;
}) {
  if (preset === "none" || words.length === 0) return null;

  const size = CHUNK[preset];
  const start = Math.floor(active / size) * size;
  const chunk = words.slice(start, start + size);
  const local = active - start;

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-x-[7%] bottom-[22%] flex flex-wrap justify-center text-center",
        className,
      )}
    >
      {preset === "bold-pop" && (
        <p className="flex flex-wrap justify-center gap-x-[4cqw] font-display text-[11.5cqw] font-extrabold uppercase leading-[1.02] tracking-[-0.01em] [paint-order:stroke_fill] [-webkit-text-stroke:1.6cqw_#292628] [font-stretch:92%]">
          {chunk.map((w, i) => (
            <span
              key={`${start}-${i}`}
              className={cn(
                "inline-block transition-transform duration-150",
                i === local ? "scale-110 text-oat" : "text-white",
              )}
            >
              {w}
            </span>
          ))}
        </p>
      )}

      {preset === "word-highlight" && (
        <p className="flex flex-wrap justify-center gap-x-[1cqw] gap-y-[0.6cqw] font-display text-[8.5cqw] font-bold leading-[1.25] [paint-order:stroke_fill] [-webkit-text-stroke:1.1cqw_#292628]">
          {chunk.map((w, i) => (
            <span
              key={`${start}-${i}`}
              className={cn(
                "inline-block rounded-[1.6cqw] px-[1.2cqw]",
                i === local ? "bg-coral text-ink [-webkit-text-stroke:0]" : "text-white",
              )}
            >
              {w}
            </span>
          ))}
        </p>
      )}

      {preset === "condensed" && (
        <p className="flex max-w-[80%] flex-wrap justify-center gap-x-[3cqw] font-display text-[12cqw] font-extrabold uppercase leading-[0.92] tracking-[-0.01em] text-white [font-stretch:75%] [paint-order:stroke_fill] [-webkit-text-stroke:1.3cqw_#292628]">
          {chunk.map((w, i) => (
            <span key={`${start}-${i}`} className={cn("inline-block", i === local && "text-coral")}>
              {w}
            </span>
          ))}
        </p>
      )}

      {preset === "clean-box" && (
        <p className="rounded-[2.4cqw] bg-white px-[3.5cqw] py-[2cqw] text-[6.6cqw] font-semibold leading-[1.3] text-ink">
          {chunk.map((w, i) => (
            <span key={`${start}-${i}`} className={cn(i <= local ? "text-ink" : "text-mute/60")}>
              {w}{" "}
            </span>
          ))}
        </p>
      )}
    </div>
  );
}
