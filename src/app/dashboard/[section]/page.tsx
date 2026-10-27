import { sections } from "@/components/dashboard/types";

// One prerendered shell per section, served from the CDN like /dashboard.
export function generateStaticParams() {
  return sections.map((section) => ({ section }));
}

export default function Page() {
  return null; // the shell in ../../layout.tsx renders every section
}
