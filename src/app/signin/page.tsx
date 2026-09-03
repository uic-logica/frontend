"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// logica-lean: bare-minimum sign-in for the e2e scaffold — real [FE 3]
// ticket designs the actual screen. Two steps: request a code (Auth.js's
// own /api/auth/signin/nodemailer, which needs a CSRF token first), then
// redeem it via backend's /api/auth/otp/verify.
export default function SignInPage() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function requestCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const { csrfToken } = await (await fetch("/api/auth/csrf")).json();
      const res = await fetch("/api/auth/signin/nodemailer", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ email, csrfToken, json: "true" }),
        // Auth.js always 302s this endpoint to its own HTML "check your email"
        // page, which we don't want or need — `redirect: "manual"` stops the
        // browser from loading it. That redirect (an opaque, unreadable
        // response) is what "sent" looks like; anything else is a real failure.
        redirect: "manual",
      });
      if (res.type !== "opaqueredirect" && !res.ok) throw new Error("Could not send a code.");
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
      if (!res.ok) throw new Error(body.error ?? "That code isn't valid.");
      router.push("/profile");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-sm p-8">
      <h1 className="text-xl font-semibold">Sign in [scaffold]</h1>
      {step === "email" ? (
        <form onSubmit={requestCode} className="mt-4 flex flex-col gap-3">
          <input
            type="email"
            required
            placeholder="you@uic.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border px-3 py-2"
          />
          <button type="submit" disabled={busy} className="border px-3 py-2">
            {busy ? "Sending…" : "Send code"}
          </button>
        </form>
      ) : (
        <form onSubmit={verifyCode} className="mt-4 flex flex-col gap-3">
          <p className="text-sm">Code sent to {email}.</p>
          <input
            required
            placeholder="123456"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="border px-3 py-2"
          />
          <button type="submit" disabled={busy} className="border px-3 py-2">
            {busy ? "Verifying…" : "Verify"}
          </button>
        </form>
      )}
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </main>
  );
}
