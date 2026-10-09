"use client";

import { createContext, useContext } from "react";
import { motionValue, type MotionValue } from "motion/react";

/** The master clock (ms from loop start) and whether the demo renders as a still frame. */
export const DemoClock = createContext<{ t: MotionValue<number>; still: boolean }>({
  t: motionValue(0),
  still: false,
});

export const useDemoClock = () => useContext(DemoClock);
