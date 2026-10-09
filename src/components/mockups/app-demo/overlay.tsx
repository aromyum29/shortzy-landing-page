"use client";

import { memo, useLayoutEffect, useRef } from "react";
import { AnimatePresence, motion, useMotionValue, useTransform, type MotionValue } from "motion/react";
import { cn } from "@/lib/utils";
import {
  BUBBLES,
  cursorAt,
  cursorOpacityAt,
  cursorScaleAt,
  rippleAt,
  scrollAt,
  type Bubble,
  type Cam,
  type Placement,
} from "./timeline";

/*
 * Unscaled overlay: cursor, click ripples and speech bubbles render at real
 * pixels on top of the scaled canvas, so they stay legible on phones. Canvas
 * points are mapped through the camera (x0, y0, k).
 */

const EASE = [0.2, 0.8, 0.2, 1] as const;

type Shared = { t: MotionValue<number>; cam: MotionValue<Cam> };

export const Cursor = memo(function Cursor({ t, cam, small }: Shared & { small: boolean }) {
  // One derived value per frame from the clock and the camera (it also refreshes once the frame is measured).
  const p = useTransform(() => {
    const v = t.get();
    const c = cam.get();
    const [cx, cy] = cursorAt(v);
    return { x: (cx - c.x0) * c.k, y: (cy - c.y0) * c.k, s: cursorScaleAt(v), o: cursorOpacityAt(v) };
  });
  const x = useTransform(p, (v) => v.x);
  const y = useTransform(p, (v) => v.y);
  const scale = useTransform(p, (v) => v.s);
  const opacity = useTransform(p, (v) => v.o);
  const w = small ? 16 : 18;
  const h = small ? 21 : 24;
  return (
    <motion.div className="absolute left-0 top-0 z-30" style={{ x, y, opacity }}>
      <motion.svg
        width={w}
        height={h}
        viewBox="0 0 18 24"
        className="-translate-x-[2px] -translate-y-[2px] drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]"
        style={{ scale, originX: "2px", originY: "2px" }}
      >
        <path
          d="M2 2 L2 19.6 L6.5 15.4 L9.5 22.2 L12.7 20.8 L9.8 14.3 L15.8 14.3 Z"
          fill="#252327"
          stroke="#fff"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </motion.svg>
    </motion.div>
  );
});

export const Ripple = memo(function Ripple({ t, cam }: Shared) {
  const r = useTransform(() => {
    const hit = rippleAt(t.get());
    const c = cam.get();
    if (!hit) return { x: -99, y: -99, s: 6, o: 0 };
    const s = 6 + 30 * hit.u;
    return { x: (hit.p[0] - c.x0) * c.k - s / 2, y: (hit.p[1] - c.y0) * c.k - s / 2, s, o: 0.45 * (1 - hit.u) };
  });
  const x = useTransform(r, (v) => v.x);
  const y = useTransform(r, (v) => v.y);
  const size = useTransform(r, (v) => v.s);
  const opacity = useTransform(r, (v) => v.o);
  return (
    <motion.span
      className="absolute left-0 top-0 z-20 rounded-full border-2 border-[#702f42]"
      style={{ x, y, width: size, height: size, opacity }}
    />
  );
});

const BY_ID = Object.fromEntries(BUBBLES.map((b) => [b.id, b])) as Record<string, Bubble>;

type Fit = {
  /** Phones: compact anchors and the smallest bubbles. */
  compact: boolean;
  /** Tablets: desktop anchors on a smaller canvas, so slightly tighter bubbles. */
  dense: boolean;
};

export function Bubbles({
  ids,
  compact,
  dense,
  still,
  fw,
  fh,
  ...shared
}: Shared & Fit & { ids: string[]; still: boolean; fw: MotionValue<number>; fh: MotionValue<number> }) {
  return (
    <AnimatePresence>
      {ids
        .map((id) => BY_ID[id])
        .filter((b) => !(compact && b.compact === false))
        .map((b) => (
          <BubbleView key={b.id} b={b} compact={compact} dense={dense} still={still} fw={fw} fh={fh} {...shared} />
        ))}
    </AnimatePresence>
  );
}

const GAP = 10;
const MARGIN = 8;
const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), Math.max(lo, hi));

