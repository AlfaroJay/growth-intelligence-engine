import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Allow longer function execution for audit jobs (Vercel Pro supports up to 60s)
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
