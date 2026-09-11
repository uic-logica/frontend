"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type Attendance = { id: string; checkedInAt: string; event: { id: string; title: string } };

export default function AttendancePage() {
  const [history, setHistory] = useState<Attendance[]>([]);
  const [eventId, setEventId] = useState("");
  const [error, setError] = useState<string | null>(null);

  function load() {
    api<Attendance[]>("/api/attendance/me").then(setHistory).catch((e) => setError(e.message));
  }

  useEffect(load, []);

  async function checkIn(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api("/api/attendance/checkin", { method: "POST", body: JSON.stringify({ eventId }) });
      setEventId("");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <main className="mx-auto max-w-lg p-8">
      <h1 className="text-xl font-semibold">Attendance [scaffold]</h1>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <form onSubmit={checkIn} className="mt-4 flex gap-2">
        <input
          placeholder="Event ID (see /events)"
          value={eventId}
          onChange={(e) => setEventId(e.target.value)}
          className="flex-1 border px-3 py-2"
        />
        <button type="submit" className="border px-3 py-2">Check in</button>
      </form>
      <ul className="mt-6 flex flex-col gap-2">
        {history.map((a) => (
          <li key={a.id} className="border p-3 text-sm">
            {a.event.title} — {new Date(a.checkedInAt).toLocaleString()}
          </li>
        ))}
      </ul>
    </main>
  );
}
