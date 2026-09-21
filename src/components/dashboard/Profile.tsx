"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { ResumeUpload } from "@/components/shell/ResumeUpload";
import { Heading } from "./Overview";
import {
  type Profile,
  type SessionUser,
  type Window,
  initials,
  isConfirmedSpeaker,
  roleName,
} from "./types";

export function ProfileEditor({
  profile,
  user,
  onSaved,
}: {
  profile: Profile;
  user: SessionUser;
  onSaved: (p: Profile) => void;
}) {
  const speaker = user.accountKind === "SPEAKER";
  // Candidates aren't asked to prepare a talk we haven't agreed to yet; the
  // API rejects these fields at that stage too.
  const confirmed = isConfirmedSpeaker(profile);
  useEffect(() => {
    const target = window.location.hash.slice(1);
    if (target) document.getElementById(target)?.scrollIntoView();
  }, []);
  const [draft, setDraft] = useState(profile);
  const [windows, setWindows] = useState<Window[]>(
    profile.speakerSubmission?.availability || [],
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  function field(key: keyof Profile, value: string | number | null) {
    setDraft((p) => ({ ...p, [key]: value }));
    setSaved(false);
  }
  function submission(
    key: "organization" | "needs" | "note" | "talkTitle" | "slidesUrl",
    value: string,
  ) {
    setDraft((p) => ({
      ...p,
      speakerSubmission: {
        id: "",
        organization: "",
        availability: [],
        needs: "",
        note: "",
        status: "PENDING",
        submittedAt: null,
        availabilityConfirmedAt: null,
        talkTitle: "",
        slidesUrl: "",
        event: null,
        ...p.speakerSubmission,
        [key]: value,
      },
    }));
    setSaved(false);
  }
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaved(false);
    if (
      windows.some((w) => w.startDate > w.endDate || w.startTime >= w.endTime)
    ) {
      setError("Availability must end after it starts.");
      return;
    }
    setBusy(true);
    try {
      const updated = await api<Profile>(
        speaker ? "/api/speaker-profile" : "/api/profile",
        {
          method: "PATCH",
          body: JSON.stringify(
            speaker
              ? {
                  name: draft.name,
                  bio: draft.bio || "",
                  linkedin: draft.linkedin || "",
                  organization: draft.speakerSubmission?.organization || "",
                  needs: draft.speakerSubmission?.needs || "",
                  note: draft.speakerSubmission?.note || "",
                  ...(confirmed
                    ? {
                        talkTitle: draft.speakerSubmission?.talkTitle || "",
                        slidesUrl: draft.speakerSubmission?.slidesUrl || "",
                      }
                    : {}),
                  availability: windows,
                }
              : {
                  name: draft.name,
                  bio: draft.bio,
                  major: draft.major,
                  gradYear: draft.gradYear,
                },
          ),
        },
      );
      setDraft(updated);
      onSaved(updated);
      setSaved(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Heading
        title="Make yourself known."
        description={
          !speaker
            ? "Your profile is how the LOGICA community gets to know you."
            : confirmed
              ? "Help the board prepare for your visit and get to know your work."
              : "We filled in what we knew — fix anything that's wrong."
        }
      />
      <div className="d-profile-layout">
        <aside className="d-panel d-profile-card">
          <span className="d-avatar d-avatar-large">
            {initials(profile.name)}
          </span>
          <h2>{profile.name || "Your name"}</h2>
          <span className="d-badge">{roleName(user, profile)}</span>
          <p>{profile.email}</p>
          <hr />
          <h3>A little about you</h3>
          <p>
            {profile.bio ||
              "Add a short bio about your interests, experience, or what you want to build."}
          </p>
          <div id="resume" className="d-resume">
            <h3>Your resume</h3>
            <p>
              PDF or Word document, up to 5 MB. Available to you and the board.
            </p>
            <ResumeUpload
              filename={profile.resumeFilename}
              onChange={(resumeFilename) => {
                onSaved({ ...profile, resumeFilename });
                setDraft((p) => ({ ...p, resumeFilename }));
              }}
              buttonClassName="d-button secondary"
              linkClassName="d-text-button"
              textClassName="d-small"
            />
            {profile.resumeFilename && (
              <a
                className="d-text-link"
                href={`/api/resume/${profile.id}`}
                target="_blank"
                rel="noreferrer"
              >
                Download resume ↗
              </a>
            )}
          </div>
        </aside>
        <form className="d-panel d-form" onSubmit={save}>
          <div className="d-section-head">
            <h2>Personal details</h2>
            <span className="d-muted">Your account</span>
          </div>
          <div className="d-form-grid">
            <label>
              Full name
              <input
                required
                value={draft.name || ""}
                onChange={(e) => field("name", e.target.value)}
                autoComplete="name"
              />
            </label>
            <label>
              Email address
              <input value={profile.email} readOnly />
              <small>Your sign-in email cannot be changed here.</small>
            </label>
            {speaker ? (
              <>
                <label>
                  Organization
                  <input
                    value={draft.speakerSubmission?.organization || ""}
                    onChange={(e) => submission("organization", e.target.value)}
                    autoComplete="organization"
                  />
                </label>
                <label>
                  LinkedIn URL
                  <input
                    type="url"
                    value={draft.linkedin || ""}
                    onChange={(e) => field("linkedin", e.target.value)}
                    placeholder="https://linkedin.com/in/your-name"
                  />
                </label>
              </>
            ) : (
              <>
                <label>
                  Major
                  <input
                    value={draft.major || ""}
                    onChange={(e) => field("major", e.target.value)}
                    placeholder="e.g. Computer Science"
                  />
                </label>
                <label>
                  Graduation year
                  <input
                    type="number"
                    min={1900}
                    max={2100}
                    value={draft.gradYear ?? ""}
                    onChange={(e) =>
                      field(
                        "gradYear",
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
                    placeholder="e.g. 2028"
                  />
                </label>
              </>
            )}
          </div>
          <label>
            About you
            <textarea
              rows={4}
              maxLength={500}
              value={draft.bio || ""}
              onChange={(e) => field("bio", e.target.value)}
              placeholder="What are you interested in? What would you like the community to know?"
            />
            <small>{draft.bio?.length || 0}/500 characters</small>
          </label>
          {speaker && (
            <>
              {confirmed && (
                <div className="d-form-section" id="availability">
                  <h2>Your availability</h2>
                  <p>Windows that work for you, in Chicago local time.</p>
                  {windows.map((w, i) => (
                    <fieldset className="d-window" key={i}>
                      <legend>Window {i + 1}</legend>
                      <div className="d-form-grid">
                        {(
                          [
                            "startDate",
                            "endDate",
                            "startTime",
                            "endTime",
                          ] as const
                        ).map((key) => (
                          <label key={key}>
                            {
                              {
                                startDate: "From date",
                                endDate: "Through date",
                                startTime: "From time",
                                endTime: "Until time",
                              }[key]
                            }
                            <input
                              required
                              type={key.includes("Date") ? "date" : "time"}
                              value={w[key]}
                              onChange={(e) => {
                                setWindows((prev) =>
                                  prev.map((v, j) =>
                                    i === j
                                      ? { ...v, [key]: e.target.value }
                                      : v,
                                  ),
                                );
                                setSaved(false);
                              }}
                            />
                          </label>
                        ))}
                      </div>
                      <button
                        type="button"
                        className="d-text-button"
                        onClick={() => {
                          setWindows((prev) => prev.filter((_, j) => i !== j));
                          setSaved(false);
                        }}
                      >
                        Remove window {i + 1}
                      </button>
                    </fieldset>
                  ))}
                  <button
                    type="button"
                    className="d-button secondary"
                    onClick={() => {
                      setWindows((prev) => [
                        ...prev,
                        {
                          startDate: "",
                          endDate: "",
                          startTime: "",
                          endTime: "",
                        },
                      ]);
                      setSaved(false);
                    }}
                  >
                    + Add availability
                  </button>
                </div>
              )}
              {confirmed && (
                <div className="d-form-section" id="talk">
                  <h2>Your talk</h2>
                  <p>
                    The two things we can&apos;t print a poster or run a room
                    without.
                  </p>
                  {confirmed && (
                    <>
                      <label>
                        <span className="d-label-row">
                          What should we call your talk?
                          <span className="d-required">Required</span>
                        </span>
                        <input
                          value={draft.speakerSubmission?.talkTitle || ""}
                          onChange={(e) =>
                            submission("talkTitle", e.target.value)
                          }
                          maxLength={200}
                          placeholder="e.g. Shipping your first production service"
                        />
                        <small>This is the title students will see.</small>
                      </label>
                      <label>
                        <span className="d-label-row">
                          Link to your slides
                          <span className="d-required">Required</span>
                        </span>
                        <input
                          type="url"
                          value={draft.speakerSubmission?.slidesUrl || ""}
                          onChange={(e) =>
                            submission("slidesUrl", e.target.value)
                          }
                          placeholder="https://docs.google.com/presentation/..."
                        />
                        <small>
                          A link, not a file — so your deck opens on whatever
                          laptop is plugged in that day. Google Slides, Canva, a
                          PDF in Drive: anything we can open.
                        </small>
                      </label>
                    </>
                  )}
                </div>
              )}
              <div className="d-form-section">
                <h2>
                  Anything you need <span className="d-optional">Optional</span>
                </h2>
                <label id="needs">
                  What do you need from us?
                  <textarea
                    rows={2}
                    value={draft.speakerSubmission?.needs || ""}
                    onChange={(e) => submission("needs", e.target.value)}
                    placeholder="Equipment, accessibility, room setup…"
                  />
                </label>
                <label>
                  Note to the board
                  <textarea
                    rows={3}
                    value={draft.speakerSubmission?.note || ""}
                    onChange={(e) => submission("note", e.target.value)}
                  />
                </label>
              </div>
            </>
          )}
          {error && (
            <p className="d-error" role="alert">
              {error}
            </p>
          )}
          <div className="d-form-footer">
            <span role="status">
              {saved
                ? "Your changes are saved."
                : "Keep your details up to date."}
            </span>
            <button disabled={busy} className="d-button">
              {busy ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
export function Settings({ user }: { user: SessionUser }) {
  const [prefs, setPrefs] = useState<{
    eventReminders: boolean;
    announcements: boolean;
  } | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let alive = true;
    api<{ eventReminders: boolean; announcements: boolean }>(
      "/api/email-preferences",
    )
      .then((p) => {
        if (alive) {
          setPrefs(p);
          setError("");
        }
      })
      .catch((e) => {
        if (alive) setError(e.message);
      });
    return () => {
      alive = false;
    };
  }, [retry]);
  async function toggle(key: "eventReminders" | "announcements") {
    if (!prefs) return;
    setBusy(true);
    setError("");
    setSaved(false);
    try {
      const next = { ...prefs, [key]: !prefs[key] };
      await api("/api/email-preferences", {
        method: "PATCH",
        body: JSON.stringify(next),
      });
      setPrefs(next);
      setSaved(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Heading
        title="On your terms."
        description="Choose how you hear from LOGICA and manage your account."
      />
      <section className="d-panel d-settings">
        <h2>Email preferences</h2>
        <p>
          Notifications remain available in your dashboard even when email is
          off.
        </p>
        {error && (
          <p className="d-error" role="alert">
            {error}{" "}
            <button onClick={() => setRetry((v) => v + 1)}>Retry</button>
          </p>
        )}
        {prefs
          ? (["eventReminders", "announcements"] as const).map((key) => (
              <label className="d-setting-row" key={key}>
                <span>
                  <strong>
                    {key === "eventReminders"
                      ? "Event reminders"
                      : "Club announcements"}
                  </strong>
                  <small>
                    {key === "eventReminders"
                      ? "Updates about events you’ve signed up for."
                      : "News and updates from the LOGICA board."}
                  </small>
                </span>
                <input
                  type="checkbox"
                  checked={prefs[key]}
                  disabled={busy}
                  onChange={() => toggle(key)}
                />
              </label>
            ))
          : !error && <p role="status">Loading preferences…</p>}
        <p role="status">{saved ? "Preferences saved." : ""}</p>
      </section>
      <section className="d-panel d-settings">
        <h2>Your account</h2>
        <div className="d-setting-row">
          <span>
            <strong>{user.email}</strong>
            <small>
              {roleName(user)} ·{" "}
              {user.accountKind === "SPEAKER"
                ? "Username and password"
                : "Passwordless email sign-in"}
            </small>
          </span>
          {user.accountKind === "SPEAKER" && (
            <Link
              className="d-button secondary"
              href="/speaker-signin/set-password"
            >
              Change password
            </Link>
          )}
        </div>
      </section>
    </>
  );
}
