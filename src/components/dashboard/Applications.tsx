"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Empty, Heading } from "./Overview";
import { type Application, date } from "./types";

const STATUSES = ["PENDING", "INTERVIEW", "ACCEPTED", "DECLINED"] as const;
const LABEL = {
  ALL: "All",
  PENDING: "Pending",
  INTERVIEW: "Interview",
  ACCEPTED: "Accepted",
  DECLINED: "Declined",
};
const TRACK = {
  GENERAL: "General",
  SOFTWARE_ENGINEER: "Software engineer",
  MENTORSHIP: "Mentorship",
};
const ACTION = {
  PENDING: "Mark pending",
  INTERVIEW: "Move to interview",
  ACCEPTED: "Accept application",
  DECLINED: "Decline application",
};
const tone = (status: Application["status"]) =>
  status === "ACCEPTED" ? "confirmed" : status === "DECLINED" ? "declined" : "pending";

export function Applications() {
  const [items, setItems] = useState<Application[] | null>(null);
  const [status, setStatus] = useState<Application["status"] | "ALL">("ALL");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let alive = true;
    api<Application[]>("/api/join")
      .then((data) => {
        if (alive) {
          setItems(data);
          setError("");
        }
      })
      .catch((e: Error) => alive && setError(e.message));
    return () => { alive = false; };
  }, [reload]);

  const count = (value: Application["status"]) =>
    items?.filter((item) => item.status === value).length ?? 0;
  const needle = query.trim().toLowerCase();
  const filtered = items?.filter((item) =>
    (status === "ALL" || item.status === status) &&
    [item.name, item.email, TRACK[item.track], item.major, item.gradYear, item.why]
      .filter(Boolean).join(" ").toLowerCase().includes(needle),
  );
  const detail = items?.find((item) => item.id === open);
  const summary = [
    ["Total", items?.length ?? "—"],
    ["Awaiting a decision", items ? count("PENDING") + count("INTERVIEW") : "—"],
    ["Interviewing", items ? count("INTERVIEW") : "—"],
    ["Accepted", items ? count("ACCEPTED") : "—"],
  ] as const;

  async function changeStatus(item: Application, next: Application["status"]) {
    setBusy(true);
    setError("");
    setSaved("");
    try {
      await api(`/api/join/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: next }),
      });
      setItems((current) => current?.map((row) =>
        row.id === item.id ? { ...row, status: next } : row,
      ) ?? null);
      setSaved(`${item.name}: status saved as ${LABEL[next].toLowerCase()}.`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Heading title="Applications" description="Review membership applications and record the next decision." />
      <div className="d-directory-summary">
        {summary.map(([label, value]) => (
          <div key={label}><strong>{value}</strong><span>{label}</span></div>
        ))}
      </div>
      {error && <p className="d-error" role="alert">{error}{" "}
        {!items && <button className="d-text-button" onClick={() => setReload((value) => value + 1)}>Retry loading</button>}
      </p>}
      {saved && <p className="d-muted" role="status">{saved}</p>}
      <div className="d-tabs d-stage-tabs" aria-label="Filter applications by status">
        {(["ALL", ...STATUSES] as const).map((value) => (
          <button key={value} aria-pressed={status === value} onClick={() => setStatus(value)}>
            {LABEL[value]} <span>{items ? value === "ALL" ? items.length : count(value) : "—"}</span>
          </button>
        ))}
      </div>
      <section className="d-panel d-directory" aria-label="Membership applications">
        <div className="d-directory-toolbar">
          <label className="d-search">
            <span className="sr-only">Search applications</span>
            <input type="search" placeholder="Search name, email, track, major…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </label>
        </div>
        <div className="d-table-scroll" tabIndex={0} role="region" aria-label="Applications table">
          <table>
            <thead><tr>
              <th scope="col">Applicant</th><th scope="col">Track</th><th scope="col">Major / graduation</th><th scope="col">Applied</th><th scope="col">Status</th><th scope="col"><span className="sr-only">Actions</span></th>
            </tr></thead>
            <tbody>{filtered?.map((item) => (
              <tr key={item.id}>
                <td><strong>{item.name}</strong><small>{item.email}</small></td>
                <td>{TRACK[item.track]}</td>
                <td>{item.major || "—"}<small>{item.gradYear ?? "Graduation year not provided"}</small></td>
                <td>{date(item.createdAt, { month: "short", day: "numeric", year: "numeric" })}</td>
                <td><span className={`d-badge ${tone(item.status)}`}>{LABEL[item.status]}</span></td>
                <td><button className="d-text-button" aria-expanded={open === item.id} aria-controls={open === item.id ? "application-detail" : undefined} onClick={() => setOpen(open === item.id ? null : item.id)}>
                  {open === item.id ? "Close" : "Open"}<span className="sr-only"> {item.name}&apos;s application</span> ↗
                </button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
        {filtered?.length === 0 && <Empty title={items?.length ? "No matching applications" : "No applications yet"}>
          {items?.length ? "Try another status or a different search." : "Applications submitted through the join page will appear here."}
        </Empty>}
        {!items && !error && <p className="d-muted" role="status">Loading applications…</p>}
      </section>
      {detail && <section id="application-detail" className="d-panel d-speaker-detail" aria-labelledby="application-detail-title">
        <div className="d-section-head">
          <h2 id="application-detail-title">{detail.name}</h2>
          <button className="d-text-button" onClick={() => setOpen(null)}>Close details</button>
        </div>
        <dl>
          <div><dt>Email</dt><dd><a href={`mailto:${detail.email}`}>{detail.email}</a></dd></div>
          <div><dt>Status</dt><dd><span className={`d-badge ${tone(detail.status)}`}>{LABEL[detail.status]}</span></dd></div>
          <div><dt>Track</dt><dd>{TRACK[detail.track]}</dd></div>
          <div><dt>Major / graduation</dt><dd>{detail.major || "Not provided"} · {detail.gradYear ?? "Year not provided"}</dd></div>
          <div><dt>Applied</dt><dd>{date(detail.createdAt, { month: "long", day: "numeric", year: "numeric" })}</dd></div>
          <div><dt>Why do you want to join?</dt><dd>{detail.why || "No answer provided"}</dd></div>
        </dl>
        <div className="d-actions" aria-busy={busy}>
          {STATUSES.map((value) => <button key={value} className="d-button secondary" disabled={busy || detail.status === value} onClick={() => changeStatus(detail, value)}>{ACTION[value]}</button>)}
        </div>
        {busy && <p className="d-muted" role="status">Saving status…</p>}
      </section>}
    </>
  );
}
