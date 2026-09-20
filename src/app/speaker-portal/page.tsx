"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ClubShell, PageContainer, SectionContainer } from "@/components/club/ClubShell";
import { darkButtonClass, darkInputClass } from "@/components/ui/darkForm";
import { ApiError, api, signOut as apiSignOut } from "@/lib/api";
import { ResumeUpload } from "@/components/shell/ResumeUpload";
import { AvailabilityWindow } from "../speak/SpeakerForm";

type Profile = {
  id: string;
  name: string | null;
  email: string;
  username: string | null;
  linkedin: string | null;
  bio: string | null;
  resumeFilename: string | null;
  mustChangePassword: boolean;
  speakerSubmission: {
    organization: string | null;
    availability: AvailabilityWindow[] | null;
    needs: string | null;
    note: string | null;
  } | null;
};

type Notification = { id: string; message: string; readAt: string | null; createdAt: string };
type EmailPrefs = { eventReminders: boolean; announcements: boolean };

const EMPTY_WINDOW: AvailabilityWindow = { startDate: "", endDate: "", startTime: "", endTime: "" };

/**
 * ponytail: profile editing here is a small purpose-built form rather than
 * reusing SpeakerForm — that component POSTs a fresh submission, this PATCHes
 * an existing one, and the field set differs (no email/referredBy/opt-in
 * here). Revisit if the two drift close enough to be worth unifying.
 */
export default function SpeakerPortalPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    api<Profile>("/api/speaker-profile")
      .then((p) => {
        if (p.mustChangePassword) {
          router.push("/speaker-signin/set-password");
          return;
        }
        setProfile(p);
      })
      .catch((e: unknown) => {
        if (e instanceof ApiError && (e.status === 401 || e.status === 403)) {
          setAuthError(true);
        }
      });
  }, [router]);

  async function signOut() {
    try {
      await apiSignOut();
    } catch {
      /* ignore */
    }
    router.push("/speaker-signin");
  }

  if (authError) {
    return (
      <ClubShell>
        <PageContainer>
          <SectionContainer>
            <div className="mx-auto max-w-md">
              <h1 className="text-3xl font-bold md:text-4xl text-white">Sign in to continue</h1>
              <p className="mt-4 text-body text-white">
                <a href="/speaker-signin" className="font-bold text-signal hover:underline">
                  Sign in
                </a>{" "}
                to manage your speaker profile.
              </p>
            </div>
          </SectionContainer>
        </PageContainer>
      </ClubShell>
    );
  }

  if (!profile) {
    return (
      <ClubShell>
        <PageContainer>
          <SectionContainer>
            <div className="mx-auto max-w-md">
              <p className="text-body-sm text-white">Loading…</p>
            </div>
          </SectionContainer>
        </PageContainer>
      </ClubShell>
    );
  }

  return (
    <ClubShell>
      <PageContainer>
        <SectionContainer>
          <div className="mx-auto max-w-md">
            <h1 className="text-3xl font-bold md:text-4xl text-white">{profile.name?.trim() || "Speaker portal"}</h1>
            <p className="mt-3 text-xl text-signal md:text-2xl">{profile.email}</p>
            <button
              type="button"
              onClick={signOut}
              className="mt-4 type-label text-white hover:text-signal"
            >
              Sign out
            </button>
          </div>
        </SectionContainer>

        <SectionContainer>
          <div className="mx-auto max-w-md">
            <ProfileForm profile={profile} onSaved={setProfile} />
          </div>
        </SectionContainer>

        <SectionContainer>
          <div className="mx-auto max-w-md">
            <NotificationsPanel />
          </div>
        </SectionContainer>

        <SectionContainer>
          <div className="mx-auto max-w-md">
            <EmailPreferencesPanel />
          </div>
        </SectionContainer>
      </PageContainer>
    </ClubShell>
  );
}

