"use client";

import { motion, type HTMLMotionProps } from "motion/react";

/** Fades and lifts content in once as it scrolls into view. */
export function Reveal({
  delay = 0,
  y = 16,
  ...props
}: HTMLMotionProps<"div"> & { delay?: number; y?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.5, delay, ease: [0.2, 0.8, 0.2, 1] }}
      {...props}
    />
  );
}
