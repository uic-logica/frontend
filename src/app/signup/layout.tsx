import { noIndexMetadata } from "@/lib/seo";

// Private or auth-only: keep it out of search results.
export const metadata = noIndexMetadata;

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
