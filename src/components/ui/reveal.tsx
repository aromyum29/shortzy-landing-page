"use client";

import { useEffect, useLayoutEffect, useRef, type CSSProperties } from "react";
import { motion, type HTMLMotionProps } from "motion/react";

/**
 * Fades and lifts content in once as it scrolls into view.
 *
 * The hidden start state lives in CSS and applies only under html.js (set by the inline script in
 * app/layout.tsx), so the server HTML is fully visible: with JavaScript off nothing is hidden, and
 * on a slow connection the inline script reveals blocks before React has loaded. After hydration
 * this component observes its own block too, which covers anything mounted later. Reduced motion
 * shows every block at rest (globals.css).
 */
export function Reveal({
  delay = 0,
  y = 16,
  style,
  ...props
}: HTMLMotionProps<"div"> & { delay?: number; y?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  // In development, React can reset <html> attributes on its Strict Mode remount, dropping the
  // class the inline script set. Restoring it is a no-op in production.
  useLayoutEffect(() => {
    if ("IntersectionObserver" in window) document.documentElement.classList.add("js");
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || el.hasAttribute("data-shown") || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        el.setAttribute("data-shown", "");
        io.disconnect();
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <motion.div
      ref={ref}
      data-reveal=""
      // The inline script may mark the block shown before hydration; keep what the DOM says.
      suppressHydrationWarning
      style={{ "--reveal-delay": `${delay}s`, "--reveal-y": `${y}px`, ...style } as CSSProperties}
      {...props}
    />
  );
}