function ProfileForm({ profile, onSaved }: { profile: Profile; onSaved: (p: Profile) => void }) {
  const [name, setName] = useState(profile.name ?? "");
  const [linkedin, setLinkedin] = useState(profile.linkedin ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [organization, setOrganization] = useState(profile.speakerSubmission?.organization ?? "");
  const [windows, setWindows] = useState<AvailabilityWindow[]>(
    profile.speakerSubmission?.availability?.length ? profile.speakerSubmission.availability : [EMPTY_WINDOW],
  );
  const [needs, setNeeds] = useState(profile.speakerSubmission?.needs ?? "");
  const [note, setNote] = useState(profile.speakerSubmission?.note ?? "");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  function updateWindow(i: number, field: keyof AvailabilityWindow, value: string) {
    setWindows((prev) => prev.map((w, idx) => (idx === i ? { ...w, [field]: value } : w)));
  }
  function removeWindow(i: number) {
    setWindows((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setBusy(true);
    try {
      const filled = windows.filter((w) => w.startDate && w.endDate && w.startTime && w.endTime);
      const updated = await api<Profile>("/api/speaker-profile", {
        method: "PATCH",
        body: JSON.stringify({
          name: name.trim() || undefined,
          linkedin: linkedin.trim() || undefined,
          bio: bio.trim() || undefined,
          organization: organization.trim() || undefined,
          availability: filled,
          needs: needs.trim() || undefined,
          note: note.trim() || undefined,
        }),
      });
      onSaved(updated);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="rounded-2xl bg-white/[0.02] p-6 ring-1 ring-white/10 sm:p-8">
      <h2 className="type-h3 text-white">Your profile</h2>

      {error && (
        <div className="mt-4 border-2 border-signal bg-signal/10 px-4 py-3 text-body-sm text-white" role="alert">
          {error}
        </div>
      )}

      <div className="mt-6 flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <span className="type-label text-white">Resume</span>
          <ResumeUpload
            filename={profile.resumeFilename}
            onChange={(resumeFilename) => onSaved({ ...profile, resumeFilename })}
            buttonClassName="type-label text-signal underline-offset-4 hover:underline self-start"
            linkClassName="type-label text-signal underline-offset-4 hover:underline"
            textClassName="text-body-sm text-white"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="type-label text-white">
            Name
          </label>
          <input id="name" value={name} onChange={(e) => setName(e.target.value)} className={darkInputClass} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="linkedin" className="type-label text-white">
            LinkedIn
          </label>
          <input
            id="linkedin"
            placeholder="https://linkedin.com/in/…"
            value={linkedin}
            onChange={(e) => setLinkedin(e.target.value)}
            className={darkInputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="organization" className="type-label text-white">
            Company / organization
          </label>
          <input
            id="organization"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            className={darkInputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="bio" className="type-label text-white">
            Bio
          </label>
          <textarea
            id="bio"
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className={`${darkInputClass} min-h-[5rem] py-3`}
          />
        </div>

        <div className="flex flex-col gap-3">
          <span className="type-label text-white">Availability</span>
          {windows.map((w, i) => (
            <div key={i} className="flex flex-col gap-2 border border-white/10 p-4">
              <div className="flex items-center justify-between">
                <span className="text-caption text-white">Window {i + 1}</span>
                {windows.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeWindow(i)}
                    aria-label="Remove this window"
                    className="text-white hover:text-signal"
                  >
                    ×
                  </button>
                )}
              </div>
              <span className="text-caption text-white">From this day</span>
              <input
                type="date"
                value={w.startDate}
                onChange={(e) => updateWindow(i, "startDate", e.target.value)}
                className={darkInputClass}
              />
              <span className="text-caption text-white">To this day</span>
              <input
                type="date"
                value={w.endDate}
                onChange={(e) => updateWindow(i, "endDate", e.target.value)}
                className={darkInputClass}
              />
              <span className="text-caption text-white">From this time</span>
              <input
                type="time"
                value={w.startTime}
                onChange={(e) => updateWindow(i, "startTime", e.target.value)}
                className={darkInputClass}
              />
              <span className="text-caption text-white">To this time</span>
              <input
                type="time"
                value={w.endTime}
                onChange={(e) => updateWindow(i, "endTime", e.target.value)}
                className={darkInputClass}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => setWindows((prev) => [...prev, EMPTY_WINDOW])}
            className="type-label self-start text-signal underline-offset-4 hover:underline"
          >
            + Add another window
          </button>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="needs" className="type-label text-white">
            What do you need from us?
          </label>
          <textarea
            id="needs"
            rows={2}
            value={needs}
            onChange={(e) => setNeeds(e.target.value)}
            className={`${darkInputClass} min-h-[3.5rem] py-3`}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="note" className="type-label text-white">
            Note
          </label>
          <textarea
            id="note"
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className={`${darkInputClass} min-h-[3.5rem] py-3`}
          />
        </div>

        <button type="submit" disabled={busy} className={darkButtonClass}>
          {busy ? "Saving…" : "Save changes"}
        </button>
        {saved && (
          <p className="text-body-sm text-signal" role="status">
            Saved.
          </p>
        )}
      </div>
    </form>
  );
}

function NotificationsPanel() {
  const [notifications, setNotifications] = useState<Notification[] | null>(null);

  useEffect(() => {
    api<Notification[]>("/api/notifications")
      .then(setNotifications)
      .catch(() => setNotifications([]));
  }, []);

  async function markRead(id: string) {
    try {
      await api(`/api/notifications/${id}`, { method: "PATCH" });
      setNotifications((prev) => prev?.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n)) ?? null);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="rounded-2xl bg-white/[0.02] p-6 ring-1 ring-white/10 sm:p-8">
      <h2 className="type-h3 text-white">Notifications</h2>
      {notifications === null && <p className="mt-3 text-body-sm text-white">Loading…</p>}
      {notifications?.length === 0 && <p className="mt-3 text-body-sm text-white">Nothing yet.</p>}
      {notifications && notifications.length > 0 && (
        <ul className="mt-4 flex flex-col gap-2">
          {notifications.map((n) => (
            <li
              key={n.id}
              className={`flex items-center justify-between gap-3 border border-white/10 px-4 py-3 text-body-sm ${
                n.readAt ? "text-white/80" : "text-white"
              }`}
            >
              <span>{n.message}</span>
              {!n.readAt && (
                <button
                  type="button"
                  onClick={() => markRead(n.id)}
                  className="type-label shrink-0 text-signal hover:underline"
                >
                  Mark read
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function EmailPreferencesPanel() {
  const [prefs, setPrefs] = useState<EmailPrefs | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api<EmailPrefs>("/api/email-preferences")
      .then(setPrefs)
      .catch(() => setPrefs({ eventReminders: true, announcements: true }));
  }, []);

  async function toggle(key: keyof EmailPrefs) {
    if (!prefs) return;
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    setBusy(true);
    try {
      await api("/api/email-preferences", { method: "PATCH", body: JSON.stringify({ [key]: next[key] }) });
    } catch {
      setPrefs(prefs); // revert on failure
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl bg-white/[0.02] p-6 ring-1 ring-white/10 sm:p-8">
      <h2 className="type-h3 text-white">Email preferences</h2>
      <p className="mt-2 text-body-sm text-white">Choose what we email you — we&apos;ll keep it to what matters.</p>
      {prefs && (
        <div className="mt-4 flex flex-col gap-3">
          <label className="flex items-center gap-2 text-body-sm text-white">
            <input
              type="checkbox"
              checked={prefs.eventReminders}
              disabled={busy}
              onChange={() => toggle("eventReminders")}
              className="h-4 w-4 accent-signal"
            />
            Event reminders
          </label>
          <label className="flex items-center gap-2 text-body-sm text-white">
            <input
              type="checkbox"
              checked={prefs.announcements}
              disabled={busy}
              onChange={() => toggle("announcements")}
              className="h-4 w-4 accent-signal"
            />
            General announcements
          </label>
        </div>
      )}
    </div>
  );
}
