import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "cdn.dummyjson.com" }],
  },
};

export default nextConfig;
