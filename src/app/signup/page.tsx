"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ClubShell } from "@/components/club/ClubShell";
import { PasswordInput } from "@/components/site/PasswordInput";
import { api } from "@/lib/api";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.title = error ? "Error: Create account · LOGICA @ UIC" : "Create account · LOGICA @ UIC";
  }, [error]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError(null);
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      await api("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({ name: name.trim(), email: email.trim().toLowerCase(), password }),
      });
      setPassword("");
      setConfirmPassword("");
      const next = new URLSearchParams(window.location.search).get("next");
      router.replace(next?.startsWith("/") && !next.startsWith("//") ? next : "/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create your account. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ClubShell>
      <main className="auth-wrap">
        <div className="site-card auth-card">
          <header className="auth-head">
            <h1 className="serif">Create your LOGICA account</h1>
            <p>A UIC email address is required. You&apos;ll land in your member dashboard.</p>
          </header>
          {error && <p id="signup-error" role="alert" className="site-error">{error}</p>}
          <form onSubmit={submit} className="site-form auth-form" aria-busy={busy} aria-describedby={error ? "signup-error" : undefined}>
            <label className="site-field" htmlFor="name">
              <span>Full name</span>
              <input id="name" name="name" type="text" autoComplete="name" maxLength={100} required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
            </label>
            <label className="site-field" htmlFor="email">
              <span>UIC email</span>
              <input id="email" name="email" type="email" autoComplete="username" autoCapitalize="none" spellCheck={false} maxLength={254} required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="netid@uic.edu" />
            </label>
            <div className="site-field">
              <label htmlFor="password">Password</label>
              <PasswordInput id="password" name="password" show={showPassword} onToggle={() => setShowPassword(!showPassword)} autoComplete="new-password" minLength={10} maxLength={200} value={password} onChange={setPassword} placeholder="At least 10 characters" />
            </div>
            <div className="site-field">
              <label htmlFor="confirm-password">Confirm password</label>
              <PasswordInput id="confirm-password" name="confirmPassword" show={showPassword} onToggle={() => setShowPassword(!showPassword)} autoComplete="new-password" minLength={10} maxLength={200} value={confirmPassword} onChange={setConfirmPassword} placeholder="Repeat it" />
            </div>
            <button type="submit" disabled={busy} className="site-btn block">{busy ? "Creating account…" : "Create account"}</button>
          </form>
          <p className="auth-alt">Already have an account? <Link href="/signin">Sign in</Link></p>
        </div>
      </main>
    </ClubShell>
  );
}
