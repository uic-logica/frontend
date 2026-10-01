import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("Blog", "Updates on what the LOGICA computing community at UIC is building, learning, and sharing.", "/blog");

import Link from "next/link";
import { ClubShell } from "@/components/club/ClubShell";

/** Layout is logica.pen V3 "05 · Blog" (desktop and mobile). */
export default function BlogPage() {
  return (
    <ClubShell>
      <main className="site-page">
        <header className="page-head">
          <h1>Blog</h1>
          <p>What we&apos;re building, learning, and sharing.</p>
        </header>
        <section className="blog-empty page-card glass">
          <h2>No posts yet</h2>
          <p>Check back soon — or explore events in the meantime.</p>
          <Link href="/events" className="page-link">Events →</Link>
        </section>
      </main>
    </ClubShell>
  );
}
