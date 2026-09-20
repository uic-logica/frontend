"use client";

import { use, useEffect, useState } from "react";
import { ClubShell, PageContainer, SectionContainer } from "@/components/club/ClubShell";
import { ApiError, api } from "@/lib/api";
import { AvailabilityWindow, SpeakerForm, SpeakerFormValues } from "../SpeakerForm";

type Draft = {
  id: string;
  name: string | null;
  email: string | null;
  organization: string | null;
  referredBy: string | null;
  availability: AvailabilityWindow[] | null;
  needs: string | null;
  note: string | null;
  publicOptIn: boolean;
};

type LoadState = { kind: "loading" } | { kind: "invalid" } | { kind: "submitted" } | { kind: "ready"; draft: Draft };

/** Private link a board member sends a specific speaker — pre-filled with whatever's already known. */
export default function SpeakerDraftPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [state, setState] = useState<LoadState>({ kind: "loading" });

  useEffect(() => {
    api<Draft>(`/api/speakers/${id}`)
      .then((draft) => setState({ kind: "ready", draft }))
      .catch((e: unknown) => {
        if (e instanceof ApiError && e.status === 410) {
          setState({ kind: "submitted" });
        } else {
          setState({ kind: "invalid" });
        }
      });
  }, [id]);

  let body: React.ReactNode;
  if (state.kind === "loading") {
    body = <p className="text-body-sm text-white">Loading…</p>;
  } else if (state.kind === "invalid") {
    body = (
      <div className="club-card w-fit max-w-xl bg-white/[0.02] p-8">
        <h2 className="type-h2 text-white">This link isn&apos;t valid</h2>
        <p className="mt-3 text-body text-white">
          Double check the link, or ask whoever sent it to you for a new one.
        </p>
      </div>
    );
  } else if (state.kind === "submitted") {
    body = (
      <div className="club-card w-fit max-w-xl bg-white/[0.02] p-8">
        <h2 className="type-h2 text-white">Already submitted</h2>
        <p className="mt-3 text-body text-white">
          This was already filled out. Reach out if anything needs to change.
        </p>
      </div>
    );
  } else {
    const { draft } = state;
    const initial: SpeakerFormValues = {
      name: draft.name ?? undefined,
      email: draft.email ?? undefined,
      organization: draft.organization ?? undefined,
      referredBy: draft.referredBy ?? undefined,
      availability: draft.availability ?? undefined,
      needs: draft.needs ?? undefined,
      note: draft.note ?? undefined,
      publicOptIn: draft.publicOptIn,
    };
    body = <SpeakerForm initial={initial} submitPath={`/api/speakers/${id}/complete`} />;
  }

  return (
    <ClubShell>
      <PageContainer>
        <SectionContainer>
          <div className="mx-auto max-w-md">
            <h1 className="text-3xl font-bold md:text-4xl text-white">Confirm your details</h1>
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
