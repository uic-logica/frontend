"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  AppShell,
  EmptyState,
  Field,
  PageHeader,
  buttonClass,
  inputClass,
} from "@/components/shell/AppShell";

type Attendance = {
  id: string;
  checkedInAt: string;
  event: { id: string; title: string };
};

/** Attendance — Cruz-Diez additive flash; large targets (Eddie §5.2 / §6.2). */
export default function AttendancePage() {
  const [history, setHistory] = useState<Attendance[] | null>(null);
  const [eventId, setEventId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState(false);
  const [busy, setBusy] = useState(false);

  function load() {
    api<Attendance[]>("/api/attendance/me")
      .then((data) => setHistory(Array.isArray(data) ? data : []))
      .catch((e: Error) => {
        setError(e.message);
        setHistory([]);
      });
  }

  useEffect(load, []);

  async function checkIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api("/api/attendance/checkin", {
        method: "POST",
        body: JSON.stringify({ eventId }),
      });
      setEventId("");
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setFlash(true);
        window.setTimeout(() => setFlash(false), 600);
      }
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  const loading = history === null;

  return (
    <AppShell>
      <PageHeader
        eyebrow="Attendance"
        title="Check in"
        description="Door-side flow: big targets, clear success. Confirmation borrows Cruz-Diez — naranja and verde meet as oro."
      />

      <div className="relative mx-auto max-w-shell px-4 py-14 md:px-6 md:py-24">
        {flash && (
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex h-24 overflow-hidden" aria-hidden>
            <div className="h-full w-1/2 bg-signal" />
            <div className="h-full w-1/2 bg-paper-dim" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="rounded-lg bg-signal px-6 py-3 type-h3 text-ink shadow-block">Checked in</span>
            </div>
          </div>
        )}

        <form onSubmit={checkIn} className="card max-w-xl border-ink p-6 shadow-block">
          <Field
            id="eventId"
            label="Event ID"
            hint="From the Events page for now — QR / code verification is future work."
          >
            <input
              id="eventId"
              required
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              className={`${inputClass} tracking-[0.12em]`}
              placeholder="Event ID"
            />
          </Field>
          <button type="submit" disabled={busy} className={`${buttonClass} mt-5 min-h-14 px-8 text-xl`}>
            {busy ? "Checking in…" : "Check in"}
          </button>
          {error && (
            <p className="mt-4 text-body-sm text-signal" role="alert">
              {error}
            </p>
          )}
        </form>

        <section className="mt-12" aria-labelledby="history-heading">
          <h2 id="history-heading" className="type-h2">
            Your history
          </h2>
          <p className="mt-2 text-body-sm text-ink-muted">
            Recent check-ins. Sign in if this list is empty because of auth.
          </p>

          {loading && <p className="mt-6 text-body text-ink-muted">Loading…</p>}

          {!loading && history.length === 0 && (
            <div className="mt-6">
              <EmptyState
                title="No check-ins yet"
                body="When you check into an event, it'll show up here with the timestamp."
                action={
                  <Link href="/events" className="type-label text-signal underline-offset-4 hover:underline">
                    Browse events →
                  </Link>
                }
              />
            </div>
          )}

          <ul className="card mt-6 divide-y divide-rule border-ink">
            {!loading &&
              history.map((a) => (
                <li key={a.id} className="flex flex-wrap items-baseline justify-between gap-2 px-5 py-4">
                  <span className="type-h4">{a.event.title}</span>
                  <span className="text-caption text-ink-muted">
                    {new Date(a.checkedInAt).toLocaleString()} · Attended
                  </span>
                </li>
              ))}
          </ul>
        </section>
      </div>
    </AppShell>
  );
}
