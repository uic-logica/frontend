"use client";

import { useEffect, useState } from "react";
import { ClubShell, PageContainer, SectionContainer } from "@/components/club/ClubShell";
import { darkButtonClass, darkInputClass } from "@/components/ui/darkForm";
import { api } from "@/lib/api";
import { SpeakerForm } from "./SpeakerForm";

type PublicSpeaker = { id: string; name: string; organization: string | null };
type Profile = { role: string; name: string | null };

/** Speaker/guest intake — public, no sign-in. Send this link to a prospective speaker. */
export default function SpeakPage() {
  const [speakers, setSpeakers] = useState<PublicSpeaker[] | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    api<PublicSpeaker[]>("/api/speakers/public")
      .then(setSpeakers)
      .catch(() => setSpeakers([]));
    api<Profile>("/api/profile")
      .then(setProfile)
      .catch(() => setProfile(null));
  }, []);

  const isBoard = profile?.role === "BOARD" || profile?.role === "EXEC_BOARD";

  return (
    <ClubShell>
      <PageContainer>
        <SectionContainer>
          <div className="mx-auto max-w-md">
            <h1 className="type-title text-3xl md:text-4xl text-white">Speak at LOGICA</h1>
            <p className="mt-3 text-xl text-signal md:text-2xl">
              Tell us you&apos;re interested — we&apos;ll follow up to confirm details.
            </p>
            <p className="mt-6 text-body text-white">
              If someone from LOGICA reached out to you about speaking, RSVP here with your
              availability and what you&apos;ll need. No account required.
            </p>
          </div>
        </SectionContainer>

        <SectionContainer>
          <div className="mx-auto max-w-md">
            <h2 className="type-h3 text-white">Confirmed speakers</h2>
            {speakers === null && <p className="mt-3 text-body-sm text-white">Loading…</p>}
            {speakers?.length === 0 && (
              <p className="mt-3 text-body-sm text-white">Nobody confirmed yet — check back soon.</p>
            )}
            {speakers && speakers.length > 0 && (
              <ul className="mt-4 flex flex-col gap-2">
                {speakers.map((s) => (
                  <li key={s.id} className="rounded-lg border border-white/15 px-4 py-2 text-body-sm text-white">
                    {s.name}
                    {s.organization ? ` · ${s.organization}` : ""}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </SectionContainer>

        {isBoard && (
          <SectionContainer>
            <div className="mx-auto max-w-md">
              <DraftPanel />
            </div>
          </SectionContainer>
        )}

        <SectionContainer>
          <div className="mx-auto max-w-md">
            <SpeakerForm submitPath="/api/speakers" />
          </div>
        </SectionContainer>
      </PageContainer>
    </ClubShell>
  );
}

/** Board+ only — pre-fill what you already know, get a private link to send. */
function DraftPanel() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [referredBy, setReferredBy] = useState("");
  const [note, setNote] = useState("");
  const [link, setLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const draft = await api<{ id: string }>("/api/speakers/drafts", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim() || undefined,
          email: email.trim() || undefined,
          organization: organization.trim() || undefined,
          referredBy: referredBy.trim() || undefined,
          note: note.trim() || undefined,
        }),
      });
      setLink(`${window.location.origin}/speak/${draft.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="club-card p-6">
      <h2 className="type-h4 text-white">Create a private link (board only)</h2>
      <p className="mt-2 text-body-sm text-white">
        Fill in whatever you already know — the speaker only fills in the rest.
      </p>

      {link ? (
        <div className="mt-4 flex flex-col gap-2">
          <input readOnly value={link} onFocus={(e) => e.target.select()} className={darkInputClass} />
          <button
            type="button"
            className="type-label self-start text-signal underline-offset-4 hover:underline"
            onClick={() => {
              navigator.clipboard?.writeText(link).catch(() => {});
            }}
          >
            Copy link
          </button>
          <button
            type="button"
            className="type-label self-start text-white hover:text-white"
            onClick={() => {
              setLink(null);
              setName("");
              setEmail("");
              setOrganization("");
              setReferredBy("");
              setNote("");
            }}
          >
            Create another
          </button>
        </div>
      ) : (
        <form onSubmit={create} className="mt-4 flex flex-col gap-3">
          {error && <p className="text-body-sm text-signal">{error}</p>}
          <input
            placeholder="Name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={darkInputClass}
          />
          <input
            placeholder="Email (optional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={darkInputClass}
          />
          <input
            placeholder="Organization (optional)"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            className={darkInputClass}
          />
          <input
            placeholder="Referred by (optional)"
            value={referredBy}
            onChange={(e) => setReferredBy(e.target.value)}
            className={darkInputClass}
          />
          <textarea
            placeholder="Note — visible to the speaker too (optional)"
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className={`${darkInputClass} min-h-[3.5rem] py-3`}
          />
          <button type="submit" disabled={busy} className={darkButtonClass}>
            {busy ? "Creating…" : "Create link"}
          </button>
        </form>
      )}
    </div>
  );
}
