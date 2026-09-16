"use client";

import { useEffect, useState } from "react";
import { ClubShell, PageContainer, SectionContainer } from "@/components/club/ClubShell";
import { darkButtonClass, darkInputClass, darkInputErrorClass } from "@/components/ui/darkForm";
import { api } from "@/lib/api";

type PublicSpeaker = { id: string; name: string; organization: string | null };

/** Speaker/guest intake — public, no sign-in. Send this link to a prospective speaker. */
export default function SpeakPage() {
  const [speakers, setSpeakers] = useState<PublicSpeaker[] | null>(null);

  useEffect(() => {
    api<PublicSpeaker[]>("/api/speakers/public")
      .then(setSpeakers)
      .catch(() => setSpeakers([]));
  }, []);

  return (
    <ClubShell>
      <PageContainer>
        <SectionContainer className="max-w-2xl">
          <h1 className="type-h1 text-white">Speak at LOGICA</h1>
          <p className="mt-3 text-xl text-signal md:text-2xl">
            Tell us you&apos;re interested — we&apos;ll follow up to confirm details.
          </p>
          <p className="mt-6 text-body text-white/70">
            If someone from LOGICA reached out to you about speaking, RSVP here with your
            availability and what you&apos;ll need. No account required.
          </p>
        </SectionContainer>

        <SectionContainer className="max-w-2xl">
          <h2 className="type-h3 text-white">Confirmed speakers</h2>
          {speakers === null && <p className="mt-3 text-body-sm text-white/50">Loading…</p>}
          {speakers?.length === 0 && (
            <p className="mt-3 text-body-sm text-white/50">Nobody confirmed yet — check back soon.</p>
          )}
          {speakers && speakers.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-3">
              {speakers.map((s) => (
                <li
                  key={s.id}
                  className="rounded-full border border-white/15 px-4 py-1.5 text-body-sm text-white/80"
                >
                  {s.name}
                  {s.organization ? ` · ${s.organization}` : ""}
                </li>
              ))}
            </ul>
          )}
        </SectionContainer>

        <SectionContainer className="max-w-2xl">
          <SpeakerForm />
        </SectionContainer>
      </PageContainer>
    </ClubShell>
  );
}

function SpeakerForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [referredBy, setReferredBy] = useState("");
  const [dates, setDates] = useState<string[]>([""]);
  const [needs, setNeeds] = useState("");
  const [publicOptIn, setPublicOptIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function setDate(i: number, value: string) {
    setDates((prev) => prev.map((d, idx) => (idx === i ? value : d)));
  }

  function removeDate(i: number) {
    setDates((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const availability = dates.filter((d) => d.trim().length > 0);
    if (availability.length === 0) {
      setError("Add at least one day you're available.");
      return;
    }

    setBusy(true);
    try {
      await api("/api/speakers", {
        method: "POST",
        body: JSON.stringify({
          name,
          email,
          organization: organization.trim() || undefined,
          referredBy,
          availability,
          needs: needs.trim() || undefined,
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
      <div className="rounded-2xl bg-white/[0.02] p-8 ring-1 ring-white/10 md:p-10">
        <h2 className="type-h2 text-white">Thanks — we&apos;ll be in touch</h2>
        <p className="mt-3 text-body text-white/70">
          We got your info and availability. A board member will follow up to confirm.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl bg-white/[0.02] p-8 ring-1 ring-white/10 md:p-10"
      noValidate
    >
      {error && (
        <div className="mb-6 border-2 border-signal bg-signal/10 px-4 py-3 text-body-sm text-white" role="alert">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="type-label text-white/70">
              Name
            </label>
            <input
              id="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={darkInputClass}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="type-label text-white/70">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={darkInputClass}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="organization" className="type-label text-white/70">
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
          <label htmlFor="referredBy" className="type-label text-white/70">
            Who from LOGICA reached out to you?
          </label>
          <input
            id="referredBy"
            required
            placeholder="e.g. Nicolas, Diego"
            value={referredBy}
            onChange={(e) => setReferredBy(e.target.value)}
            className={darkInputClass}
          />
        </div>

        <div className="flex flex-col gap-2">
          <span className="type-label text-white/70">When are you available?</span>
          {dates.map((d, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="date"
                value={d}
                onChange={(e) => setDate(i, e.target.value)}
                className={error && dates.every((x) => !x.trim()) ? darkInputErrorClass : darkInputClass}
              />
              {dates.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeDate(i)}
                  aria-label="Remove this date"
                  className="text-white/50 hover:text-signal"
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => setDates((prev) => [...prev, ""])}
            className="type-label mt-1 self-start text-signal underline-offset-4 hover:underline"
          >
            + Add another day
          </button>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="needs" className="type-label text-white/70">
            What do you need from us?
          </label>
          <p className="text-caption text-white/40">AV equipment, snacks, room setup, anything else.</p>
          <textarea
            id="needs"
            rows={3}
            value={needs}
            onChange={(e) => setNeeds(e.target.value)}
            className={`${darkInputClass} min-h-[5rem] py-3`}
          />
        </div>

        <label className="flex items-center gap-2 text-body-sm text-white/70">
          <input
            type="checkbox"
            checked={publicOptIn}
            onChange={(e) => setPublicOptIn(e.target.checked)}
            className="h-4 w-4 accent-signal"
          />
          OK to list me publicly on the LOGICA site once confirmed
        </label>

        <button type="submit" disabled={busy} className={darkButtonClass}>
          {busy ? "Sending…" : "Submit"}
        </button>
      </div>
    </form>
  );
}
