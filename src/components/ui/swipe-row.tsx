"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Phones: a horizontal row of peeking cards that snap into place, using the browser's own
 * momentum scrolling (so flicks carry and land the way iOS scroll views do), with a counter
 * and dots that jump to a card. From md up it is a plain container, laid out by `className`.
 */
export function SwipeRow({
  children,
  count,
  label,
  className,
}: {
  children: ReactNode;
  count: number;
  label: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const kids = Array.from(el.children) as HTMLElement[];
        if (!kids.length) return;
        const left = el.scrollLeft + parseFloat(getComputedStyle(el).scrollPaddingLeft || "0");
        let best = 0;
        kids.forEach((k, i) => {
          if (Math.abs(k.offsetLeft - left) < Math.abs(kids[best].offsetLeft - left)) best = i;
        });
        // At the end of the row the last card can't reach the start edge, so count it as current.
        if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 2) best = kids.length - 1;
        setIndex(best);
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const go = (i: number) => {
    const el = ref.current;
    const kid = el?.children[i] as HTMLElement | undefined;
    if (!el || !kid) return;
    const pad = parseFloat(getComputedStyle(el).scrollPaddingLeft || "0");
    el.scrollTo({ left: kid.offsetLeft - pad, behavior: "smooth" });
  };

  return (
    <div>
      <div
        ref={ref}
        role="region"
        aria-label={label}
        // Focusable so keyboard users can scroll the row with the arrow keys.
        tabIndex={0}
        // Phones: bleed to the screen edges, keep the gutter as scroll padding, and leave room above and
        // below for focus rings. md and up: the container's own layout from className.
        className={cn(
          "no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 py-2",
          "*:w-[84%] *:max-w-[22rem] *:shrink-0 *:snap-start",
          "md:mx-0 md:overflow-visible md:px-0 md:py-0 md:*:w-auto md:*:max-w-none md:*:shrink",
          className,
        )}
      >
        {children}
      </div>
      <div className="mt-3 flex items-center justify-between md:hidden" aria-hidden="true">
        <span className="tabular font-mono text-[0.75rem] text-mute">
          {index + 1} / {count}
        </span>
        <span className="flex items-center">
          {Array.from({ length: count }, (_, i) => (
            <button
              key={i}
              type="button"
              tabIndex={-1}
              onClick={() => go(i)}
              className="grid h-8 w-6 place-items-center"
            >
              <span
                className={cn(
                  "block h-1.5 rounded-full transition-[width,background-color] duration-300 ease-brand",
                  i === index ? "w-4 bg-maroon" : "w-1.5 bg-pebble",
                )}
              />
            </button>
          ))}
        </span>
      </div>
    </div>
  );
}
