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
};

export default nextConfig;
