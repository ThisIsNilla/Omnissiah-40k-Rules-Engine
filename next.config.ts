import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // This tells Vercel's build system to bundle your local data and rulebooks folders
    // into the serverless functions, so fs.readFileSync can access them in production.
    outputFileTracingIncludes: {
      '/api/chat': ['./data/**/*'],
      '/api/rulebooks': ['./rulebooks/**/*'],
    },
  },
};

export default nextConfig;
