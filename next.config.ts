import type { NextConfig } from "next";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";

// One hash of every painting in public/journey. The pages append it as ?v=,
// so the paintings can be cached forever: replacing a file changes the hash,
// which changes the URL, so nobody ever sees a stale painting.
const artVersion = createHash("sha1")
  .update(readdirSync("public/journey").sort().map((f) => readFileSync(`public/journey/${f}`)).join(""))
  .digest("hex")
  .slice(0, 10);

// Logos, team photos, sponsor marks: cached for a day, then served from cache
// while the browser quietly revalidates in the background for up to 30 days.
const assetCache = "public, max-age=86400, stale-while-revalidate=2592000";

// Proxies browser calls to `backend` through this app's own origin, so the
// session cookie backend sets stays first-party — no CORS/SameSite=None
// config needed on either side.
const backendUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

const nextConfig: NextConfig = {
  env: { NEXT_PUBLIC_ART_VERSION: artVersion },
  // next/image's optimized copies (team photos, logos) live 30 days instead of the default 4 hours.
  images: { minimumCacheTTL: 2592000 },
  async headers() {
    return [{
      source: "/journey/:file*",
      headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
    }, {
      source: "/:dir(sponsors|team)/:file*",
      headers: [{ key: "Cache-Control", value: assetCache }],
    }, {
      source: "/:file([^/]+\\.(?:png|svg|jpg|jpeg|webp|ico))",
      headers: [{ key: "Cache-Control", value: assetCache }],
    }, {
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
