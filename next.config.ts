import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdfjs-dist ships a canvas fallback for Node that we never use in the
  // browser bundle. Without this, webpack tries to resolve the native
  // `canvas` addon and fails the build.
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };
    return config;
  },
  serverExternalPackages: ["@prisma/client", "bcryptjs"],
};

export default nextConfig;
// Force Next.js dev server restart to reload Prisma Client
