"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ClubShell } from "@/components/club/ClubShell";
import { AuthSteps } from "@/components/site/AuthSteps";
import { api } from "@/lib/api";

const MIN_LENGTH = 8;

/** Forced on first speaker login (mustChangePassword) — also reachable any time to change it again. */
export default function SetSpeakerPasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword.length < MIN_LENGTH) {
      setError(`New password must be at least ${MIN_LENGTH} characters.`);
      return;
    }
    if (newPassword !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setBusy(true);
    try {
      await api("/api/auth/set-password", {
        method: "POST",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      router.push("/speaker-portal");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ClubShell>
      <main className="auth-wrap">
        <div className="site-card auth-card">
          <AuthSteps steps={["Invite email", "New password", "Speaker portal"]} current={1} />
          <header className="auth-head">
            <h1 className="serif">Set your password</h1>
            <p>First time signing in? Pick a password you&apos;ll actually remember.</p>
          </header>
          {error && <p className="site-error" role="alert">{error}</p>}
          <form onSubmit={submit} className="site-form auth-form" noValidate>
            <label className="site-field" htmlFor="currentPassword">
              <span>Temporary password</span>
              <small>From your invite email.</small>
              <input id="currentPassword" type="password" autoComplete="current-password" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className={error ? "site-input-error" : undefined} />
            </label>
            <label className="site-field" htmlFor="newPassword">
              <span>New password</span>
              <small>At least {MIN_LENGTH} characters.</small>
              <input id="newPassword" type="password" autoComplete="new-password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password" />
            </label>
            <label className="site-field" htmlFor="confirm">
              <span>Confirm new password</span>
              <input id="confirm" type="password" autoComplete="new-password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repeat it" />
            </label>
            <button type="submit" disabled={busy} className="site-btn block">{busy ? "Saving…" : "Set password"}</button>
          </form>
        </div>
      </main>
    </ClubShell>
  );
}
