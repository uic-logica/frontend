"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { ClubShell, PageContainer, SectionContainer } from "@/components/club/ClubShell";
import { darkButtonClass, darkInputClass, darkInputErrorClass } from "@/components/ui/darkForm";
import { api } from "@/lib/api";

type VisitKind = "TALK" | "WORKSHOP" | "COMPANY_VISIT";

type Invite = {
  name: string | null;
  email: string | null;
  organization: string | null;
  kind: VisitKind;
};

type State =
  | { kind: "loading" }
  | { kind: "dead"; message: string }
  | { kind: "ready"; invite: Invite };

const NOUN: Record<VisitKind, string> = {
  TALK: "talk",
  WORKSHOP: "workshop",
  COMPANY_VISIT: "company visit",
};

const ASK: Record<VisitKind, string> = {
  TALK: "We'd like you to come and give a talk.",
  WORKSHOP: "We'd like you to come and run a workshop.",
  COMPANY_VISIT: "We'd like to bring the club out to visit you.",
};

/**
 * The link a board member sends a guest. One page: pick an email and a
 * password, and you're signed in to your own dashboard, where the only
 * thing waiting is "when are you free".
 *
 * It replaces the old two-step flow, where the guest filled a form and then
 * waited for someone on exec to email them a temporary password.
 */
export default function ClaimInvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router = useRouter();
  const [state, setState] = useState<State>({ kind: "loading" });
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [signedIn, setSignedIn] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    api<Invite>("/api/invites/lookup", { method: "POST", body: JSON.stringify({ token }) })
      .then((invite) => {
        if (!alive) return;
        setState({ kind: "ready", invite });
        setName(invite.name ?? "");
        setEmail(invite.email ?? "");
      })
      .catch((e: Error) => alive && setState({ kind: "dead", message: e.message }));

    // A board member checking their own link is the likely visitor here
    // after the guest. Warn before they fill anything in — the server
    // refuses the claim, but finding that out after typing a password is
    // a worse way to learn it.
    api<{ user?: { name: string | null } } | null>("/api/auth/session")
      .then((s) => alive && setSignedIn(s?.user?.name ?? null))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [token]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await api("/api/invites/claim", {
        method: "POST",
        body: JSON.stringify({ token, name, email, password }),
      });
      // The claim signs them in, so this lands on their dashboard, not a
      // "check your email" screen.
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setBusy(false);
    }
  }

  let body: React.ReactNode;
  let title = "You're invited";
  let standfirst = "Set up your account and you're done.";

  if (state.kind === "loading") {
    body = <p className="text-body-sm text-white">Loading…</p>;
  } else if (state.kind === "dead") {
    title = "This link won't work";
    standfirst = "Nothing you did wrong.";
    body = (
      <div className="club-card bg-white/[0.02] p-8">
        <p className="text-body text-white">{state.message}</p>
        <p className="mt-5 text-caption text-white">
          Already set up?{" "}
          <Link
            href="/speaker-signin"
            className="font-bold text-signal underline-offset-2 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    );
  } else {
    const { invite } = state;
    title = invite.name ? `Hi ${invite.name.split(" ")[0]}` : "You're invited";
    standfirst = ASK[invite.kind];
    body = (
      <div className="club-card bg-white/[0.02] p-8 md:p-10">
        <p className="text-body text-white">
          Pick a password and this is your account. Next you&apos;ll tell us when
          you&apos;re free — that&apos;s the only thing we need to work out whether
          the {NOUN[invite.kind]} can happen.
        </p>

        {signedIn && (
          <div
            className="rounded-lg mt-5 border-2 border-signal bg-signal/10 px-4 py-3 text-body-sm text-white"
            role="status"
          >
            You&apos;re already signed in as {signedIn}. Open this link in a
            private window — using it here would sign you out and spend the
            guest&apos;s one-time link.
          </div>
        )}

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
            <label htmlFor="name" className="type-label text-white">
              Your name
            </label>
            <input
              id="name"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={error ? darkInputErrorClass : darkInputClass}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="type-label text-white">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={error ? darkInputErrorClass : darkInputClass}
            />
            <p className="text-caption text-white/70">
              This is what you&apos;ll sign in with. Any address — no UIC email needed.
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="type-label text-white">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={10}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={error ? darkInputErrorClass : darkInputClass}
            />
            <p className="text-caption text-white/70">
              At least 10 characters. A few words you&apos;ll remember beats
              something clever.
            </p>
          </div>
          <button type="submit" disabled={busy} className={darkButtonClass}>
            {busy ? "Setting up…" : "Create my account"}
          </button>
        </form>

        {invite.organization && (
          <p className="mt-6 text-caption text-white/70">
            We have you down as {invite.organization}. You can change that later.
          </p>
        )}
      </div>
    );
  }

  return (
    <ClubShell>
      <PageContainer>
        <SectionContainer>
          <div className="mx-auto max-w-md">
            <h1 className="type-title text-3xl md:text-4xl text-white">{title}</h1>
            <p className="mt-3 text-xl text-signal md:text-2xl">{standfirst}</p>
          </div>
        </SectionContainer>
        <SectionContainer>
          <div className="mx-auto max-w-md">{body}</div>
        </SectionContainer>
      </PageContainer>
    </ClubShell>
  );
}
