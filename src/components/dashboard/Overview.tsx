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
  runsWorkspace,
  date,
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
  const board = runsWorkspace(user);
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
  const name = (profile?.name || user.name || "there").split(" ")[0];
  const goingIds = new Set(
    engagement?.rsvps.filter((r) => r.status === "GOING").map((r) => r.eventId),
  );
  const coming = upcoming?.filter((event) => goingIds.has(event.id)) ?? [];
  const memberSince = profile?.gradYear ? `Class of ${profile.gradYear}` : null;
  return (
    <>
      <Heading
        title="Overview"
        description="Your club life at a glance, without the board's operational noise."
      />
      <section className="d-overview-hero">
        <div>
          <h2>Good {daypart()}, {name}.</h2>
          <p>{upcoming?.length ? `${upcoming.length} upcoming event${upcoming.length === 1 ? "" : "s"}${coming.length ? ` and ${coming.length} RSVP${coming.length === 1 ? "" : "s"} on your calendar` : ""}.` : "Your next LOGICA event will appear here when it is announced."}</p>
        </div>
        <Link className="d-button" href="/dashboard/events">Explore events</Link>
      </section>
      <div className="d-overview-metrics">
        <Metric value={engagement?.involvement.eventsAttended} label="Events attended" note="All time" />
        <Metric value={coming.length} label="Upcoming RSVPs" note="On your calendar" />
        <Metric value={engagement?.involvement.postsMade} label="Community posts" note="All time" />
        {memberSince && <Metric value={memberSince} label="Member profile" note={roleName(user)} />}
      </div>
      <div className="d-overview-lists">
        <section className="d-panel">
          <div className="d-section-head"><h2>Coming up</h2><span className="d-muted">{coming.length} RSVPs</span></div>
          {(coming.length ? coming : upcoming)?.map((event) => (
            <Link className="d-compact-row" href="/dashboard/events" key={event.id}>
              <span className="d-live-dot" /><span><strong>{event.title}</strong><small>{date(event.startsAt, { month: "short", day: "numeric" })} · {new Date(event.startsAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</small></span>
              <span className="d-badge">{goingIds.has(event.id) ? "Going" : "Open"}</span>
            </Link>
          ))}
          {upcoming?.length === 0 && <Empty title="Nothing scheduled yet">New events will appear here when they are announced.</Empty>}
          {!events && <p className="d-muted">Events are not available yet.</p>}
        </section>
        <section className="d-panel">
          <div className="d-section-head"><h2>For you</h2><span className="d-muted">From your account</span></div>
          {board && pending && pending.length > 0 && <Link className="d-compact-row" href="/dashboard/speakers"><span className="d-live-dot" /><span><strong>Review {pending.length} speaker submission{pending.length === 1 ? "" : "s"}</strong><small>Confirm guests and prepare portal access.</small></span><span className="d-badge">Open</span></Link>}
          {notices?.slice(0, 1).map((notice) => <Link className="d-compact-row" href="/dashboard/notifications" key={notice.id}><span className={notice.readAt ? "d-read-dot" : "d-live-dot"} /><span><strong>{notice.message}</strong><small>{date(notice.createdAt)}</small></span><span className="d-badge">View</span></Link>)}
          {checks.filter((check) => !check.done).slice(0, 2).map((check) => <Link className="d-compact-row" href={check.href} key={check.label}><span className="d-live-dot" /><span><strong>{check.label}</strong><small>{check.note}</small></span><span className="d-badge">Open</span></Link>)}
          {checks.length > 0 && checks.every((check) => check.done) && <p className="d-muted d-notice-empty">Your profile essentials are complete. New suggestions will appear here.</p>}
          {!profile && <p className="d-muted">Suggestions appear when your profile is available.</p>}
        </section>
      </div>
    </>
  );
}

function Metric({ value, label, note }: { value: React.ReactNode; label: string; note: string }) {
  return <div><strong>{value ?? "—"}</strong><span>{label}</span><small>{note}</small></div>;
}

function daypart() {
  const hour = new Date().getHours();
  return hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";
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
        title="My engagement"
        description="A private record of participation, growth, and ways to stay connected."
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
  const unread = notices?.filter((n) => !n.readAt) ?? [];
  const earlier = notices?.filter((n) => n.readAt) ?? [];
  async function read(ids: string[]) {
    setBusy(ids.length === 1 ? ids[0] : "all");
    setError("");
    try {
      await Promise.all(
        ids.map((id) => api(`/api/notifications/${id}`, { method: "PATCH" })),
      );
      const at = new Date().toISOString();
      onChange(
        (notices || []).map((n) =>
          ids.includes(n.id) ? { ...n, readAt: at } : n,
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
        title="Notifications"
        description="Choose what needs your attention and where it should reach you."
      />
      {error && (
        <p role="alert" className="d-error">
          {error}
        </p>
      )}
      {unread.length > 0 && (
        <section className="d-panel">
          <div className="d-section-head">
            <h2>Unread</h2>
            <button
              className="d-text-button"
              disabled={!!busy}
              onClick={() => read(unread.map((n) => n.id))}
            >
              Mark all read
            </button>
          </div>
          {unread.map((n) => (
            <div className="d-notification is-unread" key={n.id}>
              <span className="d-live-dot" />
              <div>
                <p>{n.message}</p>
                <small>{date(n.createdAt)}</small>
              </div>
              <button
                disabled={!!busy}
                className="d-text-button"
                onClick={() => read([n.id])}
              >
                {busy === n.id ? "Saving…" : "Mark read"}
              </button>
            </div>
          ))}
        </section>
      )}
      {/* Read notices move down here, which is the point of marking one —
          the list you're working through gets shorter. */}
      {earlier.length > 0 && (
        <section className="d-panel">
          <div className="d-section-head">
            <h2>Earlier</h2>
            <span className="d-muted">Already read</span>
          </div>
          {earlier.map((n) => (
            <div className="d-notification" key={n.id}>
              <span className="d-read-dot" />
              <div>
                <p>{n.message}</p>
                <small>{date(n.createdAt)}</small>
              </div>
            </div>
          ))}
        </section>
      )}
      <section className="d-panel">
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
