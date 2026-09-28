import type { NextConfig } from "next";

// Proxies browser calls to `backend` through this app's own origin, so the
// session cookie backend sets stays first-party — no CORS/SameSite=None
// config needed on either side.
const backendUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

const nextConfig: NextConfig = {
  async headers() {
    return [{
      source: "/:path(dashboard|profile|members|signin|speaker-signin|speaker-portal|admin|attendance|feed|forms|preview-a|preview-d|preview-hybrid|cardlab|blog)/:rest*",
      headers: [{ key: "X-Robots-Tag", value: "noindex, follow" }],
    }, {
      source: "/:section(events|speak)/:id",
      headers: [{ key: "X-Robots-Tag", value: "noindex, follow" }],
    }];
  },
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${backendUrl}/api/:path*` }];
  },
};

export default nextConfig;
