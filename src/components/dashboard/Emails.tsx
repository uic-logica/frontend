"use client";

import { useEffect, useRef, useState } from "react";
import { api, peek } from "@/lib/api";
import { Empty, Heading } from "./Overview";
import { useUrlState } from "./useUrlState";

/** Mirrors backend EmailLog. */
type EmailRow = {
  id: string;
  to: string;
  subject: string;
  status: "SENT" | "FAILED" | "SKIPPED";
  error: string | null;
  delivery: string | null;
  createdAt: string;
};

type Outcome = "Delivered" | "Sent" | "Bounced" | "Failed" | "Skipped";
const TABS = ["ALL", "Delivered", "Sent", "Bounced", "Failed", "Skipped"] as const;

/** One word for what happened, from our side (sent / failed / skipped) and Resend's (delivered / bounced). */
function outcome(row: EmailRow): Outcome {
  if (row.status === "FAILED") return "Failed";
  if (row.status === "SKIPPED") return "Skipped";
  if (row.delivery === "delivered") return "Delivered";
  if (row.delivery === "bounced" || row.delivery === "complained" || row.delivery === "failed") return "Bounced";
  return "Sent";
}
const tone = (o: Outcome) => (o === "Delivered" ? "confirmed" : o === "Failed" || o === "Bounced" ? "declined" : "pending");
const why: Partial<Record<string, string>> = {
  complained: "Marked as spam by the recipient",
  bounced: "The recipient's mail server rejected it",
  failed: "The provider couldn't deliver it",
  delivery_delayed: "Delivery delayed, still trying",
};
const when = (iso: string) =>
  new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

/**
 * Exec only: every email the site tried to send (notifications, RSVPs,
 * application decisions, speaker threads, invites), and what happened to it.
 */
export function Emails() {
  const [rows, setRows] = useState<EmailRow[] | null>(() => peek<EmailRow[]>("/api/board/emails") ?? null);
  const [tab, setTab] = useUrlState("status", "ALL");
  const [query, setQuery] = useUrlState("q");
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  // The open email, in the URL like every other detail, so a link to it works.
  const [openId, setOpenId] = useUrlState("id");

  useEffect(() => {
    let alive = true;
    api<EmailRow[]>("/api/board/emails")
      .then((data) => alive && (setRows(data), setError("")))
      .catch((e: Error) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, [reload]);

  const needle = query.trim().toLowerCase();
  const shown = rows?.filter(
    (r) => (tab === "ALL" || outcome(r) === tab) && `${r.to} ${r.subject} ${r.error ?? ""}`.toLowerCase().includes(needle),
  );
  const count = (t: (typeof TABS)[number]) => (rows ? (t === "ALL" ? rows.length : rows.filter((r) => outcome(r) === t).length) : "—");

  return (
    <>
      <Heading
        title="Emails"
        description="Every email the site sent, and whether it arrived. Newest first."
        action={
          <button className="d-button secondary" onClick={() => setReload((v) => v + 1)}>
            Refresh
          </button>
        }
      />
      {error && (
        <p className="d-error" role="alert">
          {error}{" "}
          <button className="d-text-button" onClick={() => setReload((v) => v + 1)}>
            Retry
          </button>
        </p>
      )}
      <div className="d-split-toolbar">
        <div className="d-tabs d-stage-tabs" aria-label="Filter emails">
          {TABS.map((t) => (
            <button key={t} aria-pressed={tab === t} onClick={() => setTab(t)}>
              {t === "ALL" ? "All" : t} <span>{count(t)}</span>
            </button>
          ))}
        </div>
        <label className="d-search">
          <span className="sr-only">Search emails</span>
          <input type="search" placeholder="Search recipient or subject…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
      </div>
      <section className="d-panel d-email-log" aria-label="Email log">
        {!rows && !error && <p className="d-muted" role="status">Loading emails…</p>}
        {shown?.length === 0 && (
          <Empty title={rows?.length ? "No matching emails" : "No emails yet"}>
            {rows?.length ? "Try another filter or search." : "Emails show up here as the site sends them."}
          </Empty>
        )}
        {!!shown?.length && (
          <table>
            <thead>
              <tr>
                <th scope="col">Sent</th>
                <th scope="col">To</th>
                <th scope="col">Subject</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((r) => {
                const o = outcome(r);
                const note = r.error ?? (r.delivery ? why[r.delivery] : undefined);
                return (
                  <tr key={r.id} className="d-email-row" onClick={() => setOpenId(r.id, { push: true })}>
                    <td className="d-muted">
                      <time dateTime={r.createdAt}>{when(r.createdAt)}</time>
                    </td>
                    <td>{r.to}</td>
                    <td>
                      <button type="button" className="d-text-button" onClick={(e) => { e.stopPropagation(); setOpenId(r.id, { push: true }); }}>
                        {r.subject}
                      </button>
                    </td>
                    <td>
                      <span className={`d-badge ${tone(o)}`}>{o}</span>
                      {note && <small>{note}</small>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>
      {openId && <EmailViewer id={openId} onClose={() => setOpenId("")} />}
    </>
  );
}

type FullEmail = EmailRow & { html: string | null; text: string | null };

/** One logged email, exactly as it went out: the HTML in a locked-down frame, or the plain text. */
function EmailViewer({ id, onClose }: { id: string; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [email, setEmail] = useState<FullEmail | null>(null);
  const [error, setError] = useState("");
  const [plain, setPlain] = useState(false);

  useEffect(() => {
    dialog.current?.showModal();
    let alive = true;
    api<FullEmail>(`/api/board/emails/${id}`)
      .then((e) => alive && setEmail(e))
      .catch((e: Error) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, [id]);

  const o = email && outcome(email);
  return (
    <dialog ref={dialog} className="d-email-viewer" aria-labelledby="email-viewer-title" onClose={onClose} onClick={(e) => e.target === e.currentTarget && dialog.current?.close()}>
      <header>
        <div>
          <h2 id="email-viewer-title">{email?.subject ?? "Email"}</h2>
          {email && (
            <p className="d-muted">
              To {email.to} · {when(email.createdAt)} · <span className={`d-badge ${tone(o!)}`}>{o}</span>
              {(email.error ?? (email.delivery ? why[email.delivery] : null)) && <> · {email.error ?? why[email.delivery!]}</>}
            </p>
          )}
        </div>
        <button className="d-button secondary" onClick={() => dialog.current?.close()}>Close</button>
      </header>
      {error && <p className="d-error" role="alert">{error}</p>}
      {!email && !error && <p className="d-muted" role="status">Loading the email…</p>}
      {email && !email.html && !email.text && <p className="d-muted">This email was logged before the log kept copies, so only its status is saved.</p>}
      {email && (email.html || email.text) && (
        <>
          <div className="d-tabs" aria-label="Email view">
            <button aria-pressed={!plain} disabled={!email.html} onClick={() => setPlain(false)}>As sent</button>
            <button aria-pressed={plain} disabled={!email.text} onClick={() => setPlain(true)}>Plain text</button>
          </div>
          {plain || !email.html ? (
            <pre className="d-email-text">{email.text}</pre>
          ) : (
            // Sandboxed with scripts off, so the email's HTML can't run anything.
            // allow-same-origin only lets it inherit the page's style rules (with an
            // opaque origin the dashboard's CSP blanks it); with no scripts that's inert.
            <iframe title={`Email: ${email.subject}`} sandbox="allow-same-origin allow-popups" srcDoc={email.html} className="d-email-frame" />
          )}
        </>
      )}
    </dialog>
  );
}
