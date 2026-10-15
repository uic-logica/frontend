"use client";

import { useId, useState } from "react";
import { ApiError, api } from "@/lib/api";

/** The newsletter capture beside the events list. */
export function SubscribeForm() {
  const id = useId();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("/api/subscribe", {
        method: "POST",
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (done) return <p className="site-success" role="status">You&apos;re subscribed for event updates.</p>;

  return (
    <form onSubmit={submit} className="site-form">
      <label className="site-field" htmlFor={`${id}-email`}>
        <span>Email</span>
        <input
          id={`${id}-email`}
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="netid@uic.edu"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      {error && <p className="site-error" role="alert">{error}</p>}
      <button type="submit" disabled={busy} className="site-btn block">
        {busy ? "Subscribing…" : "Notify me"}
      </button>
    </form>
  );
}
