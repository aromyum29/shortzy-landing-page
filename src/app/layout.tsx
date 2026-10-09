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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable} antialiased`}
    >
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
