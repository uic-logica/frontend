"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ClubShell, PageContainer } from "@/components/club/ClubShell";
import { darkButtonClass, darkInputClass, darkInputErrorClass } from "@/components/ui/darkForm";
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
      <PageContainer>
            <header className="auth-head">
              <h1>Speaker sign-in</h1>
              <p>For confirmed speakers — no UIC email required.</p>
            </header>

            <div className="club-card auth-card">
              <p className="auth-intro">
                Use the username and password from your invite email.
              </p>

              {error && (
                <div
                  className="rounded-lg mt-5 border-2 border-signal bg-signal/10 px-4 py-3 text-body-sm text-white"
                  role="alert"
                >
                  {error}
                </div>
              )}

              <form onSubmit={submit} className="mt-6 flex flex-col gap-5" noValidate>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="username" className="type-label text-white">
                    Username
                  </label>
                  <input
                    id="username"
                    autoComplete="username"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={error ? darkInputErrorClass : darkInputClass}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="password" className="type-label text-white">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={error ? darkInputErrorClass : darkInputClass}
                  />
                </div>
                <button type="submit" disabled={busy} className={darkButtonClass}>
                  {busy ? "Signing in…" : "Sign in"}
                </button>
              </form>
            </div>

            <p className="auth-foot">
              UIC student or board member? <Link href="/signin">Sign in here</Link>
            </p>
      </PageContainer>
    </ClubShell>
  );
}
