import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fully static marketing site: `next build` writes plain HTML/CSS/JS to /out.
  output: "export",
  images: { unoptimized: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
