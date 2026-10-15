import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("Blog", "Updates on what the LOGICA computing community at UIC is building, learning, and sharing.", "/blog");

import Link from "next/link";
import { ClubShell } from "@/components/club/ClubShell";

/** Layout is logica.pen V4 "06 Blog" (the empty state; there's no posts source yet). */
export default function BlogPage() {
  return (
    <ClubShell>
      <main className="site-page">
        <header className="site-page-head">
          <h1 className="serif">Blog</h1>
        </header>
        <section className="site-card blog-empty">
          <span className="blog-empty-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9M16.4 3.6a2 2 0 0 1 2.9 2.9L7.5 18.3 3.5 19.5l1.2-4z" />
            </svg>
          </span>
          <h2 className="serif">No posts yet</h2>
          <p>Check back soon, or see what&apos;s coming up in the meantime.</p>
          <Link href="/events" className="site-btn secondary">See events</Link>
        </section>
      </main>
    </ClubShell>
  );
}
