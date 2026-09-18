"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  AppShell,
  AvatarMonogram,
  EmptyState,
  PageHeader,
  RoleChip,
  buttonClass,
  inputClass,
} from "@/components/shell/AppShell";

type Profile = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  bio: string | null;
  major: string | null;
  gradYear: number | null;
};

const INTERESTS = [
  "Software engineering",
  "Data science",
  "Machine learning",
  "Cybersecurity",
  "Product",
  "Hardware",
] as const;


const OPEN_TO = ["Internships", "Project teams", "Study groups"] as const;

/** Profile — CONTENT.md §4 identity / about / involvement / activity (self-view). */
export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState(false);
  const [interests, setInterests] = useState<string[]>([]);
  const [openTo, setOpenTo] = useState<string[]>([]);
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");

  useEffect(() => {
    api<Profile>("/api/profile")
      .then(setProfile)
      .catch((e: Error) => setError(e.message));
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const updated = await api<Profile>("/api/profile", {
        method: "PATCH",
        body: JSON.stringify({
          name: profile.name,
          bio: profile.bio?.slice(0, 500) ?? null,
          major: profile.major,
        }),
      });
      setProfile(updated);
      setSaved(true);
      setEditing(false);
      // logica-lean: interests / open-to / socials are UI-complete until backend fields exist
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  function toggle(list: string[], value: string, set: (v: string[]) => void) {
    set(list.includes(value) ? list.filter((x) => x !== value) : [...list, value]);
  }

  if (error && !profile) {
    return (
      <AppShell tone="ink">
        <PageHeader tone="ink"
          eyebrow="Profile"
          title="Your LOGICA record"
          description="Name, major, role, and how you've shown up in the club."
        />
        <div className="mx-auto max-w-shell px-4 py-14 md:px-6">
          <EmptyState
            title="Sign in to continue"
            body="Please sign in with your UIC email to access LOGICA member features. No part of a profile is visible when you're signed out."
            action={
              <Link href="/signin" className={buttonClass}>
                Sign in
              </Link>
            }
          />
          <p className="mt-4 text-caption text-signal" role="status">
            {error}
          </p>
        </div>
      </AppShell>
    );
  }

  if (!profile) {
    return (
      <AppShell tone="ink">
        <PageHeader tone="ink" eyebrow="Profile" title="Your LOGICA record" />
        <div className="mx-auto max-w-shell px-4 py-14 md:px-6">
          <p className="text-body text-paper/70">Loading profile…</p>
        </div>
      </AppShell>
    );
  }

  const bioLen = profile.bio?.length ?? 0;

  return (
    <AppShell tone="ink">
      <PageHeader tone="ink"
        eyebrow="Profile · self view"
        title={profile.name?.trim() || "Your profile"}
        description="Editable by you. Email and form history stay private to the owner."
      />

      <div className="mx-auto grid max-w-shell gap-10 px-4 py-14 md:grid-cols-[1fr_1.05fr] md:px-6 md:py-24">
        <div className="space-y-6">
          {/* 1. Identity header */}
          <section className="card border-ink p-6 md:p-8">
            <div className="flex items-start gap-5">
              <AvatarMonogram id={profile.id} name={profile.name} size="lg" />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="type-h2 truncate">{profile.name?.trim() || "Add your name"}</h2>
                  <RoleChip role={profile.role} />
                </div>
                <p className="mt-2 text-body-sm text-ink-muted">
                  {[profile.major, profile.gradYear ? `Class of ${profile.gradYear}` : null]
                    .filter(Boolean)
                    .join(" · ") || "Major & grad year not set"}
                </p>
                <p className="mt-1 text-caption text-ink-muted">
                  {profile.email} · visible only to you
                </p>
                <div className="mt-3 flex flex-wrap gap-3 text-caption">
                  {linkedin ? (
                    <a href={linkedin} className="font-bold text-signal hover:underline" target="_blank" rel="noreferrer">
                      LinkedIn
                    </a>
                  ) : (
                    <span className="text-ink-muted">LinkedIn not set</span>
                  )}
                  {github ? (
                    <a href={github} className="font-bold text-signal hover:underline" target="_blank" rel="noreferrer">
                      GitHub
                    </a>
                  ) : (
                    <span className="text-ink-muted">GitHub not set</span>
                  )}
                </div>
                <button
                  type="button"
                  className={`${buttonClass} mt-5`}
                  onClick={() => setEditing(true)}
                >
                  Edit profile
                </button>
              </div>
            </div>
          </section>

          {/* 2. About */}
          <section className="card border-ink p-6 md:p-8">
            <h3 className="type-h3">About</h3>
            <p className="mt-3 max-w-measure whitespace-pre-wrap text-body text-ink-muted">
              {profile.bio?.trim() || "No bio yet — tell the club who you are."}
            </p>
            <div className="mt-5">
              <p className="type-label text-ink-muted">Interests</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {interests.length === 0 && (
                  <li className="text-body-sm text-ink-muted">None selected yet</li>
                )}
                {interests.map((i) => (
                  <li key={i} className="rounded-full border border-rule px-3 py-1 text-caption font-bold">
                    {i}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-4">
              <p className="type-label text-ink-muted">Open to</p>
              <p className="mt-1 text-body-sm text-ink-muted">
                {openTo.length ? openTo.join(" · ") : "Not set"}
              </p>
            </div>
          </section>

          {/* 3. Involvement summary */}
          <section className="card border-ink p-6 md:p-8">
            <h3 className="type-h3">Involvement</h3>
            <p className="mt-2 text-body-sm text-ink-muted">
              Counts are server-side when the involvement summary ships. Forms stay owner-only.
            </p>
            <dl className="mt-4 grid grid-cols-3 gap-3">
              {[
                { label: "Events", href: "#activity-events" },
                { label: "Posts", href: "#activity-posts" },
                { label: "Forms", href: "#activity-forms" },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="border border-rule bg-paper px-3 py-4 text-center hover:border-ink"
                >
                  <dt className="type-label text-ink-muted">{item.label}</dt>
                  <dd className="type-h2 mt-1">—</dd>
                </a>
              ))}
            </dl>
          </section>
        </div>

        <div className="space-y-6">
          {/* Editor */}
          <section className="border border-ink bg-ink p-6 text-white md:p-8">
            <div className="flex items-center justify-between gap-3">
              <h2 className="type-h3">Edit profile</h2>
              <button
                type="button"
                className="type-label text-signal underline-offset-4 hover:underline"
                onClick={() => setEditing((v) => !v)}
              >
                {editing ? "Close" : "Open"}
              </button>
            </div>

            {editing ? (
              <form onSubmit={save} className="mt-6 flex flex-col gap-4">
                {error && (
                  <p className="border-2 border-signal bg-ink/40 px-3 py-2 text-body-sm text-signal" role="alert">
                    {error}
                  </p>
                )}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="name" className="type-label text-signal">
                    Full name
                  </label>
                  <input
                    id="name"
                    className={inputClass}
                    value={profile.name ?? ""}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="major" className="type-label text-signal">
                    Major
                  </label>
                  <input
                    id="major"
                    className={inputClass}
                    value={profile.major ?? ""}
                    onChange={(e) => setProfile({ ...profile, major: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="bio" className="type-label text-signal">
                    Bio ({bioLen}/500)
                  </label>
                  <textarea
                    id="bio"
                    rows={4}
                    maxLength={500}
                    className={`${inputClass} min-h-[7.5rem] py-3`}
                    value={profile.bio ?? ""}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  />
                </div>
                <fieldset>
                  <legend className="type-label text-signal">Interests</legend>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {INTERESTS.map((i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => toggle(interests, i, setInterests)}
                        className={`rounded-full px-3 py-1 text-caption font-bold ${
                          interests.includes(i) ? "bg-signal text-paper" : "bg-white/15 text-white"
                        }`}
                      >
                        {i}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <fieldset>
                  <legend className="type-label text-signal">Open to</legend>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {OPEN_TO.map((i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => toggle(openTo, i, setOpenTo)}
                        className={`rounded-full px-3 py-1 text-caption font-bold ${
                          openTo.includes(i) ? "bg-signal text-ink" : "bg-white/15 text-white"
                        }`}
                      >
                        {i}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="linkedin" className="type-label text-signal">
                      LinkedIn URL
                    </label>
                    <input
                      id="linkedin"
                      className={inputClass}
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      placeholder="https://"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="github" className="type-label text-signal">
                      GitHub URL
                    </label>
                    <input
                      id="github"
                      className={inputClass}
                      value={github}
                      onChange={(e) => setGithub(e.target.value)}
                      placeholder="https://"
                    />
                  </div>
                </div>
                <button type="submit" disabled={saving} className={`${buttonClass} w-full`}>
                  {saving ? "Saving…" : "Save changes"}
                </button>
                {saved && (
                  <p className="text-caption text-signal" role="status">
                    Saved.
                  </p>
                )}
              </form>
            ) : (
              <p className="mt-6 text-body text-white/75">
                Open the editor to update name, bio, interests, and links.
              </p>
            )}
          </section>

          {/* 4. Activity history */}
          <section className="card border-ink p-6 md:p-8" aria-labelledby="activity-heading">
            <h3 id="activity-heading" className="type-h3">
              Activity history
            </h3>
            <div id="activity-events" className="mt-6">
              <h4 className="type-h4">Events attended</h4>
              <p className="mt-2 text-body-sm text-ink-muted">
                No events yet. RSVP and check-in will list here (attended vs RSVP-only).
              </p>
            </div>
            <div id="activity-posts" className="mt-6 border-t border-rule pt-6">
              <h4 className="type-h4">Posts made</h4>
              <p className="mt-2 text-body-sm text-ink-muted">
                No posts yet.{" "}
                <Link href="/feed" className="font-bold text-signal hover:underline">
                  Open the feed
                </Link>
              </p>
            </div>
            <div id="activity-forms" className="mt-6 border-t border-rule pt-6">
              <h4 className="type-h4">Form submissions</h4>
              <p className="mt-2 text-body-sm text-ink-muted">
                Owner-only. No submissions yet.
              </p>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