function layoutBubble(ax: number, ay: number, w: number, h: number, place: Placement, fw: number, fh: number) {
  let side: Placement = place;
  const fits = {
    right: ax + GAP + w <= fw - MARGIN,
    left: ax - GAP - w >= MARGIN,
    top: ay - GAP - h >= MARGIN,
    bottom: ay + GAP + h <= fh - MARGIN,
  };
  if (side === "right" && !fits.right && fits.left) side = "left";
  else if (side === "left" && !fits.left && fits.right) side = "right";
  else if ((side === "top" || side === "top-start") && !fits.top && fits.bottom) side = "bottom";
  else if (side === "bottom" && !fits.bottom && fits.top) side = "top";

  let left: number;
  let top: number;
  switch (side) {
    case "right":
      left = ax + GAP;
      top = ay - h / 2;
      break;
    case "left":
      left = ax - GAP - w;
      top = ay - h / 2;
      break;
    case "top":
      left = ax - w / 2;
      top = ay - GAP - h;
      break;
    case "top-start":
      left = ax - 22;
      top = ay - GAP - h;
      break;
    default:
      left = ax - w / 2;
      top = ay + GAP;
  }
  left = clamp(left, MARGIN, fw - MARGIN - w);
  top = clamp(top, MARGIN, fh - MARGIN - h);

  const horizontal = side === "right" || side === "left";
  const tx = horizontal ? (side === "right" ? 0 : w) : clamp(ax - left, 16, w - 16);
  const ty = horizontal ? clamp(ay - top, 14, h - 14) : side === "bottom" ? 0 : h;
  return { left, top, tx, ty, w, h };
}

const BubbleView = memo(function BubbleView({
  b,
  t,
  cam,
  compact,
  dense,
  still,
  fw,
  fh,
}: Shared & Fit & { b: Bubble; still: boolean; fw: MotionValue<number>; fh: MotionValue<number> }) {
  const ref = useRef<HTMLDivElement>(null);
  const w = useMotionValue(0);
  const h = useMotionValue(0);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      w.set(el.offsetWidth);
      h.set(el.offsetHeight);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [w, h]);

  const anchor = compact && b.anchorCompact ? b.anchorCompact : b.anchor;
  const place = compact && b.placeCompact ? b.placeCompact : b.place;
  const note = compact && b.noteCompact ? b.noteCompact : b.note;

  const box = useTransform(() => {
    const c = cam.get();
    const ax = (anchor[0] - c.x0) * c.k;
    const ay = (anchor[1] - scrollAt(b.view, t.get()) - c.y0) * c.k;
    return layoutBubble(ax, ay, w.get(), h.get(), place, fw.get(), fh.get());
  });
  const x = useTransform(box, (v) => v.left);
  const y = useTransform(box, (v) => v.top);
  const tailX = useTransform(box, (v) => v.tx - 5);
  const tailY = useTransform(box, (v) => v.ty - 5);
  const originX = useTransform(box, (v) => (v.w ? v.tx / v.w : 0.5));
  const originY = useTransform(box, (v) => (v.h ? v.ty / v.h : 0.5));

  const tone = {
    main: "bg-maroon text-white",
    qualifier: "border border-rose bg-white text-maroon",
    aha: "bg-oat text-ink",
  }[b.kind];
  const text = {
    main: compact ? "text-[0.8125rem] font-semibold" : dense ? "text-[0.75rem] font-semibold" : "text-[0.875rem] font-semibold",
    qualifier: "text-[0.75rem] font-medium",
    aha: compact ? "text-[0.875rem] font-semibold" : dense ? "text-[0.8125rem] font-semibold" : "text-[0.9375rem] font-semibold",
  }[b.kind];
  const maxW = compact
    ? b.wideCompact
      ? "max-w-[min(17rem,calc(100vw-3rem))]"
      : "max-w-[min(11.5rem,56vw)]"
    : dense
      ? "max-w-[15rem]"
      : note
        ? "max-w-[16rem]"
        : "max-w-[18rem]";
  const lift = place === "bottom" ? -6 : 6;

  return (
    <motion.div className="absolute left-0 top-0 z-10" style={{ x, y }}>
      <motion.div
        ref={ref}
        className={cn("relative w-max rounded-[12px] shadow-[0_10px_24px_-12px_rgba(41,38,40,0.55)]", maxW, tone)}
        style={{ originX, originY }}
        initial={still ? false : { opacity: 0, scale: 0.92, y: lift }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.16, ease: EASE } }}
        transition={{
          opacity: { duration: 0.2, ease: EASE },
          default: { type: "spring", bounce: 0, visualDuration: 0.28 },
        }}
      >
        <motion.span className={cn("absolute size-[10px] rotate-45", tone)} style={{ left: tailX, top: tailY }} />
        <span
          className={cn(
            "relative block text-balance rounded-[12px] leading-[1.25]",
            dense ? "px-2.5 py-1.5" : "px-3 py-2",
            tone,
            "border-0",
          )}
        >
          <span className={cn("block", text)}>{b.text}</span>
          {note && (
            <span
              className={cn(
                "mt-1.5 block border-t border-white/25 pt-1.5 font-medium leading-[1.3] text-white/90",
                dense ? "text-[0.6875rem]" : "text-[0.75rem]",
              )}
            >
              {note}
            </span>
          )}
        </span>
      </motion.div>
    </motion.div>
  );
});
