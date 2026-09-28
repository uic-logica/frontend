import { pageMetadata } from "@/lib/seo";

export const metadata = { ...pageMetadata("Blog", "Updates on what the LOGICA computing community at UIC is building, learning, and sharing.", "/blog"), robots: { index: false, follow: true } };

import Link from "next/link";
import { ClubShell, PageContainer, SectionContainer } from "@/components/club/ClubShell";

export default function BlogPage() {
  return (
    <ClubShell>
      <PageContainer>
        <SectionContainer>
          <h1 className="type-title text-3xl md:text-4xl text-white">Blog</h1>
          <p className="mt-4 max-w-3xl text-body-lg text-white">
            What we&apos;re building, learning, and sharing.
          </p>
        </SectionContainer>
        <SectionContainer>
          <div className="club-card w-fit max-w-xl p-8">
            <h2 className="type-h3 text-white">No posts yet</h2>
            <p className="mt-3 text-body text-white">Check back soon — or explore events in the meantime.</p>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link href="/events" className="blog-events-link inline-flex items-center gap-1.5 font-semibold text-signal hover:underline">
                Events
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
            </div>
          </div>
        </SectionContainer>
      </PageContainer>
    </ClubShell>
  );
}
