"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ClubShell, PageContainer, SectionContainer } from "@/components/club/ClubShell";
import { darkButtonClass as primaryButtonClass, darkInputClass, darkInputErrorClass } from "@/components/ui/darkForm";
import { api } from "@/lib/api";

type Profile = { id: string; name: string | null; email: string; role: string };

type Step = "email" | "code" | "role";

function roleCopy(role: string) {
  if (role === "EXEC_BOARD") return "Exec Board — you can run check-in and moderate.";
  if (role === "BOARD") return "Board — you can post and help run events.";
  return "Member — standard member access.";
}

function RoleBadge({ role }: { role: string }) {
  if (role === "MEMBER" || !role) return null;
  const exec = role === "EXEC_BOARD";
  return (
    <span
      className={`type-label inline-flex h-6 items-center rounded-full px-2.5 ${
        exec ? "bg-signal text-white" : "bg-white/10 text-white"
      }`}
    >
      {exec ? "Exec board" : "Board"}
    </span>
  );
}

/**
 * Sign-in — CONTENT.md §3 (Welcome → Email → Verification → Session/Role check).
 * Same black/white/gold club theme as the rest of the public site, not a stray
 * white modal — this page still lives inside ClubShell (nav, canvas, footer).
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
    <ClubShell>
      <PageContainer>
        <SectionContainer>
          <div className="mx-auto max-w-md">
            <h1 className="type-h1 text-white">
              {step === "role" && profile ? "You're signed in" : "Sign in to LOGICA"}
            </h1>
            <p className="mt-3 text-xl text-signal md:text-2xl">
              {step === "role" && profile
                ? "Session and role check"
                : "Passwordless — only .edu addresses are accepted."}
            </p>

            <div className="mt-10 rounded-2xl bg-white/[0.02] p-8 ring-1 ring-white/10 md:p-10">
              {step === "role" && profile ? (
                <>
                  <div className="border border-white/15 bg-black px-5 py-6">
                    <p className="type-h3 text-white">{profile.name?.trim() || profile.email}</p>
                    <p className="mt-1 text-body-sm text-white/60">{profile.email}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <RoleBadge role={profile.role} />
                      <span className="text-body-sm text-white/60">{roleCopy(profile.role)}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className={`${primaryButtonClass} mt-6`}
                    onClick={() => router.push("/members")}
                  >
                    Continue to member hub
                  </button>
                </>
              ) : (
                <>
                  <p className="text-body text-white/70">
                    {step === "email"
                      ? "We'll email you a one-time code — no password to remember."
                      : `We sent a one-time code to ${email}.`}
                  </p>

                  {error && (
                    <div
                      className="mt-5 border-2 border-signal bg-signal/10 px-4 py-3 text-body-sm text-white"
                      role="alert"
                    >
                      {error}
                    </div>
                  )}

                  {step === "email" ? (
                    <form onSubmit={requestCode} className="mt-6 flex flex-col gap-5" noValidate>
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="email" className="type-label text-white/70">
                          UIC email
                        </label>
                        <p className="text-caption text-white/40">Example: netid@uic.edu</p>
                        <input
                          id="email"
                          type="email"
                          autoComplete="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={error ? darkInputErrorClass : darkInputClass}
                          placeholder="netid@uic.edu"
                          aria-invalid={Boolean(error)}
                        />
                      </div>
                      <button type="submit" disabled={busy} className={primaryButtonClass}>
                        {busy ? "Sending…" : "Continue"}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={verifyCode} className="mt-6 flex flex-col gap-5">
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="code" className="type-label text-white/70">
                          Verification code
                        </label>
                        <input
                          id="code"
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          required
                          value={code}
                          onChange={(e) => setCode(e.target.value)}
                          className={error ? darkInputErrorClass : darkInputClass}
                          placeholder="123456"
                        />
                      </div>
                      <button type="submit" disabled={busy} className={primaryButtonClass}>
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
            </div>

            <p className="mt-8 text-caption text-white/50">
              Not from UIC?{" "}
              <Link href="/speaker-signin" className="font-bold text-signal underline-offset-2 hover:underline">
                Sign in here
              </Link>
            </p>
            <p className="mt-2 text-caption text-white/50">
              Need the public site?{" "}
              <Link href="/" className="font-bold text-signal underline-offset-2 hover:underline">
                Back home
              </Link>
            </p>
          </div>
        </SectionContainer>
      </PageContainer>
    </ClubShell>
  );
}
