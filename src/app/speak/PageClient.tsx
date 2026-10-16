"use client";

import { useEffect, useState } from "react";
import { ClubShell } from "@/components/club/ClubShell";
import { api } from "@/lib/api";
import { SpeakerForm } from "./SpeakerForm";

type PublicSpeaker = { id: string; name: string; organization: string | null };
type Profile = { role: string; name: string | null };

/** Speaker/guest intake: public, no sign-in. Send this link to a prospective speaker. */
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
      <main className="site-page partner-page">
        <div className="speak-intro">
          <header className="site-page-head">
            <p className="site-kicker">SPEAKERS</p>
            <h1 className="serif">Speak at LOGICA</h1>
            <p className="speak-lead serif">Tell us you&apos;re interested and we&apos;ll follow up to confirm details.</p>
            <p>
              If someone from LOGICA reached out to you about speaking, RSVP here with your availability and what
              you&apos;ll need. No account required.
            </p>
          </header>
          <section aria-labelledby="confirmed" className="speak-confirmed">
            <h2 id="confirmed" className="serif">Confirmed speakers</h2>
            {speakers === null && <p className="site-muted" role="status">Loading…</p>}
            {speakers?.length === 0 && <p className="site-muted">Nobody confirmed yet. Check back soon.</p>}
            {speakers && speakers.length > 0 && (
              <ul>
                {speakers.map((s) => (
                  <li key={s.id}>
                    <span className="speak-initials" aria-hidden="true">{initials(s.name)}</span>
                    <span>
                      <strong>{s.name}</strong>
                      {s.organization && <small>{s.organization}</small>}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="speak-forms">
          {isBoard && <DraftPanel />}
          <SpeakerForm submitPath="/api/speakers" />
        </div>
      </main>
    </ClubShell>
  );
}

const initials = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");

/** Board+ only: pre-fill what you already know, get a private link to send. */
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
    <div className="site-card speak-card">
      <span className="site-badge auth-tag">Board only</span>
      <h2 className="serif">{link ? "Link ready" : "Create a private link"}</h2>
      {link ? (
        <>
          <div className="speak-link-row">
            <input readOnly value={link} aria-label="Private link" onFocus={(e) => e.target.select()} />
            <button type="button" className="site-btn" onClick={() => navigator.clipboard?.writeText(link).catch(() => {})}>
              Copy link
            </button>
          </div>
          <button
            type="button"
            className="speak-another"
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
        </>
      ) : (
        <form onSubmit={create} className="site-form">
          <p className="site-muted">Fill in whatever you already know. The speaker only fills in the rest.</p>
          {error && <p className="site-error" role="alert">{error}</p>}
          <input aria-label="Name" placeholder="Name (optional)" value={name} onChange={(e) => setName(e.target.value)} />
          <input aria-label="Email" placeholder="Email (optional)" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input aria-label="Organization" placeholder="Organization (optional)" value={organization} onChange={(e) => setOrganization(e.target.value)} />
          <input aria-label="Referred by" placeholder="Referred by (optional)" value={referredBy} onChange={(e) => setReferredBy(e.target.value)} />
          <textarea aria-label="Note" placeholder="Note, visible to the speaker too (optional)" rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
          <button type="submit" disabled={busy} className="site-btn block">{busy ? "Creating…" : "Create link"}</button>
        </form>
      )}
    </div>
  );
}
