"use client";

import { useId, useState } from "react";
import { ClubShell, PageContainer, SectionContainer } from "@/components/club/ClubShell";
import { darkButtonClass, darkInputClass } from "@/components/ui/darkForm";
import { ApiError, api } from "@/lib/api";

export default function PartnerPage() {
  const id = useId();
  const [organisation, setOrganisation] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [link, setLink] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("/api/partner-inquiries", {
        method: "POST",
        body: JSON.stringify({
          organisation: organisation.trim(),
          contactName: contactName.trim(),
          contactEmail: contactEmail.trim().toLowerCase(),
          link: link.trim() || null,
          message: message.trim(),
        }),
      });
      setDone(true);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Something went wrong. Try again, or email logica@uic.edu.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <ClubShell>
      <PageContainer>
        <SectionContainer>
          <h1 className="type-title text-3xl text-white md:text-4xl">Partner with LOGICA</h1>
          <p className="mt-4 max-w-3xl text-body-lg text-white">
            Companies and organisations can help UIC students learn through company visits,
            talks, workshops, and sponsorships. Tell us what you would like to build with LOGICA.
          </p>
        </SectionContainer>

        <SectionContainer>
          {done ? (
            <div className="club-card max-w-2xl p-8 md:p-12">
              <h2 className="type-h3 text-white">Inquiry received</h2>
              <p className="mt-3 text-body text-white">
                Thank you for reaching out. Your message is now with the LOGICA board.
              </p>
            </div>
          ) : (
            <form onSubmit={submit} className="club-card max-w-2xl p-8 md:p-12">
              <h2 className="type-h3 text-white">Start a conversation</h2>
              <p className="mt-3 text-body text-white">
                Share a contact and a short note about the partnership you have in mind.
              </p>

              {error && (
                <div
                  className="mt-6 rounded-lg border-2 border-signal bg-signal/10 px-4 py-3 text-body-sm text-white"
                  role="alert"
                >
                  {error}
                </div>
              )}

              <div className="mt-6 grid gap-5">
                <div className="grid gap-2">
                  <label htmlFor={`${id}-organisation`} className="type-label text-white">
                    Organisation
                  </label>
                  <input
                    id={`${id}-organisation`}
                    required
                    maxLength={100}
                    autoComplete="organization"
                    value={organisation}
                    onChange={(event) => setOrganisation(event.target.value)}
                    className={darkInputClass}
                  />
                </div>

                <div className="grid gap-2">
                  <label htmlFor={`${id}-name`} className="type-label text-white">
                    Your name
                  </label>
                  <input
                    id={`${id}-name`}
                    required
                    maxLength={100}
                    autoComplete="name"
                    value={contactName}
                    onChange={(event) => setContactName(event.target.value)}
                    className={darkInputClass}
                  />
                </div>

                <div className="grid gap-2">
                  <label htmlFor={`${id}-email`} className="type-label text-white">
                    Your email
                  </label>
                  <input
                    id={`${id}-email`}
                    type="email"
                    required
                    maxLength={100}
                    autoComplete="email"
                    autoCapitalize="none"
                    spellCheck={false}
                    value={contactEmail}
                    onChange={(event) => setContactEmail(event.target.value)}
                    className={darkInputClass}
                  />
                </div>

                <div className="grid gap-2">
                  <label htmlFor={`${id}-link`} className="type-label text-white">
                    Website or profile <span className="opacity-60">(optional)</span>
                  </label>
                  <input
                    id={`${id}-link`}
                    type="url"
                    maxLength={2000}
                    placeholder="https://example.com"
                    value={link}
                    onChange={(event) => setLink(event.target.value)}
                    className={darkInputClass}
                  />
                </div>

                <div className="grid gap-2">
                  <label htmlFor={`${id}-message`} className="type-label text-white">
                    What are you interested in doing with LOGICA?
                  </label>
                  <textarea
                    id={`${id}-message`}
                    required
                    rows={6}
                    maxLength={2000}
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    className={darkInputClass}
                  />
                </div>
              </div>

              <button type="submit" disabled={busy} className={`${darkButtonClass} mt-8`}>
                {busy ? "Sending…" : "Send partnership inquiry"}
              </button>
            </form>
          )}
        </SectionContainer>
      </PageContainer>
    </ClubShell>
  );
}
