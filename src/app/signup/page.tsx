"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ClubShell, PageContainer, SectionContainer } from "@/components/club/ClubShell";
import { darkButtonClass, darkInputClass } from "@/components/ui/darkForm";
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
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create your account. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ClubShell>
      <PageContainer>
        <SectionContainer>
          <div className="mx-auto max-w-md">
            <h1 className="type-title text-3xl md:text-4xl text-white">Create your LOGICA account</h1>
            <p className="mt-3 text-xl text-signal md:text-2xl">A UIC email address is required</p>
            <div className="mt-10 club-card bg-white/[0.02] p-8 md:p-10">
              <p className="text-body text-white">Create an account to access the LOGICA member dashboard.</p>
              {error && <p id="signup-error" role="alert" className="mt-5 rounded-lg border-2 border-signal bg-signal/10 px-4 py-3 text-body-sm text-white">{error}</p>}
              <form onSubmit={submit} className="mt-6 flex flex-col gap-5" aria-busy={busy} aria-describedby={error ? "signup-error" : undefined}>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="name" className="type-label text-white">Full name</label>
                  <input id="name" name="name" type="text" autoComplete="name" maxLength={100} required value={name} onChange={(e) => setName(e.target.value)} className={darkInputClass} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className="type-label text-white">UIC email</label>
                  <input id="email" name="email" type="email" autoComplete="username" autoCapitalize="none" spellCheck={false} maxLength={254} required value={email} onChange={(e) => setEmail(e.target.value)} className={darkInputClass} placeholder="netid@uic.edu" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="password" className="type-label text-white">Password (at least 10 characters)</label>
                  <input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="new-password" minLength={10} maxLength={200} required value={password} onChange={(e) => setPassword(e.target.value)} className={darkInputClass} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="confirm-password" className="type-label text-white">Confirm password</label>
                  <input id="confirm-password" name="confirmPassword" type={showPassword ? "text" : "password"} autoComplete="new-password" minLength={10} maxLength={200} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={darkInputClass} />
                  <button type="button" aria-pressed={showPassword} aria-controls="password confirm-password" className="type-label text-left text-signal hover:underline" onClick={() => setShowPassword(!showPassword)}>{showPassword ? "Hide passwords" : "Show passwords"}</button>
                </div>
                <button type="submit" disabled={busy} className={darkButtonClass}>{busy ? "Creating account…" : "Create account"}</button>
              </form>
              <p className="mt-6 text-body-sm text-white">Already have an account? <Link href="/signin" className="font-bold text-signal underline-offset-2 hover:underline">Sign in</Link></p>
            </div>
          </div>
        </SectionContainer>
      </PageContainer>
    </ClubShell>
  );
}
