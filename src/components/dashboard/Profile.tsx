"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api, peek } from "@/lib/api";
import { ResumeUpload } from "@/components/shell/ResumeUpload";

import { AvailabilityGrid } from "./AvailabilityGrid";
import { Heading } from "./Overview";
import { Avatar } from "./Avatar";
import { Arrow } from "./Icon";
import {
  type Profile,
  type SessionUser,
  type Window,
  isConfirmedSpeaker,
  roleName,
  requestRange,
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
  const [picker, setPicker] = useState<"grid" | "list">("grid");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [linkedinStatus, setLinkedinStatus] = useState<
    "connected" | "error" | ""
  >("");
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const result = new URLSearchParams(window.location.search).get(
        "linkedin",
      );
      if (result === "connected" || result === "error") {
        setLinkedinStatus(result);
        // Read once: a refresh shouldn't show "connected" again.
        const url = new URL(window.location.href);
        url.searchParams.delete("linkedin");
        window.history.replaceState(window.history.state, "", url);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  async function disconnectLinkedIn() {
    setBusy(true);
    setError("");
    try {
      await api("/api/linkedin/disconnect", { method: "DELETE" });
      const updated = { ...profile, photoUrl: null };
      setDraft(updated);
      onSaved(updated);
      setLinkedinStatus("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
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
                  linkedin: draft.linkedin || "",
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
  const sections = [
    ["about", "About you"],
    ["resume", "Resume"],
    ...(speaker && confirmed
      ? [
          ["availability", "Availability"],
          ["talk", "Your talk"],
        ]
      : []),
    ...(speaker ? [["needs", "Anything you need"]] : []),
  ];
  return (
    <>
      <Heading
        title="My profile"
        description={
          !speaker
            ? "This is what the board and other members see."
            : confirmed
              ? "Help the board prepare for your visit and get to know your work."
              : "We filled in what we knew — fix anything that's wrong."
        }
        action={
          <div className="d-heading-actions">
            <button
              type="button"
              className="d-button secondary"
              disabled={busy}
              onClick={() => {
                setDraft(profile);
                setWindows(profile.speakerSubmission?.availability || []);
                setError("");
                setSaved(false);
              }}
            >
              Discard
            </button>
            <button form="profile-form" disabled={busy} className="d-button">
              {busy ? "Saving…" : "Save changes"}
            </button>
          </div>
        }
      />
      <div className="d-profile-layout">
        <nav className="d-section-nav" aria-label="Profile sections">
          {sections.map(([id, label]) => (
            <a key={id} href={`#${id}`}>
              {label}
            </a>
          ))}
        </nav>
        <form id="profile-form" className="d-profile-sections" onSubmit={save}>
          <section className="d-panel d-form" id="about">
            <div className="d-section-head">
              <h2>About you</h2>
              <span className="d-muted">Shown on your member card</span>
            </div>
            <div className="d-profile-id">
              <Avatar
                name={profile.name}
                photoUrl={profile.photoUrl}
                className="d-avatar d-avatar-large"
              />
              <div>
                <strong>{profile.name || "Your name"}</strong>
                <span className="d-badge">{roleName(user, profile)}</span>
                <small>
                  Your photo comes from LinkedIn. We do not store your LinkedIn
                  access token.
                </small>
                {linkedinStatus === "connected" && (
                  <p className="d-success" role="status">
                    LinkedIn connected. Your photo has been updated.
                  </p>
                )}
                {linkedinStatus === "error" && (
                  <p className="d-error" role="alert">
                    LinkedIn could not be connected. Please try again.
                  </p>
                )}
                <div className="d-actions">
                  <a className="d-button" href="/api/linkedin/connect">
                    {profile.photoUrl
                      ? "Reconnect LinkedIn"
                      : "Connect LinkedIn"}
                  </a>
                  {profile.photoUrl && (
                    <button
                      className="d-button secondary"
                      type="button"
                      onClick={disconnectLinkedIn}
                      disabled={busy}
                    >
                      Remove photo
                    </button>
                  )}
                </div>
              </div>
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
                      onChange={(e) =>
                        submission("organization", e.target.value)
                      }
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
            {!speaker && (
              <label>
                LinkedIn profile
                {/* Plain text, not type="url": the backend accepts "linkedin.com/in/you" and adds https://. */}
                <input
                  inputMode="url"
                  spellCheck={false}
                  autoCapitalize="none"
                  autoComplete="url"
                  value={draft.linkedin || ""}
                  onChange={(e) => field("linkedin", e.target.value)}
                  placeholder="linkedin.com/in/your-name"
                />
                <small>
                  This link helps members find you. LinkedIn does not provide
                  your experience to LOGICA.
                </small>
              </label>
            )}
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
          </section>
          <section className="d-panel" id="resume">
            <div className="d-section-head">
              <h2>Resume</h2>
              <span className="d-muted">PDF or Word, up to 3 MB</span>
            </div>
            <p className="d-small">Available to you and the board.</p>
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
                Download resume <Arrow />
              </a>
            )}
          </section>
          {speaker && (
            <>
              {confirmed && (
                <section
                  className="d-panel d-form d-form-section"
                  id="availability"
                >
                  <h2>Your availability</h2>
                  <p>Windows that work for you, in Chicago local time.</p>
                  {profile.speakerSubmission?.availabilityRequest && (
                    <p className="d-callout" role="note">
                      <strong>The board asked for your availability for {requestRange(profile.speakerSubmission.availabilityRequest)}.</strong>{" "}
                      {profile.speakerSubmission.availabilityRequest.note} Add those times and save.
                    </p>
                  )}
                  <button
                    type="button"
                    className="d-text-button"
                    onClick={() =>
                      setPicker(picker === "grid" ? "list" : "grid")
                    }
                  >
                    {picker === "grid"
                      ? "Type dates instead"
                      : "Pick on a calendar instead"}
                  </button>
                  {picker === "grid" && (
                    <AvailabilityGrid
                      startAt={profile.speakerSubmission?.availabilityRequest?.from}
                      windows={windows}
                      onChange={(next) => {
                        setWindows(next);
                        setSaved(false);
                      }}
                    />
                  )}
                  {picker === "list" &&
                    windows.map((w, i) => (
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
                            setWindows((prev) =>
                              prev.filter((_, j) => i !== j),
                            );
                            setSaved(false);
                          }}
                        >
                          Remove window {i + 1}
                        </button>
                      </fieldset>
                    ))}
                  {picker === "list" && (
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
                  )}
                </section>
              )}
              {confirmed && (
                <section className="d-panel d-form d-form-section" id="talk">
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
                </section>
              )}
              <section className="d-panel d-form d-form-section" id="needs">
                <h2>
                  Anything you need <span className="d-optional">Optional</span>
                </h2>
                <label>
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
              </section>
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
type Theme = "light" | "dark" | "system";
function savedTheme(): Theme {
  try {
    const t = localStorage.getItem("logica-theme");
    if (t === "light" || t === "dark") return t;
  } catch {}
  return "system";
}
/** Same key and <html data-theme> the root layout and the public site read;
 *  "system" clears both so the CSS follows prefers-color-scheme. */
function Appearance() {
  const [theme, setTheme] = useState<Theme>(savedTheme);
  useEffect(() => {
    // Other tabs announce changes with this event.
    const sync = () => setTheme(savedTheme());
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  function pick(next: Theme) {
    setTheme(next);
    try {
      if (next === "system") localStorage.removeItem("logica-theme");
      else localStorage.setItem("logica-theme", next);
    } catch {}
    if (next === "system")
      document.documentElement.removeAttribute("data-theme");
    else document.documentElement.setAttribute("data-theme", next);
  }
  return (
    <div className="d-setting-row">
      <span>
        <strong id="appearance-label">Appearance</strong>
        <small>Match your system, or pick one.</small>
      </span>
      <div
        className="d-segmented"
        role="radiogroup"
        aria-labelledby="appearance-label"
      >
        {(["light", "dark", "system"] as const).map((value) => (
          <label key={value}>
            <input
              type="radio"
              name="appearance"
              value={value}
              checked={theme === value}
              onChange={() => pick(value)}
            />
            {value[0].toUpperCase() + value.slice(1)}
          </label>
        ))}
      </div>
    </div>
  );
}
type EmailMode = "INSTANT" | "SUMMARY" | "OFF";
/** Mirrors backend /api/email-preferences. */
type EmailPrefs = { modes: EmailMode[]; categories: { key: string; label: string; description: string; mode: EmailMode }[] };
const MODE_LABEL: Record<EmailMode, string> = { INSTANT: "Instant", SUMMARY: "9 AM summary", OFF: "Off" };

export function Settings({ user, profile }: { user: SessionUser; profile?: Profile | null }) {
  const [prefs, setPrefs] = useState<EmailPrefs | null>(() => {
    const cached = peek<EmailPrefs>("/api/email-preferences");
    // An older cached shape (before categories) is ignored rather than rendered.
    return cached && Array.isArray(cached.categories) ? cached : null;
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [saved, setSaved] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let alive = true;
    api<EmailPrefs>("/api/email-preferences")
      .then((p) => {
        if (!alive) return;
        // The site can briefly be ahead of the API during a deploy.
        if (!Array.isArray(p.categories)) return setError("Email settings are updating. Try again in a few minutes.");
        setPrefs(p);
        setError("");
      })
      .catch((e) => {
        if (alive) setError(e.message);
      });
    return () => {
      alive = false;
    };
  }, [retry]);
  async function choose(category: string, mode: EmailMode) {
    setBusy(category);
    setError("");
    setSaved(false);
    try {
      setPrefs(await api<EmailPrefs>("/api/email-preferences", { method: "PATCH", body: JSON.stringify({ category, mode }) }));
      setSaved(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy("");
    }
  }
  return (
    <>
      <Heading
        title="Settings"
        description="Manage your account, privacy, security, and communication defaults."
      />
      <section className="d-panel d-settings">
        <h2>General</h2>
        <Appearance />
      </section>
      <section className="d-panel d-settings">
        <h2>Email preferences</h2>
        <p>
          Everything still shows up in your dashboard notifications. Decisions
          about your application, your talk or an interview always come by
          email.
          {prefs?.modes.includes("SUMMARY") &&
            " The 9 AM summary is one email each morning with what happened since the last one, and none if nothing did."}
        </p>
        {error && (
          <p className="d-error" role="alert">
            {error}{" "}
            <button onClick={() => setRetry((v) => v + 1)}>Retry</button>
          </p>
        )}
        {prefs
          ? prefs.categories.map((c) => (
              <div className="d-setting-row" key={c.key}>
                <span>
                  <strong id={`email-${c.key}`}>{c.label}</strong>
                  <small>{c.description}</small>
                </span>
                <div className="d-segmented" role="radiogroup" aria-labelledby={`email-${c.key}`}>
                  {prefs.modes.map((mode) => (
                    <label key={mode}>
                      <input
                        type="radio"
                        name={`email-${c.key}`}
                        value={mode}
                        checked={c.mode === mode}
                        disabled={busy === c.key}
                        onChange={() => choose(c.key, mode)}
                      />
                      {MODE_LABEL[mode]}
                    </label>
                  ))}
                </div>
              </div>
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
              {roleName(user, profile)} ·{" "}
              {user.accountKind === "SPEAKER"
                ? "Username and password"
                : "Email and password"}
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
