/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ignore ESLint errors during builds
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Ignore TypeScript errors during builds
  typescript: {
    ignoreBuildErrors: true,
  },
  // Remove experimental.forceSwcTransforms as it's not supported by Turbopack
}

module.exports = nextConfig
