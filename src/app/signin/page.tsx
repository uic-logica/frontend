"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ClubShell, PageContainer, SectionContainer } from "@/components/club/ClubShell";
import { darkButtonClass, darkInputClass } from "@/components/ui/darkForm";
import { api } from "@/lib/api";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ClubShell>
      <PageContainer>
        <SectionContainer>
          <div className="mx-auto max-w-md">
            <h1 className="type-title text-3xl md:text-4xl text-white">Sign in to LOGICA</h1>
            <p className="mt-3 text-xl text-signal md:text-2xl">Members, board, and exec board</p>
            <div className="mt-10 club-card bg-white/[0.02] p-8 md:p-10">
              <p className="text-body text-white">Use your UIC email and the password issued to you by the exec board.</p>
              {error && <p id="signin-error" role="alert" className="mt-5 rounded-lg border-2 border-signal bg-signal/10 px-4 py-3 text-body-sm text-white">{error}</p>}
              <form onSubmit={submit} className="mt-6 flex flex-col gap-5" aria-busy={busy} aria-describedby={error ? "signin-error" : undefined}>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className="type-label text-white">UIC email</label>
                  <input id="email" name="email" type="email" autoComplete="username" autoCapitalize="none" spellCheck={false} maxLength={254} required value={email} onChange={(e) => setEmail(e.target.value)} className={darkInputClass} placeholder="netid@uic.edu" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="password" className="type-label text-white">Password</label>
                  <input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" maxLength={128} required value={password} onChange={(e) => setPassword(e.target.value)} className={darkInputClass} />
                  <button type="button" aria-pressed={showPassword} aria-controls="password" className="type-label text-left text-signal hover:underline" onClick={() => setShowPassword(!showPassword)}>{showPassword ? "Hide password" : "Show password"}</button>
                </div>
                <button type="submit" disabled={busy} className={darkButtonClass}>{busy ? "Signing in…" : "Sign in"}</button>
              </form>
              <p className="mt-6 text-body-sm text-white">Need a password or forgot yours? <Link href="/support" className="font-bold text-signal underline">Contact the exec board</Link> to verify your identity and receive a new password.</p>
            </div>
            <p className="mt-8 text-body text-white">Guest or speaker? <Link href="/speaker-signin" className="font-bold text-signal underline-offset-2 hover:underline">Sign in here</Link></p>
          </div>
        </SectionContainer>
      </PageContainer>
    </ClubShell>
  );
}
