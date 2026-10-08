"use client";

import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "./use-prefers-reduced-motion";

/** Steps through word indexes like caption word timings. Static under reduced motion. */
export function useWordTicker(length: number, intervalMs = 420, enabled = true) {
  const reduce = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!enabled || reduce || length < 2) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % length), intervalMs);
    return () => window.clearInterval(id);
  }, [length, intervalMs, enabled, reduce]);

  return reduce ? Math.min(1, length - 1) : index % Math.max(length, 1);
}
