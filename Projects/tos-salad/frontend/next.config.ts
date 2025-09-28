import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Set output file tracing root to fix workspace detection
  outputFileTracingRoot: process.cwd(),

  // Updated turbopack configuration
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },

  // Optimize for production
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,

  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000, // 1 year
  },

  // Skip ESLint during build for now
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Skip TypeScript type checking during build for now
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
