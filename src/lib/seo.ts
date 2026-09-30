import type { Metadata } from "next";

const configuredUrl = process.env.SITE_URL?.trim();
const defaultProductionUrl = "https://logicauic.org";
export const siteUrl = new URL(
  configuredUrl || (process.env.NODE_ENV === "production" ? defaultProductionUrl : "http://localhost:3000"),
);
if ((siteUrl.protocol !== "https:" && siteUrl.hostname !== "localhost") || siteUrl.pathname !== "/" || siteUrl.search || siteUrl.hash || siteUrl.username || siteUrl.password) {
  throw new Error("SITE_URL must be an HTTPS origin without a path, query, or credentials.");
}

export const siteDescription =
  "Join LOGICA at the University of Illinois Chicago: a community supporting Latinx students in computing through workshops, mentorship, and company visits.";

export function pageMetadata(title: string, description: string, path: string): Metadata {
  const url = new URL(path, siteUrl).href;
  const socialTitle = `${title} | LOGICA @ UIC`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: socialTitle,
      description,
      siteName: "LOGICA @ UIC",
      locale: "en_US",
      type: "website",
      url,
      images: [{ url: new URL("/share-image", siteUrl).href, width: 1200, height: 630, alt: "LOGICA @ UIC — Latinx Organization for Growth in Computing and Academics" }],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [new URL("/share-image", siteUrl).href],
    },
  };
}

export const publicPaths = ["/", "/about", "/blog", "/events", "/join", "/partner", "/privacy", "/speak", "/support", "/team", "/terms"];

export const noIndexMetadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};
