import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
    
  },
  basePath:process.env.VITE_BASE_PATH || '/SuryaR01/KanbanBoard'
};

export default nextConfig;
