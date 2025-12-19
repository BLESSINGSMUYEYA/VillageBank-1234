import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  experimental: {
    // Other experimental features can go here
  },
  // Force Webpack to avoid Turbopack issues
  webpack: (config, { isServer }) => {
    return config;
  },
  // Add empty turbopack config to silence error
  turbopack: {},
  // Add path mapping for TypeScript
  transpilePackages: [],
};

export default nextConfig;
