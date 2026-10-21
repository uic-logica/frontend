"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ClubShell } from "@/components/club/ClubShell";
import { PasswordInput } from "@/components/site/PasswordInput";
import { SiteIcon } from "@/components/site/icons";
import { ApiError, api } from "@/lib/api";

function nextParam() {
  return typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("next");
}

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // Set when the email has no account at all, so the error can offer signup instead of a dead end.
  const [noAccount, setNoAccount] = useState(false);

  // Already signed in (the session lasts 30 days): skip the form.
  useEffect(() => {
    api<{ user?: unknown } | null>("/api/auth/session")
      .then((me) => {
        if (!me?.user) return;
        const next = new URLSearchParams(window.location.search).get("next");
        router.replace(next?.startsWith("/") && !next.startsWith("//") ? next : "/dashboard");
      })
      .catch(() => {});
  }, [router]);

  useEffect(() => {
    document.title = error ? "Error: Sign in · LOGICA @ UIC" : "Sign in · LOGICA @ UIC";
  }, [error]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError(null);
    setNoAccount(false);
    setBusy(true);
    try {
      await api("/api/auth/member-login", {
        method: "POST",
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      setPassword("");
      // Only same-site paths, so ?next= can't bounce anyone off the site.
      const next = new URLSearchParams(window.location.search).get("next");
      router.replace(next?.startsWith("/") && !next.startsWith("//") ? next : "/dashboard");
    } catch (err) {
      setNoAccount(err instanceof ApiError && err.status === 404);
      setError(err instanceof Error ? err.message : "Could not sign in. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ClubShell>
      <main className="auth-wrap">
        <div className="site-card auth-card">
          <header className="auth-head">
            <h1 className="serif">Sign in to LOGICA</h1>
            <p>Members, board, and exec board</p>
          </header>
          <p className="auth-intro">New to LOGICA? <Link href="/signup">Create an account</Link> with your UIC email.</p>
          {error && (
            <p id="signin-error" role="alert" className="site-error">
              {error}
              {noAccount && (
                <>
                  {" "}
                  <Link href={`/signup?${new URLSearchParams({ email: email.trim().toLowerCase(), ...(nextParam() && { next: nextParam()! }) })}`}>Create your account</Link>
                </>
              )}
            </p>
          )}
          <form onSubmit={submit} className="site-form auth-form" aria-busy={busy} aria-describedby={error ? "signin-error" : undefined}>
            <label className="site-field" htmlFor="email">
              <span>UIC email</span>
              <input id="email" name="email" type="email" autoComplete="username" autoCapitalize="none" spellCheck={false} maxLength={254} required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="netid@uic.edu" />
            </label>
            <div className="site-field">
              <label htmlFor="password">Password</label>
              <PasswordInput id="password" name="password" show={showPassword} onToggle={() => setShowPassword(!showPassword)} autoComplete="current-password" maxLength={128} value={password} onChange={setPassword} placeholder="Your password" />
            </div>
            <button type="submit" disabled={busy} className="site-btn block">{busy ? "Signing in…" : "Sign in"}</button>
          </form>
          <p className="auth-alt">Forgot your password? <Link href="/support">Contact the exec board</Link></p>
          <p className="auth-note">We&apos;ll verify your identity and send you a new one.</p>
          <hr className="auth-rule" />
          <p className="auth-alt">Guest or speaker? <Link href="/speaker-signin" className="auth-arrow">Sign in here <SiteIcon name="arrow" size={14} /></Link></p>
        </div>
      </main>
    </ClubShell>
  );
}
