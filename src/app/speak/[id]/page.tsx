"use client";

import { use, useEffect, useState } from "react";
import { ClubShell, PageContainer, SectionContainer } from "@/components/club/ClubShell";
import { api } from "@/lib/api";
import { AvailabilityWindow, SpeakerForm, SpeakerFormValues } from "../SpeakerForm";

type Draft = {
  id: string;
  name: string | null;
  email: string | null;
  organization: string | null;
  referredBy: string | null;
  availability: AvailabilityWindow[] | null;
  needs: string | null;
  publicOptIn: boolean;
  submittedAt: string | null;
};

/** Private link a board member sends a specific speaker — pre-filled with whatever's already known. */
export default function SpeakerDraftPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<Draft>(`/api/speakers/${id}`)
      .then(setDraft)
      .catch((e: Error) => setError(e.message));
  }, [id]);

  let body: React.ReactNode;
  if (error) {
    body = (
      <div className="rounded-2xl bg-white/[0.02] p-8 ring-1 ring-white/10">
        <h2 className="type-h2 text-white">This link isn&apos;t valid</h2>
        <p className="mt-3 text-body text-white/70">
          Double check the link, or ask whoever sent it to you for a new one.
        </p>
      </div>
    );
  } else if (!draft) {
    body = <p className="text-body-sm text-white/50">Loading…</p>;
  } else if (draft.submittedAt) {
    body = (
      <div className="rounded-2xl bg-white/[0.02] p-8 ring-1 ring-white/10">
        <h2 className="type-h2 text-white">Already submitted</h2>
        <p className="mt-3 text-body text-white/70">
          This was already filled out. Reach out if anything needs to change.
        </p>
      </div>
    );
  } else {
    const initial: SpeakerFormValues = {
      name: draft.name ?? undefined,
      email: draft.email ?? undefined,
      organization: draft.organization ?? undefined,
      referredBy: draft.referredBy ?? undefined,
      availability: draft.availability ?? undefined,
      needs: draft.needs ?? undefined,
      publicOptIn: draft.publicOptIn,
    };
    body = <SpeakerForm initial={initial} submitPath={`/api/speakers/${id}/complete`} />;
  }

  return (
    <ClubShell>
      <PageContainer>
        <SectionContainer>
          <div className="mx-auto max-w-md">
            <h1 className="type-h1 text-white">Confirm your details</h1>
            <p className="mt-3 text-xl text-signal md:text-2xl">
              We&apos;ve got some of this already — just fill in what&apos;s left.
            </p>
          </div>
        </SectionContainer>

        <SectionContainer>
          <div className="mx-auto max-w-md">{body}</div>
        </SectionContainer>
      </PageContainer>
    </ClubShell>
  );
}
