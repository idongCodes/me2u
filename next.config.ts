import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  experimental: {
    serverActions: {
      allowedOrigins: ['fromme2u.app', '*.fromme2u.app'],
    },
  },
};

export default nextConfig;
