import Link from "next/link";
import { ClubShell, PageContainer, SectionContainer } from "@/components/club/ClubShell";

export default function BlogPage() {
  return (
    <ClubShell>
      <PageContainer>
        <SectionContainer>
          <h1 className="text-3xl font-bold md:text-4xl text-white">Blog</h1>
          <p className="mt-4 max-w-3xl text-body-lg text-white">
            What we&apos;re building, learning, and sharing.
          </p>
        </SectionContainer>
        <SectionContainer>
          <div className="border border-white/20 p-8">
            <h2 className="type-h3 text-white">No posts yet</h2>
            <p className="mt-3 text-body text-white">Check back soon — or explore events in the meantime.</p>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link href="/events" className="font-semibold text-signal hover:underline">
                Events
              </Link>
            </div>
          </div>
        </SectionContainer>
      </PageContainer>
    </ClubShell>
  );
}
