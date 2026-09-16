import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

/** Match yalecomputersociety.org — DM Sans throughout (no separate display face). */
const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
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
    <html lang="en" className={`${dmSans.variable} h-full antialiased`}>
      <body className={`${dmSans.className} bg-[#000000] text-white`}>
        {children}
      </body>
    </html>
  );
}
