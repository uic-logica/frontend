"use client";

import { use, useEffect, useState } from "react";
import { ClubShell } from "@/components/club/ClubShell";
import { SiteIcon } from "@/components/site/icons";
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

/** Private link a board member sends a specific speaker, pre-filled with whatever's already known. */
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
    body = <p className="site-muted" role="status">Loading…</p>;
  } else if (state.kind === "invalid") {
    body = (
      <div className="site-card speak-card">
        <span className="site-check bad" aria-hidden="true"><SiteIcon name="close" size={20} /></span>
        <h2 className="serif">This link isn&apos;t valid</h2>
        <p className="site-muted">Double check the link, or ask whoever sent it to you for a new one.</p>
      </div>
    );
  } else if (state.kind === "submitted") {
    body = (
      <div className="site-card speak-card">
        <span className="site-check info" aria-hidden="true"><SiteIcon name="check" size={20} /></span>
        <h2 className="serif">Already submitted</h2>
        <p className="site-muted">This was already filled out. Reach out if anything needs to change.</p>
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
      <main className="site-page speak-draft">
        <header className="site-page-head">
          <h1 className="serif">Confirm your details</h1>
          <p className="speak-lead serif">We&apos;ve got some of this already. Just fill in what&apos;s left.</p>
          {state.kind === "ready" && (
            <p className="speak-prefilled">Some details are filled in. The form below is the same as /speak.</p>
          )}
        </header>
        {body}
      </main>
    </ClubShell>
  );
}
