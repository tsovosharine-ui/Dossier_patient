import type { NextConfig } from 'next';

/** Cible du proxy `/api/backend/*` → API Nest (évite CORS / mixed content si le front est en HTTPS). */
const backendTarget =
  process.env.BACKEND_PROXY_TARGET?.trim() || 'http://127.0.0.1:3001';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        destination: `${backendTarget.replace(/\/$/, '')}/:path*`,
      },
    ];
  },
};

export default nextConfig;
