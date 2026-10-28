"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ClubShell } from "@/components/club/ClubShell";
import { PasswordInput } from "@/components/site/PasswordInput";
import { api } from "@/lib/api";

/**
 * Both halves of a password reset (see backend's AUTH.md):
 * no token → ask for an email and send a link; #token=… from that link → choose a new password.
 * The token lives in the fragment so it never reaches a server log.
 */
export default function ResetPasswordPage() {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  // Set once the new password is saved: where that account signs in.
  const [signIn, setSignIn] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the fragment only exists after hydration
    setToken(new URLSearchParams(window.location.hash.slice(1)).get("token"));
  }, []);

  useEffect(() => {
    document.title = `${error ? "Error: " : ""}Reset password · LOGICA @ UIC`;
  }, [error]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError(null);
    if (token && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      if (token) {
        const { accountKind } = await api<{ accountKind: string }>("/api/auth/reset-password", {
          method: "POST",
          body: JSON.stringify({ token, password }),
        });
        setPassword("");
        setConfirmPassword("");
        // The link is spent; don't leave it in the address bar or history.
        history.replaceState(null, "", window.location.pathname);
        setSignIn(accountKind === "MEMBER" ? "/signin" : "/speaker-signin");
      } else {
        await api("/api/auth/forgot-password", { method: "POST", body: JSON.stringify({ email: email.trim().toLowerCase() }) });
        setSent(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ClubShell>
      <main className="auth-wrap">
        <div className="site-card auth-card">
          <header className="auth-head">
            <h1 className="serif">{token ? "Choose a new password" : "Reset your password"}</h1>
            <p>{token ? "You'll be signed out everywhere else." : "We'll email you a link to choose a new one."}</p>
          </header>
          {error && <p id="reset-error" role="alert" className="site-error">{error}{token && <> <Link href="/reset-password" onClick={() => { setToken(null); setError(null); }}>Send a new link</Link></>}</p>}
          {signIn ? (
            <>
              <p role="status" className="site-success">Your password is updated.</p>
              <Link href={signIn} className="site-btn block">Sign in</Link>
            </>
          ) : sent ? (
            <p role="status" className="site-success">
              If <strong>{email.trim().toLowerCase()}</strong> has a LOGICA account, a reset link is on its way. It works once and expires in an hour. Check spam if you don&apos;t see it.
            </p>
          ) : (
            <form onSubmit={submit} className="site-form auth-form" aria-busy={busy} aria-describedby={error ? "reset-error" : undefined}>
              {token ? (
                <>
                  <div className="site-field">
                    <label htmlFor="password">New password</label>
                    <PasswordInput id="password" name="password" show={showPassword} onToggle={() => setShowPassword(!showPassword)} autoComplete="new-password" minLength={10} maxLength={200} value={password} onChange={setPassword} placeholder="At least 10 characters" />
                  </div>
                  <div className="site-field">
                    <label htmlFor="confirm-password">Confirm new password</label>
                    <PasswordInput id="confirm-password" name="confirmPassword" show={showPassword} onToggle={() => setShowPassword(!showPassword)} autoComplete="new-password" minLength={10} maxLength={200} value={confirmPassword} onChange={setConfirmPassword} placeholder="Repeat it" />
                  </div>
                </>
              ) : (
                <label className="site-field" htmlFor="email">
                  <span>Email</span>
                  <input id="email" name="email" type="email" autoComplete="email" autoCapitalize="none" spellCheck={false} maxLength={254} required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="The one you signed up with" />
                </label>
              )}
              <button type="submit" disabled={busy} className="site-btn block">
                {busy ? (token ? "Saving…" : "Sending…") : token ? "Save new password" : "Email me a link"}
              </button>
            </form>
          )}
          <p className="auth-alt">Remembered it? <Link href="/signin">Sign in</Link></p>
        </div>
      </main>
    </ClubShell>
  );
}
