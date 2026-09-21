"use client";
import Link from "next/link";
import { useState } from "react";
import { api } from "@/lib/api";
import { Icon } from "./Icon";
import {
  type SessionUser,
  type Profile,
  type Event,
  type Engagement,
  type Speaker,
  type Notice,
  roleName,
  isBoard,
  date,
  initials,
} from "./types";

export function Heading({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="d-heading">
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}
export function Empty({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="d-empty">
      <span className="d-empty-mark">
        <Icon name="activity" />
      </span>
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  );
}
export function Stats({ engagement }: { engagement: Engagement | null }) {
  return (
    <dl className="d-stats">
      {[
        ["Events attended", engagement?.involvement.eventsAttended, "events"],
        ["Community posts", engagement?.involvement.postsMade, "community"],
        ["Forms submitted", engagement?.involvement.formsSubmitted, "profile"],
      ].map(([label, value, icon]) => (
        <div key={label}>
          <dt>
            <Icon name={icon as "events"} />
            {label}
          </dt>
          <dd>
            {value ?? "—"}
            <span>All time</span>
          </dd>
        </div>
      ))}
    </dl>
  );
}
export function Overview({
  user,
  profile,
  events,
  engagement,
  speakers,
  notices,
}: {
  user: SessionUser;
  profile: Profile | null;
  events: Event[] | null;
  engagement: Engagement | null;
  speakers: Speaker[] | null;
  notices: Notice[] | null;
}) {
  // Speakers never reach this — they get SpeakerHome instead.
  const board = isBoard(user);
  const upcoming = events
    ?.filter((e) => new Date(e.startsAt) >= new Date())
    .slice(0, 3);
  const pending = speakers?.filter((s) => s.status === "PENDING");
  const checks = profile
    ? [
        {
          label: "Introduce yourself",
          note: "Add your name and a short bio.",
          done: !!profile.name && !!profile.bio,
          href: "/dashboard/profile",
        },
        {
          label: "Add your academic details",
          note: "Let the community know what you study.",
          done: !!profile.major && !!profile.gradYear,
          href: "/dashboard/profile",
        },
        {
          label: "Upload your resume",
          note: "Keep your experience ready to share.",
          done: !!profile.resumeFilename,
          href: "/dashboard/profile#resume",
        },
      ]
    : [];
  const done = checks.filter((c) => c.done).length;
  const name = (profile?.name || user.name || "there").split(" ")[0];
  return (
    <>
      <Heading
        title={`Welcome back, ${name}.`}
        description={
          board
            ? "Your community, and what needs your attention."
            : "Make yourself part of what happens next."
        }
        action={
          <span className="d-date">
            {date(new Date().toISOString(), {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}
          </span>
        }
      />
      <div className="d-overview-top">
        <section className="d-feature">
          <div className="d-feature-label">
            <span className="d-live-dot" />
            {board ? "Behind the community" : "Your place in LOGICA"}
          </div>
          <h2>
            {board ? (
              <>
                Keep the club
                <br />
                moving forward.
              </>
            ) : (
              <>
                Show up. Connect.
                <br />
                Build something.
              </>
            )}
          </h2>
          <p>
            {board
              ? "Review new speakers, bring people together, and make the next event happen."
              : "Find your next event, meet your people, and see your involvement grow."}
          </p>
          <Link
            className="d-button"
            href={board ? "/dashboard/speakers" : "/dashboard/events"}
          >
            {board ? "Open speaker directory" : "Find your next event"}
            <Icon name="arrow" />
          </Link>
        </section>
        <section className="d-panel d-identity">
          <div className="d-section-head">
            <h2>Your profile</h2>
            <Link href="/dashboard/profile">
              Edit <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <div className="d-identity-main">
            <span className="d-avatar d-avatar-large">
              {initials(profile?.name || user.name)}
            </span>
            <h3>{profile?.name || user.name || "Your name"}</h3>
            <p>{profile?.major || "Add your major"}</p>
            <span className="d-badge">{roleName(user)}</span>
          </div>
          <div className="d-progress-label">
            <span>Profile essentials</span>
            <strong>
              {profile ? `${done} of ${checks.length}` : "Loading…"}
            </strong>
          </div>
          <progress
            max={checks.length || 3}
            value={done}
            aria-label="Completed profile essentials"
          />
          <p className="d-small">
            {done === checks.length && profile
              ? "You’re all set. Keep your details up to date."
              : "A few details help us get to know you."}
          </p>
        </section>
      </div>
      <section className="d-engagement-strip">
        <div>
          <h2>Your engagement</h2>
          <Link href="/dashboard/activity">
            View your activity <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <Stats engagement={engagement} />
      </section>
      <div className="d-columns">
        <div>
          <section className="d-panel">
            <div className="d-section-head">
              <h2>{board ? "Needs your attention" : "Your next steps"}</h2>
              <span className="d-muted">
                {board && pending
                  ? `${pending.length} pending`
                  : "Make it yours"}
              </span>
            </div>
            {board && pending && pending.length > 0 && (
              <Link className="d-task" href="/dashboard/speakers">
                <span className="d-task-circle gold">
                  <Icon name="speakers" />
                </span>
                <span>
                  <strong>
                    Review {pending.length} speaker submission
                    {pending.length === 1 ? "" : "s"}
                  </strong>
                  <small>Confirm guests and prepare their portal access.</small>
                </span>
                <Icon name="arrow" />
              </Link>
            )}
            {checks.map((c) => (
              <Link
                className={`d-task ${c.done ? "complete" : ""}`}
                href={c.href}
                key={c.label}
              >
                <span className="d-task-circle">
                  {c.done ? <Icon name="check" /> : <Icon name="profile" />}
                </span>
                <span>
                  <strong>{c.label}</strong>
                  <small>
                    {c.done
                      ? "Completed. You can update this anytime."
                      : c.note}
                  </small>
                </span>
                <Icon name="arrow" />
              </Link>
            ))}
            {!profile && (
              <p className="d-muted">
                Your next steps appear when your profile is available.
              </p>
            )}
          </section>
          <section className="d-panel">
            <div className="d-section-head">
              <h2>Coming up at LOGICA</h2>
              <Link href="/dashboard/events">All events ↗</Link>
            </div>
            {upcoming?.map((e) => (
              <Link href="/dashboard/events" className="d-event-row" key={e.id}>
                <span className="d-date-tile">
                  <small>{date(e.startsAt, { month: "short" })}</small>
                  <strong>{date(e.startsAt, { day: "2-digit" })}</strong>
                </span>
                <span>
                  <strong>{e.title}</strong>
                  <small>
                    {e.location || "Location to be announced"} ·{" "}
                    {new Date(e.startsAt).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </small>
                </span>
                <Icon name="arrow" />
              </Link>
            ))}
            {upcoming?.length === 0 && (
              <Empty title="The next gathering is on its way">
                New club events will appear here when they’re announced.
              </Empty>
            )}
            {!events && (
              <p className="d-muted">Events are not available yet.</p>
            )}
          </section>
        </div>
        <div>
          <section className="d-panel d-note-panel">
            <span className="d-note-icon">
              <Icon name="community" />
            </span>
            <h2>Your community is here.</h2>
            <p>
              Share what you’re working on, ask a question, or say hello. You
              don’t need a finished project to join in.
            </p>
            <Link href="/dashboard/community">
              Open community feed <Icon name="arrow" />
            </Link>
          </section>
          <section className="d-panel">
            <div className="d-section-head">
              <h2>Latest updates</h2>
              <Link href="/dashboard/notifications">View all ↗</Link>
            </div>
            {notices?.slice(0, 3).map((n) => (
              <div className="d-update" key={n.id}>
                <span className={n.readAt ? "d-read-dot" : "d-live-dot"} />
                <div>
                  <p>{n.message}</p>
                  <small>{date(n.createdAt)}</small>
                </div>
              </div>
            ))}
            {notices?.length === 0 && (
              <p className="d-muted d-notice-empty">
                You’re all caught up. Event reminders and club updates will land
                here.
              </p>
            )}
            {!notices && (
              <p className="d-muted">Updates are not available yet.</p>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
export function Activity({ engagement }: { engagement: Engagement | null }) {
  const items = engagement
    ? [
        ...engagement.attendances.map((a) => ({
          id: a.id,
          title: `Attended ${a.event.title}`,
          at: a.checkedInAt,
          kind: "events" as const,
        })),
        ...engagement.posts.map((p) => ({
          id: p.id,
          title: p.body,
          at: p.createdAt,
          kind: "community" as const,
        })),
        ...engagement.submissions.map((s) => ({
          id: s.id,
          title: `Submitted ${s.form.title}`,
          at: s.createdAt,
          kind: "profile" as const,
        })),
      ].sort((a, b) => Date.parse(b.at) - Date.parse(a.at))
    : [];
  return (
    <>
      <Heading
        title="Every little bit adds up."
        description="Your participation in LOGICA, all in one place."
      />
      <Stats engagement={engagement} />
      <section className="d-panel">
        <div className="d-section-head">
          <h2>Recent activity</h2>
          <span className="d-muted">Latest events, posts & forms</span>
        </div>
        {items.map((item) => (
          <div className="d-timeline-item" key={`${item.kind}-${item.id}`}>
            <span className="d-task-circle">
              <Icon name={item.kind} />
            </span>
            <div>
              <p>{item.title}</p>
              <small>
                {date(item.at, {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </small>
            </div>
          </div>
        ))}
        {engagement && !items.length && (
          <Empty title="Your story starts with showing up">
            Join an event or post in the community. Your activity will appear
            here. <Link href="/dashboard/events">Explore events →</Link>
          </Empty>
        )}
        {!engagement && (
          <p className="d-muted">Your activity is not available yet.</p>
        )}
      </section>
    </>
  );
}
export function Notifications({
  notices,
  onChange,
}: {
  notices: Notice[] | null;
  onChange: (n: Notice[]) => void;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  async function read(id: string) {
    setBusy(id);
    setError("");
    try {
      await api(`/api/notifications/${id}`, { method: "PATCH" });
      onChange(
        (notices || []).map((n) =>
          n.id === id ? { ...n, readAt: new Date().toISOString() } : n,
        ),
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }
  return (
    <>
      <Heading
        title="You’re in the loop."
        description="Event reminders and updates from your club."
      />
      {error && (
        <p role="alert" className="d-error">
          {error}
        </p>
      )}
      <section className="d-panel">
        {notices?.map((n) => (
          <div className="d-notification" key={n.id}>
            <span className={n.readAt ? "d-read-dot" : "d-live-dot"} />
            <div>
              <p>{n.message}</p>
              <small>{date(n.createdAt)}</small>
            </div>
            {!n.readAt && (
              <button
                disabled={!!busy}
                className="d-text-button"
                onClick={() => read(n.id)}
              >
                {busy === n.id ? "Saving…" : "Mark read"}
              </button>
            )}
          </div>
        ))}
        {notices?.length === 0 && (
          <Empty title="All caught up">
            We’ll put club updates and reminders here when there’s something for
            you.
          </Empty>
        )}
        {!notices && (
          <p className="d-muted">Notifications are not available yet.</p>
        )}
      </section>
    </>
  );
}
