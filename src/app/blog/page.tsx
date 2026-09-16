import Link from "next/link";
import { ClubShell, Section } from "@/components/club/ClubShell";

export default function BlogPage() {
  return (
    <ClubShell>
      <div className="mb-20 pt-16 sm:pt-20 lg:pt-24">
        <Section>
          <h1 className="text-3xl font-bold text-white md:text-4xl lg:text-5xl">Blog</h1>
          <p className="mt-4 max-w-3xl text-lg text-white/80">
            What we&apos;re building, learning, and sharing.
          </p>
        </Section>
        <Section>
          <div className="border border-white/20 p-8">
            <h2 className="text-2xl font-bold text-white">No posts yet</h2>
            <p className="mt-3 text-white/70">Check back soon — or explore events in the meantime.</p>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link href="/events" className="font-semibold text-signal hover:underline">
                Events
              </Link>
            </div>
          </div>
        </Section>
      </div>
    </ClubShell>
  );
}
