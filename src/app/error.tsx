"use client"; // error boundaries must be client components

import Link from "next/link";
import { useEffect } from "react";
import { ClubShell, PageContainer, SectionContainer } from "@/components/club/ClubShell";

export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => console.error(error), [error]);
  return (
    <ClubShell>
      <PageContainer>
        <SectionContainer>
          <div className="mx-auto max-w-md" role="alert">
            <h1 className="type-title text-3xl md:text-4xl text-white">Something went wrong.</h1>
            <p className="mt-4 text-body text-white">Try again, or head back home. If it keeps happening, email logica@uic.edu.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button type="button" onClick={() => retry()} className="inline-flex min-h-12 items-center rounded-full bg-[#b63814] px-6 text-lg font-semibold text-white">
                Try again
              </button>
              <Link href="/" className="inline-flex min-h-12 items-center rounded-full border border-white/40 px-6 text-lg font-semibold text-white">
                Back to LOGICA
              </Link>
            </div>
          </div>
        </SectionContainer>
      </PageContainer>
    </ClubShell>
  );
}
