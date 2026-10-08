import { cn } from "@/lib/utils";

/** Supplied v3.2 wordmark. Minimum width 120px; use on white or paper only. */
export function Logo({ className, width = 132 }: { className?: string; width?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/logo.svg"
      alt="Shortzy"
      width={width}
      height={Math.round((width * 72) / 300)}
      className={cn("block h-auto select-none", className)}
      draggable={false}
    />
  );
}

/** Supplied standalone mark. Minimum 24px. */
export function LogoMark({ className, size = 28 }: { className?: string; size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/logo-mark.svg"
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      className={cn("block select-none", className)}
      draggable={false}
    />
  );
}
