import type { Metadata } from "next";
import { Archivo_Black, DM_Sans } from "next/font/google";
import "./globals.css";

/** Body copy and UI. */
const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

/**
 * Display face. The Getz/Gilberto cover (Olga Albizu's painting is where the
 * wallpaper comes from) sets its title in Folio Extra Bold, a 1957 Bauer
 * neo-grotesque that isn't free. Archivo Black is the closest open substitute:
 * same heavy grotesque lineage, built for headlines.
 */
const archivoBlack = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-archivo-black",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LOGICA @ UIC",
  description:
    "Latinx Organization for Growth in Computing and Academics at the University of Illinois Chicago.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${archivoBlack.variable} h-full antialiased`}>
      <body className={`${dmSans.className} bg-[#000000] text-white`}>
        {children}
      </body>
    </html>
  );
}
