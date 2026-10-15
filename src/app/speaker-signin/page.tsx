"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ClubShell } from "@/components/club/ClubShell";
import { api } from "@/lib/api";

type LoginResult = { id: string; username: string; mustChangePassword: boolean };

/** Sign-in for SPEAKER accounts — username + password, no .edu required. See backend's AUTH.md. */
export default function SpeakerSignInPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const result = await api<LoginResult>("/api/auth/speaker-login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      router.push(result.mustChangePassword ? "/speaker-signin/set-password" : "/speaker-portal");
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
          <span className="site-badge auth-tag">Guests &amp; speakers</span>
          <header className="auth-head">
            <h1 className="serif">Speaker sign-in</h1>
            <p>For speakers and partner clubs. No UIC email required.</p>
          </header>
          <p className="auth-intro">Use the username or email and the password LOGICA sent you.</p>
          {error && <p className="site-error" role="alert">{error}</p>}
          <form onSubmit={submit} className="site-form auth-form" noValidate>
            <label className="site-field" htmlFor="username">
              <span>Username</span>
              <input id="username" autoComplete="username" required value={username} onChange={(e) => setUsername(e.target.value)} placeholder="From your invite email" className={error ? "site-input-error" : undefined} />
            </label>
            <label className="site-field" htmlFor="password">
              <span>Password</span>
              <input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" className={error ? "site-input-error" : undefined} />
            </label>
            <button type="submit" disabled={busy} className="site-btn block">{busy ? "Signing in…" : "Sign in"}</button>
          </form>
          <p className="auth-alt">UIC student or board member? <Link href="/signin">Sign in here</Link></p>
        </div>
      </main>
    </ClubShell>
  );
}
