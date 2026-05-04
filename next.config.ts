import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: true, // Also ignore TypeScript errors if needed
  },
  // Mark Genkit packages as external to avoid bundling issues
  serverExternalPackages: [
    "genkit",
    "@genkit-ai/core",
    "@genkit-ai/google-genai",
    "@genkit-ai/express",
    "@genkit-ai/next",
  ],
};

export default nextConfig;