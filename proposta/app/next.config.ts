import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  // permite vários dev servers em paralelo (um por subagente)
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default config;
