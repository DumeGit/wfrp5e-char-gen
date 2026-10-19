import type { NextConfig } from "next";

const config: NextConfig = {
  output: "export",
  distDir:
    process.env.WFRP_DEV_CHECK === "1" ? ".next-rendering-check" : ".next",
  turbopack: { root: process.cwd() },
  trailingSlash: true,
  images: { unoptimized: true },
  poweredByHeader: false,
  devIndicators: false,
};
export default config;
