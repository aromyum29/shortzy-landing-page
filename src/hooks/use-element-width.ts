"use client";

import { useCallback, useState } from "react";

/** Tracks an element's content width with a ResizeObserver. Width is 0 until the element mounts. */
export function useElementWidth<T extends HTMLElement>() {
  const [width, setWidth] = useState(0);
  const ref = useCallback((el: T | null) => {
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
    ro.observe(el);
    setWidth(Math.round(el.getBoundingClientRect().width));
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
}
