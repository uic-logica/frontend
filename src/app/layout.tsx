import type { Metadata } from "next";
import { siteDescription, siteUrl } from "@/lib/seo";
import localFont from "next/font/local";
import "./globals.css";
import "./tokens.css";

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

/** Headlines on the V4 site and dashboard (--d-serif). */
const sourceSerif = localFont({
  src: "./fonts/source-serif-4-latin.woff2",
  weight: "200 900",
  variable: "--font-serif",
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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${dmSans.variable} ${archivoBlack.variable} ${sourceSerif.variable} h-full antialiased`}>
      <head>
        {/* The dashboard's saved light/dark choice, applied before first paint
            so it never flashes the system theme. .dash and .site read it.
            Same for "signed in": the last session the api cache saw (it's
            cleared on sign-out), so the nav says Dashboard from the first frame. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              'try{var t=localStorage.getItem("logica-theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t;var s=JSON.parse(localStorage.getItem("api-cache:/api/auth/session")||"null");if(s&&s.user)document.documentElement.dataset.signedIn=""}catch(e){}',
          }}
        />
      </head>
      <body className={`${dmSans.className} bg-[#000000] text-white`}>
        {children}
      </body>
    </html>
  );
}
