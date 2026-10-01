"use client";

import { useId, useState } from "react";
import { ApiError, api } from "@/lib/api";
import { darkButtonClass, darkInputClass } from "@/components/ui/darkForm";

/**
 * The newsletter capture, opened by "Notify me" on the events page's empty state.
 */
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

  if (done) return <p className="subscribe-done" role="status">You&apos;re subscribed for event updates.</p>;

  return (
    <form onSubmit={submit} className="subscribe-form">
      <label htmlFor={`${id}-email`} className="type-label">
        UIC email
      </label>
      <div>
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
          className={darkInputClass}
        />
        <button type="submit" disabled={busy} className={`${darkButtonClass} sm:w-auto`}>
          {busy ? "Subscribing…" : "Subscribe"}
        </button>
      </div>
      {error && (
        <p className="text-body-sm text-signal" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
