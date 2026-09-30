import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*", allow: "/",
      disallow: [
        "/api/", "/admin", "/attendance", "/dashboard", "/feed", "/forms/",
        "/invite/", "/members", "/profile", "/signin", "/signup", "/speak/",
        "/speaker-portal", "/speaker-signin/",
      ],
    },
    sitemap: new URL("/sitemap.xml", siteUrl).href,
    host: siteUrl.origin,
  };
}
