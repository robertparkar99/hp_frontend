import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true, // This will skip ESLint completely during builds
  },
  typescript: {
    ignoreBuildErrors: true, // Also ignore TypeScript errors if needed
  },
};

export default nextConfig;