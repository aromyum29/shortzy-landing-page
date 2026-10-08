"use client";

import { MotionConfig } from "motion/react";

/** Honour the OS reduced-motion setting: Motion drops transform animations and keeps gentle fades. */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
