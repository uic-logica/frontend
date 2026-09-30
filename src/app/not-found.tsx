import Link from "next/link";
import { ClubShell, PageContainer, SectionContainer } from "@/components/club/ClubShell";

export default function NotFound() {
  return (
    <ClubShell>
      <PageContainer>
        <SectionContainer>
          <div className="mx-auto max-w-md">
            <p className="type-label text-signal">404</p>
            <h1 className="mt-3 type-title text-3xl md:text-4xl text-white">This page doesn&apos;t exist.</h1>
            <p className="mt-4 text-body text-white">The link may be old or mistyped.</p>
            <Link href="/" className="mt-8 inline-flex min-h-12 items-center rounded-full bg-[#b63814] px-6 text-lg font-semibold text-white">
              Back to LOGICA
            </Link>
          </div>
        </SectionContainer>
      </PageContainer>
    </ClubShell>
  );
}
