"use client";

import { useState } from "react";
import { darkButtonClass, darkInputClass } from "@/components/ui/darkForm";
import { api } from "@/lib/api";

export type AvailabilityWindow = {
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
};

const EMPTY_WINDOW: AvailabilityWindow = { startDate: "", endDate: "", startTime: "", endTime: "" };

export type SpeakerFormValues = {
  name?: string;
  email?: string;
  organization?: string;
  referredBy?: string;
  availability?: AvailabilityWindow[];
  needs?: string;
  note?: string;
  publicOptIn?: boolean;
};

/** Marks a label as required — a red asterisk reads clearer than an "(optional)" tag on everything else. */
function Required() {
  return (
    <span className="text-signal" aria-hidden>
      {" "}
      *
    </span>
  );
}

/**
 * Shared by /speak (fresh, fills out everything) and /speak/[id] (a draft a
 * board member started — whatever's already known comes in via `initial`).
 */
export function SpeakerForm({
  initial,
  submitPath,
  submittedTitle = "Thanks — we'll be in touch",
  submittedBody = "We got your info and availability. A board member will follow up to confirm.",
}: {
  initial?: SpeakerFormValues;
  submitPath: string;
  submittedTitle?: string;
  submittedBody?: string;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [organization, setOrganization] = useState(initial?.organization ?? "");
  const [referredBy, setReferredBy] = useState(initial?.referredBy ?? "");
  const [windows, setWindows] = useState<AvailabilityWindow[]>(
    initial?.availability?.length ? initial.availability : [EMPTY_WINDOW],
  );
  const [needs, setNeeds] = useState(initial?.needs ?? "");
  const [note, setNote] = useState(initial?.note ?? "");
  const [publicOptIn, setPublicOptIn] = useState(initial?.publicOptIn ?? false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function updateWindow(i: number, field: keyof AvailabilityWindow, value: string) {
    setWindows((prev) => prev.map((w, idx) => (idx === i ? { ...w, [field]: value } : w)));
  }

  function removeWindow(i: number) {
    setWindows((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const filled = windows.filter((w) => w.startDate && w.endDate && w.startTime && w.endTime);
    if (filled.length === 0) {
      setError("Add at least one day/time range you're available.");
      return;
    }

    setBusy(true);
    try {
      await api(submitPath, {
        method: "POST",
        body: JSON.stringify({
          name: name.trim() || undefined,
          email: email.trim() || undefined,
          organization: organization.trim() || undefined,
          referredBy: referredBy.trim() || undefined,
          availability: filled,
          needs: needs.trim() || undefined,
          note: note.trim() || undefined,
          publicOptIn,
        }),
      });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-2xl bg-white/[0.02] p-8 ring-1 ring-white/10">
        <h2 className="type-h2 text-white">{submittedTitle}</h2>
        <p className="mt-3 text-body text-white">{submittedBody}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-2xl bg-white/[0.02] p-6 ring-1 ring-white/10 sm:p-8" noValidate>
      {error && (
        <div className="mb-6 border-2 border-signal bg-signal/10 px-4 py-3 text-body-sm text-white" role="alert">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="type-label text-white">
            Name
            <Required />
          </label>
          <input id="name" required value={name} onChange={(e) => setName(e.target.value)} className={darkInputClass} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="type-label text-white">
            Email
            <Required />
          </label>
          <p className="text-caption text-white">We&apos;ll send confirmation details here.</p>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={darkInputClass}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="organization" className="type-label text-white">
            Company / organization
          </label>
          <input
            id="organization"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            className={darkInputClass}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="referredBy" className="type-label text-white">
            Who from LOGICA reached out to you?
          </label>
          <input
            id="referredBy"
            placeholder="e.g. Nicolas, Diego"
            value={referredBy}
            onChange={(e) => setReferredBy(e.target.value)}
            className={darkInputClass}
          />
        </div>

        <div className="flex flex-col gap-3">
          <span className="type-label text-white">
            When are you available?
            <Required />
          </span>
          {windows.map((w, i) => (
            <div key={i} className="flex flex-col gap-2 border border-white/10 p-4">
              <div className="flex items-center justify-between">
                <span className="text-caption text-white">Window {i + 1}</span>
                {windows.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeWindow(i)}
                    aria-label="Remove this window"
                    className="text-white hover:text-signal"
                  >
                    ×
                  </button>
                )}
              </div>

              <span className="text-caption text-white">From this day</span>
              <input
                type="date"
                value={w.startDate}
                onChange={(e) => updateWindow(i, "startDate", e.target.value)}
                className={darkInputClass}
              />
              <span className="text-caption text-white">To this day</span>
              <input
                type="date"
                value={w.endDate}
                onChange={(e) => updateWindow(i, "endDate", e.target.value)}
                className={darkInputClass}
              />
              <span className="text-caption text-white">From this time</span>
              <input
                type="time"
                value={w.startTime}
                onChange={(e) => updateWindow(i, "startTime", e.target.value)}
                className={darkInputClass}
              />
              <span className="text-caption text-white">To this time</span>
              <input
                type="time"
                value={w.endTime}
                onChange={(e) => updateWindow(i, "endTime", e.target.value)}
                className={darkInputClass}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => setWindows((prev) => [...prev, EMPTY_WINDOW])}
            className="type-label self-start text-signal underline-offset-4 hover:underline"
          >
            + Add another window
          </button>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="needs" className="type-label text-white">
            What do you need from us?
          </label>
          <p className="text-caption text-white">AV equipment, snacks, room setup, anything else.</p>
          <textarea
            id="needs"
            rows={3}
            value={needs}
            onChange={(e) => setNeeds(e.target.value)}
            className={`${darkInputClass} min-h-[5rem] py-3`}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="note" className="type-label text-white">
            Anything else to add?
          </label>
          <p className="text-caption text-white">
            e.g. &ldquo;Can&apos;t make Wednesday, Thursday works instead.&rdquo;
          </p>
          <textarea
            id="note"
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className={`${darkInputClass} min-h-[3.5rem] py-3`}
          />
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className="type-label text-white">OK to list you publicly on the LOGICA site once confirmed?</legend>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-body-sm text-white">
              <input
                type="radio"
                name="publicOptIn"
                checked={publicOptIn === true}
                onChange={() => setPublicOptIn(true)}
                className="h-4 w-4 accent-signal"
              />
              Yes
            </label>
            <label className="flex items-center gap-2 text-body-sm text-white">
              <input
                type="radio"
                name="publicOptIn"
                checked={publicOptIn === false}
                onChange={() => setPublicOptIn(false)}
                className="h-4 w-4 accent-signal"
              />
              No
            </label>
          </div>
        </fieldset>

        <button type="submit" disabled={busy} className={darkButtonClass}>
          {busy ? "Sending…" : "Submit"}
        </button>
      </div>
    </form>
  );
}
