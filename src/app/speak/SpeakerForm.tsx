"use client";

import { useState } from "react";
import { SiteIcon } from "@/components/site/icons";
import { api } from "@/lib/api";
import { availabilityProblem } from "@/lib/availability";

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

/** Marks a label as required: an asterisk reads clearer than an "(optional)" tag on everything else. */
function Required() {
  return <span className="site-req" aria-hidden> *</span>;
}

/**
 * Shared by /speak (fresh, fills out everything) and /speak/[id] (a draft a
 * board member started; whatever's already known comes in via `initial`).
 */
export function SpeakerForm({
  initial,
  submitPath,
  submittedTitle = "Thanks, we'll be in touch",
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

    const problem = availabilityProblem(windows);
    if (problem) {
      setError(problem);
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
          availability: windows,
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
      <div className="site-card speak-card" role="status">
        <span className="site-check" aria-hidden="true"><SiteIcon name="check" size={20} /></span>
        <h2 className="serif">{submittedTitle}</h2>
        <p className="site-muted">{submittedBody}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="site-card speak-card site-form" noValidate>
      <h2 className="serif">RSVP to speak</h2>
      {error && <p className="site-error" role="alert">{error}</p>}

      <label className="site-field" htmlFor="name">
        <span>Name<Required /></span>
        <input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
      </label>

      <label className="site-field" htmlFor="email">
        <span>Email<Required /></span>
        <small>We&apos;ll send confirmation details here.</small>
        <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>

      <label className="site-field" htmlFor="organization">
        <span>Company / organization</span>
        <input id="organization" value={organization} onChange={(e) => setOrganization(e.target.value)} />
      </label>

      <label className="site-field" htmlFor="referredBy">
        <span>Who from LOGICA reached out to you?</span>
        <input id="referredBy" placeholder="e.g. Nicolas, Diego" value={referredBy} onChange={(e) => setReferredBy(e.target.value)} />
      </label>

      <fieldset className="site-field speak-windows">
        <legend className="site-label">When are you available?<Required /></legend>
        {windows.map((w, i) => (
          <div key={i} className="speak-window">
            <div className="speak-window-head">
              <span>Window {i + 1}</span>
              {windows.length > 1 && (
                <button type="button" onClick={() => removeWindow(i)} aria-label={`Remove window ${i + 1}`}>
                  <SiteIcon name="close" />
                </button>
              )}
            </div>
            <div className="site-form-row">
              <label className="site-field">
                <small>From this day</small>
                <input type="date" value={w.startDate} onChange={(e) => updateWindow(i, "startDate", e.target.value)} />
              </label>
              <label className="site-field">
                <small>To this day</small>
                <input type="date" value={w.endDate} onChange={(e) => updateWindow(i, "endDate", e.target.value)} />
              </label>
            </div>
            <div className="site-form-row">
              <label className="site-field">
                <small>From this time</small>
                <input type="time" value={w.startTime} onChange={(e) => updateWindow(i, "startTime", e.target.value)} />
              </label>
              <label className="site-field">
                <small>To this time</small>
                <input type="time" value={w.endTime} onChange={(e) => updateWindow(i, "endTime", e.target.value)} />
              </label>
            </div>
          </div>
        ))}
        <button type="button" onClick={() => setWindows((prev) => [...prev, EMPTY_WINDOW])} className="site-btn secondary sm speak-add">
          <SiteIcon name="plus" size={14} /> Add another window
        </button>
      </fieldset>

      <label className="site-field" htmlFor="needs">
        <span>What do you need from us?</span>
        <small>AV equipment, snacks, room setup, anything else.</small>
        <textarea id="needs" rows={3} value={needs} onChange={(e) => setNeeds(e.target.value)} />
      </label>

      <label className="site-field" htmlFor="note">
        <span>Anything else to add?</span>
        <small>e.g. &ldquo;Can&apos;t make Wednesday, Thursday works instead.&rdquo;</small>
        <textarea id="note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
      </label>

      <fieldset className="site-field speak-optin">
        <legend className="site-label">OK to list you publicly on the LOGICA site once confirmed?</legend>
        <div>
          <label><input type="radio" name="publicOptIn" checked={publicOptIn === true} onChange={() => setPublicOptIn(true)} /> Yes</label>
          <label><input type="radio" name="publicOptIn" checked={publicOptIn === false} onChange={() => setPublicOptIn(false)} /> No</label>
        </div>
      </fieldset>

      <button type="submit" disabled={busy} className="site-btn block">{busy ? "Sending…" : "Submit"}</button>
    </form>
  );
}
