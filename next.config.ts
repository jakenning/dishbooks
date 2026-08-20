import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  // `output: "export"` ships no image optimiser, so next/image is used purely
  // for intrinsic sizing (no layout shift); the files are pre-sized on disk.
  images: { unoptimized: true },
};

export default nextConfig;
