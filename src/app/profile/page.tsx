"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

type Profile = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  bio: string | null;
  major: string | null;
  gradYear: number | null;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api<Profile>("/api/profile").then(setProfile).catch((e) => setError(e.message));
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await api<Profile>("/api/profile", {
        method: "PATCH",
        body: JSON.stringify({ name: profile.name, bio: profile.bio, major: profile.major }),
      });
      setProfile(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  if (error) {
    return (
      <main className="mx-auto max-w-sm p-8">
        <p className="text-sm text-red-600">{error}</p>
        <Link href="/signin" className="underline">Sign in</Link>
      </main>
    );
  }
  if (!profile) return <main className="p-8">Loading…</main>;

  return (
    <main className="mx-auto max-w-sm p-8">
      <h1 className="text-xl font-semibold">Profile [scaffold]</h1>
      <p className="mt-2 text-sm text-zinc-500">{profile.email} — {profile.role}</p>
      <form onSubmit={save} className="mt-4 flex flex-col gap-3">
        <input
          placeholder="Name"
          value={profile.name ?? ""}
          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
          className="border px-3 py-2"
        />
        <input
          placeholder="Major"
          value={profile.major ?? ""}
          onChange={(e) => setProfile({ ...profile, major: e.target.value })}
          className="border px-3 py-2"
        />
        <textarea
          placeholder="Bio"
          value={profile.bio ?? ""}
          onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
          className="border px-3 py-2"
        />
        <button type="submit" disabled={saving} className="border px-3 py-2">
          {saving ? "Saving…" : "Save"}
        </button>
      </form>
    </main>
  );
}
