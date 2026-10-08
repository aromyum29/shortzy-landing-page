"use client";

import { useMediaQuery } from "./use-media-query";

/**
 * Hydration-safe reduced-motion preference: false during SSR and hydration,
 * then the real value. Avoids server/client markup mismatches.
 */
export function usePrefersReducedMotion() {
  return useMediaQuery("(prefers-reduced-motion: reduce)", false);
}
