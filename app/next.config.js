/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: { 
    domains: ['lh3.googleusercontent.com'],
    unoptimized: true 
  },
};

module.exports = nextConfig;
