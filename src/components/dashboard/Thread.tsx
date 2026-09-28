"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { Icon } from "./Icon";
import {
  type Event,
  type SessionUser,
  type SpeakerMessage,
  type Window,
  date,
  initials,
} from "./types";

/**
 * `[[event:<id>|Label]]` and `[[window:<key>|Label]]` — written into the
 * message body exactly as typed and resolved when read, so renaming an
 * event or moving a window never rewrites what someone actually said. The
 * label travels with the reference, so it still reads as words even when
 * the thing it points at is gone.
 */
const REFERENCE = /\[\[(event|window):([^|\]]+)\|([^\]]*)\]\]/g;

/**
 * Availability windows have no id, so they're keyed by their own four
 * values. That survives reordering the list, which an index wouldn't, and
 * it stops matching the moment the candidate actually changes the times —
 * which is the correct behaviour: that window no longer exists.
 */
export function windowKey(w: Window) {
  return `${w.startDate}~${w.endDate}~${w.startTime}~${w.endTime}`;
}

const day = (d: string) =>
  date(`${d}T12:00:00`, { month: "short", day: "numeric" });
const time = (t: string) =>
  new Date(`2000-01-01T${t}`).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

export function windowLabel(w: Window) {
  const span =
    w.startDate === w.endDate
      ? day(w.startDate)
      : `${day(w.startDate)} – ${day(w.endDate)}`;
  return `${span}, ${time(w.startTime)}–${time(w.endTime)}`;
}

function Body({
  body,
  events,
  windows,
}: {
  body: string;
  events: Event[] | null;
  windows: Window[];
}) {
  const parts: React.ReactNode[] = [];
  let last = 0;
  for (const match of body.matchAll(REFERENCE)) {
    const [raw, kind, id, label] = match;
    const at = match.index ?? 0;
    if (at > last) parts.push(body.slice(last, at));
    const key = `${kind}-${id}-${at}`;
    const text = label || id;
    if (kind === "window") {
      // A window is a fact about this thread, not somewhere to navigate —
      // it highlights, it doesn't link. Struck through once the candidate
      // has moved those times, so nobody plans around a stale slot.
      const live = windows.some((w) => windowKey(w) === id);
      parts.push(
        <span
          className={`d-ref is-window ${live ? "" : "is-missing"}`}
          key={key}
          title={live ? undefined : "These times have since changed"}
        >
          {text}
        </span>,
      );
    } else {
      const live = events?.some((e) => e.id === id);
      parts.push(
        live ? (
          <Link className="d-ref" href="/dashboard/events" key={key}>
            {text}
          </Link>
        ) : (
          <span className="d-ref is-missing" key={key}>
            {text}
          </span>
        ),
      );
    }
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
  windows = [],
  title = "Messages",
  description = "You and the LOGICA board",
  full = false,
}: {
  submissionId: string;
  user: SessionUser;
  events: Event[] | null;
  /** The candidate's own availability, so the two sides can point at a slot. */
  windows?: Window[];
  title?: string;
  description?: string;
  /** Fills the work area instead of sitting in a boxed panel. */
  full?: boolean;
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

  type Suggestion = {
    kind: "event" | "window";
    id: string;
    label: string;
    hint: string;
  };
  const suggestions: Suggestion[] = [
    ...windows.map((w) => ({
      kind: "window" as const,
      id: windowKey(w),
      label: windowLabel(w),
      hint: "Availability window",
    })),
    ...(events ?? []).map((e) => ({
      kind: "event" as const,
      id: e.id,
      label: e.title,
      hint: date(e.startsAt, {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
    })),
  ];
  const matches = picker
    ? suggestions
        .filter((o) =>
          `${o.label} ${o.hint}`
            .toLowerCase()
            .includes(picker.query.toLowerCase()),
        )
        .slice(0, 6)
    : [];

  function sync(value: string, caret: number) {
    setDraft(value);
    const open = openReference(value, caret);
    setPicker(open);
    setHighlight(0);
  }

  function insert(option: Suggestion) {
    if (!picker) return;
    const caret = box.current?.selectionStart ?? draft.length;
    const ref = `[[${option.kind}:${option.id}|${option.label}]]`;
    setDraft(`${draft.slice(0, picker.start)}${ref}${draft.slice(caret)}`);
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
    <section
      className={`d-thread d-chat-panel ${full ? "is-full" : "d-panel"}`}
    >
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
                  <Body body={m.body} events={events} windows={windows} />
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
            placeholder="Message — type [[ to reference an event or a time"
            onKeyDown={keys}
            onChange={(e) => sync(e.target.value, e.target.selectionStart)}
            onClick={(e) =>
              sync(e.currentTarget.value, e.currentTarget.selectionStart)
            }
          />
          {picker && matches.length > 0 && (
            <ul
              className="d-ref-picker"
              role="listbox"
              aria-label="Events and availability"
            >
              {matches.map((o, i) => (
                <li key={`${o.kind}-${o.id}`}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={i === highlight}
                    className={i === highlight ? "is-active" : ""}
                    onMouseDown={(ev) => {
                      ev.preventDefault();
                      insert(o);
                    }}
                  >
                    <Icon name={o.kind === "window" ? "clock" : "events"} />
                    <span>
                      <strong>{o.label}</strong>
                      <small>{o.hint}</small>
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
