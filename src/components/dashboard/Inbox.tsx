"use client";

import { useEffect, useState } from "react";
import { api, peek } from "@/lib/api";
import { Empty, Heading } from "./Overview";
import { Thread } from "./Thread";
import { useUrlState } from "./useUrlState";
import { type Event, type Member, type SessionUser, initials } from "./types";

/** Mirrors backend /api/board/inbox. */
type InboxThread = {
  thread: string;
  kind: "guest" | "member";
  id: string;
  name: string;
  detail: string;
  last: { body: string; at: string; fromBoard: boolean };
  unread: boolean;
};

const when = (iso: string) => {
  const d = new Date(iso);
  return d.toDateString() === new Date().toDateString()
    ? d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

/**
 * Exec: every conversation in one place. Guest threads (speakers, candidates)
 * and members or applicants writing to the board, newest first, with an
 * unread dot until you open it. "New message" starts a thread with any member.
 */
export function Inbox({ user, events, members }: { user: SessionUser; events: Event[] | null; members: Member[] | null }) {
  const [threads, setThreads] = useState<InboxThread[] | null>(() => peek<InboxThread[]>("/api/board/inbox") ?? null);
  const [open, setOpen] = useUrlState("thread");
  const [query, setQuery] = useUrlState("q");
  const [error, setError] = useState("");
  const [starting, setStarting] = useState(false);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let alive = true;
    const read = () =>
      api<InboxThread[]>("/api/board/inbox")
        .then((t) => alive && (setThreads(t), setError("")))
        .catch((e: Error) => alive && setError(e.message));
    void read();
    // New messages show up without a reload, same rhythm as an open thread.
    const timer = window.setInterval(() => document.visibilityState === "visible" && void read(), 30_000);
    window.addEventListener("focus", read);
    return () => {
      alive = false;
      window.clearInterval(timer);
      window.removeEventListener("focus", read);
    };
  }, [reload]);

  // Opening a thread reads it (the server marks it read); clear the dot here too.
  function pick(thread: string) {
    setOpen(thread, { push: true });
    setThreads((all) => all?.map((t) => (t.thread === thread ? { ...t, unread: false } : t)) ?? null);
  }

  const [kind, id] = open.split(":");
  const current = threads?.find((t) => t.thread === open);
  const memberName = (memberId: string) => {
    const m = members?.find((x) => x.id === memberId);
    return m?.name || m?.email || "this member";
  };
  const needle = query.trim().toLowerCase();
  const shown = threads?.filter((t) => `${t.name} ${t.detail} ${t.last.body}`.toLowerCase().includes(needle));
  const unread = threads?.filter((t) => t.unread).length ?? 0;

  return (
    <>
      <Heading
        title="Messages"
        description={unread ? `${unread} unread. Guests, members and applicants, all in one place.` : "Guests, members and applicants, all in one place."}
        action={
          <button className="d-button" onClick={() => setStarting((v) => !v)} aria-expanded={starting}>
            New message
          </button>
        }
      />
      {starting && (
        <form
          className="d-panel d-inbox-new"
          onSubmit={(e) => {
            e.preventDefault();
            const to = new FormData(e.currentTarget).get("to");
            if (typeof to === "string" && to) {
              setStarting(false);
              pick(`member:${to}`);
            }
          }}
        >
          <label>
            To
            <select name="to" required defaultValue="">
              <option value="" disabled>
                Pick a member
              </option>
              {[...(members ?? [])]
                .filter((m) => m.id !== user.id)
                .sort((a, b) => (a.name ?? a.email).localeCompare(b.name ?? b.email))
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name ? `${m.name} (${m.email})` : m.email}
                  </option>
                ))}
            </select>
          </label>
          <button className="d-button">Open the thread</button>
          <small className="d-muted">To write to a guest, open them in the Speaker directory.</small>
        </form>
      )}
      {error && (
        <p className="d-error" role="alert">
          {error}{" "}
          <button className="d-text-button" onClick={() => setReload((v) => v + 1)}>
            Retry
          </button>
        </p>
      )}
      <div className="d-split-toolbar">
        <label className="d-search">
          <span className="sr-only">Search messages</span>
          <input type="search" placeholder="Search names or messages…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
      </div>
      <div className="d-split">
        <section className="d-panel d-split-list d-inbox-list" aria-label="Conversations">
          {!threads && !error && <p className="d-muted" role="status">Loading messages…</p>}
          {shown?.length === 0 && (
            <Empty title={threads?.length ? "No matching conversations" : "No messages yet"}>
              {threads?.length ? "Try another search." : "When a guest or member writes to the board, it shows up here."}
            </Empty>
          )}
          {!!shown?.length && (
            <ul>
              {shown.map((t) => (
                <li key={t.thread}>
                  <button aria-current={open === t.thread ? "true" : undefined} aria-controls="inbox-thread" onClick={() => pick(t.thread)}>
                    <span className="d-avatar">{initials(t.name)}</span>
                    <span>
                      <strong>
                        {t.name}
                        {t.unread && <i className="d-unread-dot" aria-label="Unread" />}
                      </strong>
                      <small>
                        {t.last.fromBoard ? "Board: " : ""}
                        {t.last.body}
                      </small>
                    </span>
                    <span className="d-split-meta">
                      <small>{when(t.last.at)}</small>
                      <small>{t.detail}</small>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
        {open && (kind === "speaker" || kind === "member") && id ? (
          <div id="inbox-thread" className="d-split-detail d-inbox-thread">
            <button className="d-text-button d-split-back" onClick={() => setOpen("")}>
              ← All messages
            </button>
            <Thread
              key={open}
              submissionId={id}
              user={user}
              events={events}
              endpoint={kind === "member" ? `/api/board/messages/${id}` : undefined}
              title={current?.name ?? (kind === "member" ? memberName(id) : "Guest thread")}
              description={kind === "member" ? "Only the exec board and them" : "Shared with every board member"}
              onSent={() => setReload((v) => v + 1)}
              empty={kind === "member" ? "No messages yet. Whatever you write here reaches them by notification and email." : undefined}
            />
          </div>
        ) : (
          !!shown?.length && (
            <section className="d-panel d-split-detail d-split-empty">
              <p className="d-muted">Pick a conversation to read it and reply.</p>
            </section>
          )
        )}
      </div>
    </>
  );
}
