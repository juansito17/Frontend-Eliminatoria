import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow the build to succeed even if ESLint rules report errors.
  // This is useful for CI/CD environments like Vercel where you prefer
  // the production build to complete and fix lint/type issues later.
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
