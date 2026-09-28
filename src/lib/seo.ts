import type { Metadata } from "next";

// Set only on the public production deployment; leave previews unindexed.
const configuredUrl = process.env.SITE_URL?.trim();
export const siteUrl = configuredUrl ? new URL(configuredUrl) : undefined;
if (siteUrl && (siteUrl.protocol !== "https:" || siteUrl.pathname !== "/" || siteUrl.search || siteUrl.hash || siteUrl.username || siteUrl.password)) {
  throw new Error("SITE_URL must be an HTTPS origin without a path, query, or credentials.");
}

export const siteDescription =
  "Join LOGICA at the University of Illinois Chicago: a community supporting Latinx students in computing through workshops, mentorship, and company visits.";

export function pageMetadata(title: string, description: string, path: string): Metadata {
  const url = siteUrl ? new URL(path, siteUrl).href : undefined;
  const socialTitle = `${title} | LOGICA @ UIC`;
  return {
    title,
    description,
    ...(url ? { alternates: { canonical: url } } : {}),
    openGraph: {
      title: socialTitle,
      description,
      siteName: "LOGICA @ UIC",
      locale: "en_US",
      type: "website",
      ...(url ? { url, images: [{ url: new URL("/share-image", siteUrl).href, width: 1200, height: 630, alt: "LOGICA @ UIC — Latinx Organization for Growth in Computing and Academics" }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      ...(siteUrl ? { images: [new URL("/share-image", siteUrl).href] } : {}),
    },
  };
}

export const publicPaths = ["/", "/about", "/team", "/join", "/events", "/speak", "/support", "/privacy", "/terms"];
