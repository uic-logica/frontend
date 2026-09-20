"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ClubShell, PageContainer, SectionContainer } from "@/components/club/ClubShell";
import { darkButtonClass, darkInputClass, darkInputErrorClass } from "@/components/ui/darkForm";
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
      <PageContainer>
        <SectionContainer>
          <div className="mx-auto max-w-md">
            <h1 className="text-3xl font-bold md:text-4xl text-white">Set your password</h1>
            <p className="mt-3 text-xl text-signal md:text-2xl">
              First time signing in — pick a password you&apos;ll actually remember.
            </p>

            <div className="mt-10 club-card bg-white/[0.02] p-8 md:p-10">
              {error && (
                <div
                  className="rounded-lg mb-6 border-2 border-signal bg-signal/10 px-4 py-3 text-body-sm text-white"
                  role="alert"
                >
                  {error}
                </div>
              )}

              <form onSubmit={submit} className="flex flex-col gap-5" noValidate>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="currentPassword" className="type-label text-white">
                    Temporary password
                  </label>
                  <p className="text-caption text-white">From your invite email.</p>
                  <input
                    id="currentPassword"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className={error ? darkInputErrorClass : darkInputClass}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="newPassword" className="type-label text-white">
                    New password
                  </label>
                  <p className="text-caption text-white">At least {MIN_LENGTH} characters.</p>
                  <input
                    id="newPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={darkInputClass}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="confirm" className="type-label text-white">
                    Confirm new password
                  </label>
                  <input
                    id="confirm"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className={darkInputClass}
                  />
                </div>
                <button type="submit" disabled={busy} className={darkButtonClass}>
                  {busy ? "Saving…" : "Set password"}
                </button>
              </form>
            </div>
          </div>
        </SectionContainer>
      </PageContainer>
    </ClubShell>
  );
}
