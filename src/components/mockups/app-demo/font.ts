import { Inter } from "next/font/google";

/** The desktop app ships Inter. Scoped to the demo canvas and loaded lazily (no preload). */
export const appFont = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-app",
});
