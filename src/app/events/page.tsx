"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type Event = { id: string; title: string; location: string | null; startsAt: string };

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<Record<string, string>>({});

  useEffect(() => {
    api<Event[]>("/api/events").then(setEvents).catch((e) => setError(e.message));
  }, []);

  async function rsvp(eventId: string, s: "GOING" | "NOT_GOING") {
    try {
      await api(`/api/events/${eventId}/rsvp`, { method: "POST", body: JSON.stringify({ status: s }) });
      setStatus((prev) => ({ ...prev, [eventId]: s }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <main className="mx-auto max-w-lg p-8">
      <h1 className="text-xl font-semibold">Events [scaffold]</h1>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <ul className="mt-6 flex flex-col gap-3">
        {events.map((e) => (
          <li key={e.id} className="border p-3">
            <p className="font-medium">{e.title}</p>
            <p className="text-sm text-zinc-500">
              {new Date(e.startsAt).toLocaleString()} {e.location && `— ${e.location}`}
            </p>
            <div className="mt-2 flex gap-2">
              <button onClick={() => rsvp(e.id, "GOING")} className="border px-2 py-1 text-sm">Going</button>
              <button onClick={() => rsvp(e.id, "NOT_GOING")} className="border px-2 py-1 text-sm">Not going</button>
              {status[e.id] && <span className="text-sm text-zinc-500">→ {status[e.id]}</span>}
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
