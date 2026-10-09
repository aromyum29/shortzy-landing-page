import { cn } from "@/lib/utils";

/**
 * Shortzy logo lockup, matching the desktop app's sidebar brand: the waving
 * filmstrip mascot beside the lowercase "shortzy" wordmark and maroon dot.
 */
export function Logo({ className, size = "md" }: { className?: string; size?: "sm" | "md" }) {
  const px = size === "sm" ? 34 : 40;
  return (
    <span
      className={cn(
        "inline-flex select-none items-center gap-[7px] font-sans font-[750] leading-none tracking-[-0.03em] text-ink",
        size === "sm" ? "text-[20px]" : "text-[23px]",
        className,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/mascot/logo-mascot.webp"
        alt=""
        aria-hidden="true"
        width={px}
        height={px}
        draggable={false}
        className="block shrink-0 object-contain"
        style={{ width: px, height: px }}
      />
      <span>
        shortzy<span className="ml-[3px] text-maroon">.</span>
      </span>
    </span>
  );
}
