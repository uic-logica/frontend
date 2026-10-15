import type { Metadata } from "next";
import { Archivo_Black, DM_Sans, Source_Serif_4 } from "next/font/google";
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

/** Workspace page titles — the dashboard's one serif voice. */
const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-serif",
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
    <html lang="en" suppressHydrationWarning className={`${dmSans.variable} ${archivoBlack.variable} ${sourceSerif.variable} h-full antialiased`}>
      <head>
        {/* The dashboard's saved light/dark choice, applied before first paint
            so it never flashes the system theme. Only .dash reads it. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              'try{var t=localStorage.getItem("logica-theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}',
          }}
        />
      </head>
      <body className={`${dmSans.className} bg-[#000000] text-white`}>
        {children}
      </body>
    </html>
  );
}
