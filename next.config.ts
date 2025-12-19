import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  experimental: {},
  // Force Webpack to avoid Turbopack issues
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({
        '@prisma/client': '@prisma/client',
      });
    }
    return config;
  },
  // Add path mapping for TypeScript
  transpilePackages: [],
};

export default nextConfig;
