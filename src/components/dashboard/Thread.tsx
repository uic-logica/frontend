"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { Icon } from "./Icon";
import {
  type Event,
  type SessionUser,
  type SpeakerMessage,
  date,
  initials,
} from "./types";

/**
 * `[[event:<id>|Label]]` — written into the message body as typed and
 * resolved when it's read, so renaming an event never rewrites what someone
 * said. The label is carried along so a reference still reads as words if
 * the event it points at is gone.
 */
const REFERENCE = /\[\[event:([^|\]]+)\|([^\]]*)\]\]/g;

function Body({ body, events }: { body: string; events: Event[] | null }) {
  const parts: React.ReactNode[] = [];
  let last = 0;
  for (const match of body.matchAll(REFERENCE)) {
    const [raw, id, label] = match;
    const at = match.index ?? 0;
    if (at > last) parts.push(body.slice(last, at));
    const known = events?.some((e) => e.id === id);
    parts.push(
      known ? (
        <Link className="d-ref" href="/dashboard/events" key={`${id}-${at}`}>
          {label || id}
        </Link>
      ) : (
        <span className="d-ref is-missing" key={`${id}-${at}`}>
          {label || id}
        </span>
      ),
    );
    last = at + raw.length;
  }
  parts.push(body.slice(last));
  return <p>{parts}</p>;
}

/** "Today" / "Yesterday" / a date — the separator between days of chat. */
function dayLabel(iso: string) {
  const at = new Date(iso);
  const midnight = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((midnight(new Date()) - midnight(at)) / 86_400_000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return at.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    ...(at.getFullYear() === new Date().getFullYear()
      ? {}
      : { year: "numeric" }),
  });
}

function clock(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

/** The open `[[` the caret currently sits inside, if any. */
function openReference(value: string, caret: number) {
  const before = value.slice(0, caret);
  const start = before.lastIndexOf("[[");
  if (start === -1) return null;
  const query = before.slice(start + 2);
  // A closed reference, or a line break, means we're no longer inside one.
  if (/[\]\n]/.test(query)) return null;
  return { start, query };
}

export function Thread({
  submissionId,
  user,
  events,
  title = "Messages",
  description = "You and the LOGICA board",
}: {
  submissionId: string;
  user: SessionUser;
  events: Event[] | null;
  title?: string;
  description?: string;
}) {
  const [messages, setMessages] = useState<SpeakerMessage[] | null>(null);
  const [draft, setDraft] = useState("");
  const [picker, setPicker] = useState<{ start: number; query: string } | null>(
    null,
  );
  const [highlight, setHighlight] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const box = useRef<HTMLTextAreaElement>(null);
  const log = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    api<SpeakerMessage[]>(`/api/speakers/${submissionId}/messages`)
      .then((m) => alive && setMessages(m))
      .catch((e: Error) => {
        if (!alive) return;
        setError(e.message);
        setMessages([]);
      });
    return () => {
      alive = false;
    };
  }, [submissionId]);

  useEffect(() => {
    if (log.current) log.current.scrollTop = log.current.scrollHeight;
  }, [messages]);

  const matches = picker
    ? (events ?? [])
        .filter((e) =>
          e.title.toLowerCase().includes(picker.query.toLowerCase()),
        )
        .slice(0, 5)
    : [];

  function sync(value: string, caret: number) {
    setDraft(value);
    const open = openReference(value, caret);
    setPicker(open);
    setHighlight(0);
  }

  function insert(event: Event) {
    if (!picker) return;
    const caret = box.current?.selectionStart ?? draft.length;
    const next = `${draft.slice(0, picker.start)}[[event:${event.id}|${event.title}]]${draft.slice(caret)}`;
    setDraft(next);
    setPicker(null);
    box.current?.focus();
  }

  function keys(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (!picker || !matches.length) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        void send(e);
      }
      return;
    }
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight(
        (h) =>
          (h + (e.key === "ArrowDown" ? 1 : matches.length - 1)) %
          matches.length,
      );
    } else if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      insert(matches[highlight]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setPicker(null);
    }
  }

  async function send(e: React.SyntheticEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    setBusy(true);
    setError("");
    try {
      const created = await api<SpeakerMessage>(
        `/api/speakers/${submissionId}/messages`,
        { method: "POST", body: JSON.stringify({ body: draft.trim() }) },
      );
      setMessages((prev) => [...(prev ?? []), created]);
      setDraft("");
      setPicker(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="d-panel d-thread d-chat-panel">
      <div className="d-section-head d-chat-head">
        <h2>{title}</h2>
        <span className="d-muted">{description}</span>
      </div>
      <div className="d-chat" ref={log}>
        {messages === null && <p className="d-muted">Loading the thread…</p>}
        {messages?.length === 0 && (
          <p className="d-muted d-thread-empty">
            Nothing here yet. Ask a question, or tell the board what you need.
          </p>
        )}
        {messages?.map((m, i) => {
          const previous = messages[i - 1];
          const mine = m.author.id === user.id;
          const newDay =
            !previous || dayLabel(previous.createdAt) !== dayLabel(m.createdAt);
          // Consecutive messages from the same person on the same day are one
          // run: only the first carries a name, only the last carries a tail.
          const runStart = newDay || previous?.author.id !== m.author.id;
          const next = messages[i + 1];
          const runEnd =
            !next ||
            next.author.id !== m.author.id ||
            dayLabel(next.createdAt) !== dayLabel(m.createdAt);
          return (
            <div key={m.id}>
              {newDay && (
                <div className="d-chat-day">
                  <span>{dayLabel(m.createdAt)}</span>
                </div>
              )}
              <div
                className={`d-bubble-row ${mine ? "is-mine" : ""} ${
                  runEnd ? "is-last" : ""
                }`}
              >
                <span className="d-avatar" aria-hidden={!runStart}>
                  {runStart ? initials(m.author.name) : ""}
                </span>
                <div className="d-bubble">
                  {runStart && !mine && (
                    <span className="d-bubble-who">
                      {m.author.name || "LOGICA"}
                      <small>
                        {m.author.accountKind === "SPEAKER"
                          ? "Speaker"
                          : "Board"}
                      </small>
                    </span>
                  )}
                  <Body body={m.body} events={events} />
                  <time dateTime={m.createdAt}>{clock(m.createdAt)}</time>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {error && (
        <p className="d-error" role="alert">
          {error}
        </p>
      )}
      <form className="d-thread-compose" onSubmit={send}>
        <label className="sr-only" htmlFor={`thread-${submissionId}`}>
          Your message
        </label>
        <div className="d-thread-input">
          <textarea
            id={`thread-${submissionId}`}
            ref={box}
            rows={1}
            maxLength={2000}
            value={draft}
            placeholder="Message — type [[ to reference an event"
            onKeyDown={keys}
            onChange={(e) => sync(e.target.value, e.target.selectionStart)}
            onClick={(e) =>
              sync(e.currentTarget.value, e.currentTarget.selectionStart)
            }
          />
          {picker && matches.length > 0 && (
            <ul className="d-ref-picker" role="listbox" aria-label="Events">
              {matches.map((e, i) => (
                <li key={e.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={i === highlight}
                    className={i === highlight ? "is-active" : ""}
                    onMouseDown={(ev) => {
                      ev.preventDefault();
                      insert(e);
                    }}
                  >
                    <Icon name="events" />
                    <span>
                      <strong>{e.title}</strong>
                      <small>{date(e.startsAt)}</small>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          className="d-send"
          aria-label="Send message"
          disabled={busy || !draft.trim()}
        >
          <Icon name="arrow" />
        </button>
      </form>
    </section>
  );
}
