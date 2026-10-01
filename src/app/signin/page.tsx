"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ClubShell, PageContainer } from "@/components/club/ClubShell";
import { MailIcon } from "@/components/ui/MailIcon";
import { darkButtonClass, darkInputClass } from "@/components/ui/darkForm";
import { api } from "@/lib/api";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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
      setError(err instanceof Error ? err.message : "Could not sign in. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ClubShell>
      <PageContainer>
        <header className="auth-head">
          <h1>Sign in to LOGICA</h1>
          <p>Members, board, and exec board</p>
        </header>
        <div className="club-card auth-card">
          <p className="auth-intro">New to LOGICA? <Link href="/signup">Create an account</Link> with your UIC email.</p>
          {error && <p id="signin-error" role="alert" className="mt-5 rounded-lg border-2 border-signal bg-signal/10 px-4 py-3 text-body-sm text-white">{error}</p>}
          <form onSubmit={submit} className="mt-6 flex flex-col gap-5" aria-busy={busy} aria-describedby={error ? "signin-error" : undefined}>
            <div className="auth-field">
              <label htmlFor="email" className="type-label">UIC email</label>
              <MailIcon />
              <input id="email" name="email" type="email" autoComplete="username" autoCapitalize="none" spellCheck={false} maxLength={254} required value={email} onChange={(e) => setEmail(e.target.value)} className={darkInputClass} placeholder="netid@uic.edu" />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="auth-field">
                <label htmlFor="password" className="type-label">Password</label>
                <input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" maxLength={128} required value={password} onChange={(e) => setPassword(e.target.value)} className={darkInputClass} />
              </div>
              <button type="button" aria-pressed={showPassword} aria-controls="password" className="auth-toggle" onClick={() => setShowPassword(!showPassword)}>{showPassword ? "Hide password" : "Show password"}</button>
            </div>
            <button type="submit" disabled={busy} className={darkButtonClass}>{busy ? "Signing in…" : "Sign in"}</button>
          </form>
          <p className="auth-note">Forgot your password? <Link href="/support">Contact the exec board</Link> to verify your identity and receive a new one.</p>
        </div>
        <p className="auth-foot">Guest or speaker? <Link href="/speaker-signin">Sign in here</Link></p>
      </PageContainer>
    </ClubShell>
  );
}
