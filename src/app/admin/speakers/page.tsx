"use client";

import { useEffect, useState } from "react";
import { AppShell, PageHeader, buttonClass } from "@/components/shell/AppShell";
import { ApiError, api } from "@/lib/api";

type Submission = {
  id: string;
  name: string | null;
  email: string | null;
  organization: string | null;
  referredBy: string | null;
  status: "PENDING" | "CONFIRMED" | "DECLINED";
  submittedAt: string | null;
  user: { id: string; username: string | null; linkedin: string | null; resumeFilename: string | null } | null;
};

/** Board+ only — everyone who's signed up to speak: status, LinkedIn, resume, invite-to-portal. */
export default function AdminSpeakersPage() {
  const [submissions, setSubmissions] = useState<Submission[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);

  function load() {
    api<Submission[]>("/api/speakers")
      .then(setSubmissions)
      .catch((e: unknown) => {
        if (e instanceof ApiError && (e.status === 401 || e.status === 403)) setForbidden(true);
      });
  }
  useEffect(load, []);

  async function setStatus(id: string, status: "CONFIRMED" | "DECLINED") {
    setError(null);
    try {
      await api(`/api/speakers/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  async function invite(id: string) {
    setError(null);
    try {
      const result = await api<{ username: string }>(`/api/speakers/${id}/invite`, { method: "POST" });
      window.alert(`Invited — username: ${result.username}. They'll also get it by email.`);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <AppShell>
      <PageHeader
        eyebrow="Board · admin"
        title="Speakers"
        description="Everyone who's signed up to speak — confirm, decline, and invite confirmed speakers to the portal."
      />

      <div className="mx-auto max-w-shell px-4 py-14 md:px-6 md:py-24">
        {forbidden && (
          <p className="text-body text-ink-muted">Board access required to view this page.</p>
        )}
        {error && <p className="mb-4 text-body-sm text-signal">{error}</p>}

        {submissions === null && !forbidden && <p className="text-body text-ink-muted">Loading…</p>}
        {submissions?.length === 0 && <p className="text-body text-ink-muted">No submissions yet.</p>}

        {submissions && submissions.length > 0 && (
          <ul className="flex flex-col gap-4">
            {submissions.map((s) => (
              <li key={s.id} className="card border-ink p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="type-h4">{s.name?.trim() || "(no name yet)"}</p>
                    <p className="mt-1 text-body-sm text-ink-muted">
                      {[s.email, s.organization].filter(Boolean).join(" · ") || "No contact info yet"}
                    </p>
                    {s.referredBy && <p className="mt-1 text-caption text-ink-muted">Referred by {s.referredBy}</p>}
                    <div className="mt-2 flex flex-wrap gap-3 text-caption">
                      {s.user?.linkedin && (
                        <a href={s.user.linkedin} target="_blank" rel="noreferrer" className="font-bold text-signal hover:underline">
                          LinkedIn
                        </a>
                      )}
                      {s.user?.resumeFilename && (
                        <a
                          href={`/api/resume/${s.user.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-bold text-signal hover:underline"
                        >
                          Resume ({s.user.resumeFilename})
                        </a>
                      )}
                      {s.user?.username && <span className="text-ink-muted">Portal: {s.user.username}</span>}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span className="type-label">{s.status}</span>
                    <div className="flex flex-wrap gap-2">
                      {s.status !== "CONFIRMED" && (
                        <button type="button" className={buttonClass} onClick={() => setStatus(s.id, "CONFIRMED")}>
                          Confirm
                        </button>
                      )}
                      {s.status !== "DECLINED" && (
                        <button
                          type="button"
                          className="type-label text-ink-muted underline-offset-4 hover:text-signal hover:underline"
                          onClick={() => setStatus(s.id, "DECLINED")}
                        >
                          Decline
                        </button>
                      )}
                      {s.status === "CONFIRMED" && !s.user && (
                        <button type="button" className={buttonClass} onClick={() => invite(s.id)}>
                          Invite to portal
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppShell>
  );
}
