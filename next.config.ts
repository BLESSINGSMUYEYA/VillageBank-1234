import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {},
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false, // Keep this false to ensure type safety, unless specific issues arise
  },
  // Ensure we don't try to bundle Prisma on the client
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({
        '@prisma/client': 'commonjs @prisma/client',
      });
    }
    return config;
  },
};

export default nextConfig;
