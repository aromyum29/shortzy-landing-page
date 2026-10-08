import { cn } from "@/lib/utils";

export type MascotPose = "welcome" | "thinking" | "clipping" | "celebration";

/**
 * The four supplied filmstrip poses. Always rendered in a square box with
 * object-fit: contain so limbs and props are never cropped or stretched.
 * Decorative by default: adjacent text should explain the state.
 */
export function Mascot({
  pose,
  size = 240,
  className,
  label,
  priority = false,
  fluid = false,
}: {
  pose: MascotPose;
  size?: number;
  className?: string;
  label?: string;
  priority?: boolean;
  /** Let className control the rendered size (e.g. responsive widths). */
  fluid?: boolean;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/brand/mascot/${pose}.webp`}
      alt={label ?? ""}
      aria-hidden={label ? undefined : true}
      width={size}
      height={size}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      draggable={false}
      className={cn("aspect-square select-none object-contain", className)}
      style={fluid ? undefined : { width: size, height: size }}
    />
  );
}
