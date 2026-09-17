"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppShell, RoleChip } from "@/components/shell/AppShell";
import { api } from "@/lib/api";

type Profile = { id: string; name: string | null; email: string; role: string };

const memberLinks = [
  { href: "/feed", label: "Feed", blurb: "Announcements and club updates" },
  { href: "/profile", label: "Profile", blurb: "Your identity, bio, and involvement" },
  { href: "/events", label: "Events", blurb: "Upcoming talks, socials, and RSVPs" },
  { href: "/attendance", label: "Attendance", blurb: "Check in and view history" },
  { href: "/forms/interest", label: "Forms", blurb: "Applications and club forms" },
];

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
    <AppShell tone="ink">
      <main className="min-h-[60vh]">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-12 lg:py-20">
          {error && !profile ? (
            <div className="border border-white/20 bg-white/5 p-6 md:p-8">
              <h1 className="type-h2 text-paper">Sign in to continue</h1>
              <p className="mt-3 max-w-xl text-body text-paper/70">
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
              <p className="type-label text-signal">Members</p>
              <h1 className="type-h1 mt-2 text-paper">{profile?.name?.trim() || "Welcome back"}</h1>
              {profile && (
                <div className="mt-3 flex flex-wrap items-center gap-3 text-body text-paper/70">
                  <span>{profile.email}</span>
                  <RoleChip role={profile.role} />
                </div>
              )}
              <p className="mt-4 max-w-2xl text-body-lg text-paper/70">
                Your member hub — feed, profile, events, attendance, and forms. Board and exec
                roles unlock posting and check-in tools.
              </p>

              <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {memberLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="border border-white/20 bg-white/5 p-6 transition hover:border-signal hover:bg-white/10"
                  >
                    <h2 className="type-h4 text-paper">{item.label}</h2>
                    <p className="mt-2 text-body-sm text-paper/70">{item.blurb}</p>
                  </Link>
                ))}
              </div>

              <button
                type="button"
                onClick={signOut}
                className="mt-10 text-body-sm font-semibold text-paper/60 hover:text-signal"
              >
                Sign out
              </button>
            </>
          )}
        </div>
      </main>
    </AppShell>
  );
}
