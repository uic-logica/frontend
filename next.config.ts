import type { NextConfig } from "next";

// Proxies browser calls to `backend` through this app's own origin, so the
// session cookie backend sets stays first-party — no CORS/SameSite=None
// config needed on either side.
const backendUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

const nextConfig: NextConfig = {
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${backendUrl}/api/:path*` }];
  },
};

export default nextConfig;
