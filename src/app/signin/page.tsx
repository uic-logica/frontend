"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AppShell,
  Field,
  RoleChip,
  buttonClass,
  inputClass,
  inputErrorClass,
} from "@/components/shell/AppShell";
import { api } from "@/lib/api";

type Profile = { id: string; name: string | null; email: string; role: string };

type Step = "email" | "code" | "role";

function roleCopy(role: string) {
  if (role === "EXEC_BOARD") return "Exec Board — you can run check-in and moderate.";
  if (role === "BOARD") return "Board — you can post and help run events.";
  return "Member — standard member access.";
}

/**
 * Sign-in — CONTENT.md §3 (Welcome → Email → Verification → Session/Role check)
 * + Eddie ICAIC panel.
 */
export default function SignInPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    document.title = error ? "Error: Sign in · LOGICA @ UIC" : "Sign in · LOGICA @ UIC";
  }, [error]);

  function validateEdu(value: string) {
    const v = value.trim().toLowerCase();
    if (!v.includes("@")) return "Enter a valid email address.";
    if (!v.endsWith(".edu")) return "Use a .edu email — LOGICA is for UIC members.";
    return null;
  }

  async function requestCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const invalid = validateEdu(email);
    if (invalid) {
      setError(invalid);
      return;
    }
    setBusy(true);
    try {
      const { csrfToken } = await (await fetch("/api/auth/csrf")).json();
      const res = await fetch("/api/auth/signin/nodemailer", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ email, csrfToken, json: "true" }),
        redirect: "manual",
      });
      if (res.type !== "opaqueredirect" && !res.ok) {
        throw new Error("Could not send a code. Is the backend running?");
      }
      setStep("code");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "That code isn't valid or has expired.");

      const me = await api<Profile>("/api/profile");
      setProfile(me);
      setStep("role");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell>
      <div className="grid min-h-[calc(100svh-8rem)]">
        <section className="flex items-center justify-center bg-paper px-6 py-12 md:px-12">
          <div className="card mx-auto w-full max-w-md border-ink p-6 shadow-block md:p-8">
            {step === "role" && profile ? (
              <>
                <h2 className="type-h2">You&apos;re signed in</h2>
                <p className="mt-2 text-body-sm text-ink-muted">Session and role check</p>
                <div className="mt-6 border border-rule bg-paper px-4 py-5">
                  <p className="type-h3">{profile.name?.trim() || profile.email}</p>
                  <p className="mt-1 text-body-sm text-ink-muted">{profile.email}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <RoleChip role={profile.role} />
                    <span className="text-body-sm text-ink-muted">{roleCopy(profile.role)}</span>
                  </div>
                </div>
                <button
                  type="button"
                  className={`${buttonClass} mt-6 w-full`}
                  onClick={() => router.push("/members")}
                >
                  Continue to member hub
                </button>
              </>
            ) : (
              <>
                <h2 className="type-h2">
                  {step === "email" ? "Sign in to LOGICA" : "Enter your code"}
                </h2>
                <p className="mt-2 text-body-sm text-ink-muted">
                  {step === "email"
                    ? "Passwordless. Only .edu addresses are accepted."
                    : `We sent a one-time code to ${email}.`}
                </p>

                {error && (
                  <div
                    className="mt-4 border-2 border-signal bg-paper px-3 py-2 text-body-sm text-signal"
                    role="alert"
                  >
                    {error}
                  </div>
                )}

                {step === "email" ? (
                  <form onSubmit={requestCode} className="mt-6 flex flex-col gap-4" noValidate>
                    <Field id="email" label="UIC email" hint="Example: netid@uic.edu">
                      <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={error ? inputErrorClass : inputClass}
                        placeholder="netid@uic.edu"
                        aria-invalid={Boolean(error)}
                      />
                    </Field>
                    <button type="submit" disabled={busy} className={buttonClass}>
                      {busy ? "Sending…" : "Continue"}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={verifyCode} className="mt-6 flex flex-col gap-4">
                    <Field id="code" label="Verification code">
                      <input
                        id="code"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        required
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className={error ? inputErrorClass : inputClass}
                        placeholder="123456"
                      />
                    </Field>
                    <button type="submit" disabled={busy} className={buttonClass}>
                      {busy ? "Verifying…" : "Verify & continue"}
                    </button>
                    <button
                      type="button"
                      className="type-label text-left text-signal underline-offset-4 hover:underline"
                      onClick={() => {
                        setStep("email");
                        setCode("");
                        setError(null);
                      }}
                    >
                      Use a different email
                    </button>
                  </form>
                )}
              </>
            )}

            <p className="mt-8 text-caption text-ink-muted">
              Need the public site?{" "}
              <Link href="/" className="font-bold text-signal underline-offset-2 hover:underline">
                Back home
              </Link>
            </p>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
