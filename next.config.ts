import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  experimental: {
    // Other experimental features can go here
  },
  // Force Webpack for now
  webpack: (config, { isServer }) => {
    return config;
  },
  // Add empty turbopack config to silence the error
  turbopack: {},
  // Add path mapping for TypeScript
  transpilePackages: [],
};

export default nextConfig;
