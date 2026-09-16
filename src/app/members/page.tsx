"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ClubShell } from "@/components/club/ClubShell";
import { RoleChip } from "@/components/shell/AppShell";
import { api } from "@/lib/api";

type Profile = { id: string; name: string | null; email: string; role: string };

const memberLinks = [
  { href: "/feed", label: "Feed", blurb: "Announcements and club updates" },
  { href: "/profile", label: "Profile", blurb: "Your identity, bio, and involvement" },
  { href: "/events", label: "Events", blurb: "Upcoming talks, socials, and RSVPs" },
  { href: "/attendance", label: "Attendance", blurb: "Check in and view history" },
  { href: "/forms/interest", label: "Forms", blurb: "Applications and club forms" },
];

const nav = [
  { href: "/members", label: "Hub" },
  { href: "/feed", label: "Feed" },
  { href: "/profile", label: "Profile" },
  { href: "/events", label: "Events" },
  { href: "/attendance", label: "Attendance" },
];

/** Secondary nav for signed-in member tools (CONTENT.md §§3–7). */
export function MemberNav() {
  const pathname = usePathname();
  return (
    <div className="border-b border-ink/10 bg-paper">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-1 px-4 py-3 sm:px-6 lg:px-12">
        {nav.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                active ? "bg-ink text-paper" : "text-ink/70 hover:bg-ink/5 hover:text-ink"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
        <Link href="/" className="ml-auto text-sm font-semibold text-signal hover:underline">
          Public site
        </Link>
      </div>
    </div>
  );
}

export default function MembersHubPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<Profile>("/api/profile")
      .then(setProfile)
      .catch((e: Error) => {
        setError(e.message);
        setProfile(null);
      });
  }, []);

  async function signOut() {
    try {
      await fetch("/api/auth/signout", { method: "POST" });
    } catch {
      /* ignore */
    }
    router.push("/signin");
  }

  return (
    <ClubShell>
      <div className="min-h-[60vh] bg-paper text-ink">
        <MemberNav />
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-12 lg:py-20">
          {error && !profile ? (
            <div className="rounded-2xl border border-ink/15 p-8">
              <h1 className="text-3xl font-bold">Sign in to continue</h1>
              <p className="mt-3 max-w-xl text-ink/70">
                Please sign in with your UIC email to access LOGICA member features.
              </p>
              <Link
                href="/signin"
                className="mt-6 inline-flex items-center rounded-lg bg-signal px-6 py-3 font-semibold text-paper"
              >
                Sign in
              </Link>
            </div>
          ) : (
            <>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-ink/50">Members</p>
              <h1 className="mt-2 text-4xl font-bold md:text-5xl">
                {profile?.name?.trim() || "Welcome back"}
              </h1>
              {profile && (
                <div className="mt-3 flex flex-wrap items-center gap-3 text-ink/70">
                  <span>{profile.email}</span>
                  <RoleChip role={profile.role} />
                </div>
              )}
              <p className="mt-4 max-w-2xl text-lg text-ink/70">
                Your member hub — feed, profile, events, attendance, and forms. Board and exec
                roles unlock posting and check-in tools.
              </p>

              <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {memberLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-2xl border border-ink/10 bg-paper p-6 transition hover:border-signal/40 hover:bg-paper-dim"
                  >
                    <h2 className="text-xl font-bold">{item.label}</h2>
                    <p className="mt-2 text-ink/60">{item.blurb}</p>
                  </Link>
                ))}
              </div>

              <button
                type="button"
                onClick={signOut}
                className="mt-10 text-sm font-semibold text-ink/50 hover:text-signal"
              >
                Sign out
              </button>
            </>
          )}
        </div>
      </div>
    </ClubShell>
  );
}
