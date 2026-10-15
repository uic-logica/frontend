import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Partner with LOGICA",
  "Partner with LOGICA at UIC through company visits, technical workshops, guest talks, and student sponsorships.",
  "/partner",
);

export default function PartnerLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
