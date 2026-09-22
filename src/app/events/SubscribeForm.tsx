"use client";

import { useId, useState } from "react";
import { ApiError, api } from "@/lib/api";
import { darkButtonClass, darkInputClass } from "@/components/ui/darkForm";

/**
 * The newsletter capture. Its own file because the events page is a server
 * component now — this is the only part of it that needs to run in the browser.
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

  return (
    <div className="club-card mx-auto w-full max-w-xl p-8">
      <h2 className="type-h3 text-white">Stay Updated</h2>
      {done ? (
        <p className="mt-3 text-body text-white">You&apos;re subscribed for event updates.</p>
      ) : (
        <>
          <p className="mt-3 text-body text-white">Enter your UIC email to receive event updates.</p>
          <form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
            <label htmlFor={`${id}-email`} className="grid gap-2 type-label text-white">
              UIC email
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
            </label>
            <button type="submit" disabled={busy} className={`${darkButtonClass} sm:w-auto`}>
              {busy ? "Subscribing…" : "Subscribe"}
            </button>
          </form>
          {error && (
            <p className="mt-4 text-body-sm text-signal" role="alert">
              {error}
            </p>
          )}
        </>
      )}
    </div>
  );
}
