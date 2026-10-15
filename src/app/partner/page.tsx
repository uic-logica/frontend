"use client";

import { useId, useState } from "react";
import { ClubShell } from "@/components/club/ClubShell";
import { SiteIcon } from "@/components/site/icons";
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
      <main className="site-page partner-page">
        <header className="site-page-head partner-intro">
          <p className="site-kicker">PARTNERS</p>
          <h1 className="serif">Partner with LOGICA</h1>
          <p>
            Companies and organisations can help UIC students learn through company visits, talks, workshops, and
            sponsorships. Tell us what you would like to build with LOGICA.
          </p>
          <ul className="partner-ways">
            {["Company visits", "Talks", "Workshops", "Sponsorships"].map((way) => (
              <li key={way}>{way}</li>
            ))}
          </ul>
        </header>

        {done ? (
          <div className="site-card partner-card" role="status">
            <span className="site-check" aria-hidden="true"><SiteIcon name="check" size={20} /></span>
            <h2 className="serif">Inquiry received</h2>
            <p className="site-muted">Thank you for reaching out. Your message is now with the LOGICA board.</p>
          </div>
        ) : (
          <form onSubmit={submit} className="site-card partner-card site-form">
            <h2 className="serif">Tell us about it</h2>
            <p className="site-muted">Share a contact and a short note about the partnership you have in mind.</p>
            {error && <p className="site-error" role="alert">{error}</p>}
            <label className="site-field" htmlFor={`${id}-organisation`}>
              <span>Organisation</span>
              <input id={`${id}-organisation`} required maxLength={100} autoComplete="organization" placeholder="Company or group" value={organisation} onChange={(event) => setOrganisation(event.target.value)} />
            </label>
            <div className="site-form-row">
              <label className="site-field" htmlFor={`${id}-name`}>
                <span>Your name</span>
                <input id={`${id}-name`} required maxLength={100} autoComplete="name" placeholder="Full name" value={contactName} onChange={(event) => setContactName(event.target.value)} />
              </label>
              <label className="site-field" htmlFor={`${id}-email`}>
                <span>Your email</span>
                <input id={`${id}-email`} type="email" required maxLength={100} autoComplete="email" autoCapitalize="none" spellCheck={false} placeholder="you@company.com" value={contactEmail} onChange={(event) => setContactEmail(event.target.value)} />
              </label>
            </div>
            <label className="site-field" htmlFor={`${id}-link`}>
              <span>Website or profile (optional)</span>
              <input id={`${id}-link`} type="url" maxLength={2000} placeholder="https://" value={link} onChange={(event) => setLink(event.target.value)} />
            </label>
            <label className="site-field" htmlFor={`${id}-message`}>
              <span>What are you interested in doing with LOGICA?</span>
              <textarea id={`${id}-message`} required rows={4} maxLength={2000} placeholder="A talk in the spring, a visit for 20 students, a sponsored hackathon prize…" value={message} onChange={(event) => setMessage(event.target.value)} />
            </label>
            <button type="submit" disabled={busy} className="site-btn block">{busy ? "Sending…" : "Send partnership inquiry"}</button>
            <p className="auth-alt">Prefer email? <a href="mailto:logica@uic.edu">logica@uic.edu</a></p>
          </form>
        )}
      </main>
    </ClubShell>
  );
}
