import type { Metadata } from "next";
import { connection } from "next/server";
import { siteDescription, siteUrl } from "@/lib/seo";
import localFont from "next/font/local";
import "./globals.css";

/** Body copy and UI. */
const dmSans = localFont({
  src: "./fonts/dm-sans-latin.woff2",
  weight: "400 700",
  variable: "--font-dm-sans",
  display: "swap",
});

/**
 * Display face. The Getz/Gilberto cover (Olga Albizu's painting is where the
 * wallpaper comes from) sets its title in Folio Extra Bold, a 1957 Bauer
 * neo-grotesque that isn't free. Archivo Black is the closest open substitute:
 * same heavy grotesque lineage, built for headlines.
 */
const archivoBlack = localFont({
  src: "./fonts/archivo-black-latin.woff2",
  weight: "400",
  variable: "--font-archivo-black",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: { default: "LOGICA @ UIC | Latinx Community in Computing", template: "%s | LOGICA @ UIC" },
  description: siteDescription,
  applicationName: "LOGICA @ UIC",
  manifest: "/manifest.webmanifest",
  // Vercel previews stay out of search results; production (both domains) is indexable, canonical points at logicauic.org.
  robots: { index: process.env.VERCEL_ENV !== "preview", follow: true },
  openGraph: {
    type: "website", locale: "en_US", siteName: "LOGICA @ UIC", url: siteUrl,
    title: "LOGICA @ UIC | Latinx Community in Computing", description: siteDescription,
    images: [{ url: "/share-image", width: 1200, height: 630, alt: "LOGICA @ UIC — Latinx Organization for Growth in Computing and Academics" }],
  },
  twitter: {
    card: "summary_large_image", title: "LOGICA @ UIC | Latinx Community in Computing",
    description: siteDescription, images: ["/share-image"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await connection();
  return (
    <html lang="en" className={`${dmSans.variable} ${archivoBlack.variable} h-full antialiased`}>
      <body className={`${dmSans.className} bg-[#000000] text-white`}>
        {children}
      </body>
    </html>
  );
}
