import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, DM_Mono, Instrument_Sans } from "next/font/google";
import { site } from "@/lib/site";
import "./globals.css";

// Marketing typography. The desktop app itself keeps the brand's system sans stack.
const display = Bricolage_Grotesque({
  variable: "--font-display-face",
  subsets: ["latin"],
  axes: ["opsz", "wdth"],
  display: "swap",
});

const body = Instrument_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

const mono = DM_Mono({
  variable: "--font-mono-face",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

// "Shortzy · Turn long videos into shorts. Pay once, it's yours" (the headline without its closing full stop).
const title = `${site.name} · ${site.headline.replace(/\.$/, "")}`;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title,
  description: site.description,
  applicationName: site.name,
  keywords: [
    "turn long videos into shorts",
    "one-time purchase clipping app",
    "clip maker with your own API key",
    "AI clip generator without credits",
  ],
  openGraph: {
    title,
    description: site.description,
    siteName: site.name,
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: `${site.name}. ${site.headline}` }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description: site.description,
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#F3F1EE",
};

// Pre-launch: no price amount and no offer markup until a price is set.
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: site.name,
  url: site.url,
  applicationCategory: "MultimediaApplication",
  operatingSystem: "macOS 14 or later (Apple Silicon), Windows",
  description: site.description,
};

/*
 * Runs while the HTML is parsed, before first paint and long before React hydrates.
 * 1. Adds html.js, which is what lets scroll reveals start hidden (see globals.css). With
 *    JavaScript off, or without IntersectionObserver, the class never appears and every block
 *    simply shows.
 * 2. Reveals [data-reveal] blocks as they scroll into view, so on a slow connection a visitor who
 *    scrolls before hydration still sees them. Reveal (components/ui/reveal.tsx) does the same
 *    after hydration for anything mounted later.
 */
const revealScript = `(function(){if(!("IntersectionObserver" in window))return;var d=document;d.documentElement.classList.add("js");function run(){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.setAttribute("data-shown","");io.unobserve(e.target)}})},{rootMargin:"0px 0px -8% 0px"});d.querySelectorAll("[data-reveal]:not([data-shown])").forEach(function(el){io.observe(el)})}if(d.readyState==="loading")d.addEventListener("DOMContentLoaded",run);else run()})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // The inline script adds a class before hydration, so React is told the class may differ.
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable} antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: revealScript }} />
      </head>
      <body className="min-h-dvh">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
