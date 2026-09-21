"use client";
import Link from "next/link";
import { Icon } from "./Icon";
import { Heading } from "./Overview";
import {
  type Profile,
  type SessionUser,
  date,
  initials,
  isConfirmedSpeaker,
} from "./types";

/**
 * A guest's landing page, in two stages.
 *
 * A *candidate* is someone we're still working out a date with: all they're
 * asked for is availability, and all they get is the thread with the board.
 * Confirming them promotes them to a *speaker*, which is what reveals the
 * talk details, the slides and their event's numbers. The API enforces the
 * same split, so this isn't a hidden button.
 *
 * Either way it's deliberately not the member overview — club events,
 * engagement counters and the community feed are none of a guest's
 * business.
 */
export function SpeakerHome({
  user,
  profile,
}: {
  user: SessionUser;
  profile: Profile | null;
}) {
  const submission = profile?.speakerSubmission;
  const event = submission?.event ?? null;
  const stats = profile?.talkStats ?? null;
  const first = (profile?.name || user.name || "there").split(" ")[0];
  const confirmed = isConfirmedSpeaker(profile ?? null);
  const declined = submission?.status === "DECLINED";

  const hasAvailability = !!submission?.availability?.length;

  // Availability comes first because everything after it is wasted effort if
  // no date works: the board can't confirm a talk they can't schedule. The
  // rest stays open — a speaker who wants to fill it in early isn't blocked,
  // they just see which step actually unlocks the others.
  const allChecks = [
    {
      step: 1,
      label: "Share your availability",
      note: "Dates and times that work, so we can find one that suits us both.",
      done: hasAvailability,
      required: true,
      href: "/dashboard/profile#availability",
    },
    {
      step: 2,
      label: "Name your talk",
      note: hasAvailability
        ? "The title students will see on the poster."
        : "Once a date works, tell us what to put on the poster.",
      done: !!submission?.talkTitle,
      required: true,
      href: "/dashboard/profile#talk",
    },
    {
      step: 3,
      label: "Link your slides",
      note: "A link, not a file — it opens on whatever laptop is in the room.",
      done: !!submission?.slidesUrl,
      required: true,
      href: "/dashboard/profile#talk",
    },
    {
      label: "Introduce yourself",
      note: "A short bio for the event page.",
      done: !!profile?.bio,
      required: false,
      href: "/dashboard/profile",
    },
    {
      label: "Tell us what you need",
      note: "Projector, adapters, room setup, anything at all.",
      done: !!submission?.needs,
      required: false,
      href: "/dashboard/profile#needs",
    },
  ];
  // Until we've confirmed them there is no talk to prepare, so the talk
  // steps aren't on their list at all — asking would imply a yes we haven't
  // given.
  const checks = confirmed
    ? allChecks
    : allChecks.filter((c) => !c.href.includes("#talk"));
  const outstanding = checks.filter((c) => c.required && !c.done);

  return (
    <>
      <Heading
        title={`Welcome back, ${first}.`}
        description={
          !profile
            ? "Loading your visit…"
            : declined
              ? "We couldn't make this one work. Thank you for offering — we'd still love to find a date another semester."
              : !hasAvailability
                ? "First things first: tell us when you're free, so we can work out a date that suits us both."
                : !confirmed
                  ? "Thanks — we have your availability. The board is working out whether we can make a date happen."
                  : outstanding.length
                    ? `Next up: ${outstanding
                        .map((c) => c.label.toLowerCase())
                        .join(", then ")}.`
                    : "You've given us everything we need. Nothing else to do."
        }
      />

      <section className="d-talk">
        <div className="d-talk-main">
          <span className="d-talk-label">
            <span className="d-live-dot" />
            {declined
              ? "Not this time"
              : !confirmed
                ? hasAvailability
                  ? "Candidate · with the board"
                  : "Candidate · step 1"
                : event
                  ? "Scheduled"
                  : "Confirmed · waiting on a date"}
          </span>
          <h2>
            {confirmed
              ? submission?.talkTitle || "Your talk needs a name."
              : hasAvailability
                ? "We're working on a date."
                : "Let's find a date that works."}
          </h2>
          <p>
            {confirmed && event
              ? `${date(event.startsAt, {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })} · ${new Date(event.startsAt).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                })}${event.location ? ` · ${event.location}` : ""}`
              : confirmed
                ? "You're confirmed. The board will lock in the exact date and room with you."
                : hasAvailability
                  ? "Nothing more to do right now. We'll check your windows against the calendar and come back to you in the thread — once we confirm, your talk details open up here."
                  : "Before anything else we need to know when you could come in. Everything else waits until we've agreed a date."}
          </p>
          <div className="d-actions">
            {!hasAvailability ? (
              <Link className="d-button" href="/dashboard/profile#availability">
                Share your availability
              </Link>
            ) : !confirmed ? (
              <>
                <Link className="d-button" href="/dashboard/messages">
                  Message the board
                </Link>
                <Link
                  className="d-button secondary"
                  href="/dashboard/profile#availability"
                >
                  Update your availability
                </Link>
              </>
            ) : (
              <>
                <Link className="d-button" href="/dashboard/profile#talk">
                  {submission?.talkTitle
                    ? "Edit talk details"
                    : "Name your talk"}
                </Link>
                {submission?.slidesUrl ? (
                  <a
                    className="d-button secondary"
                    href={submission.slidesUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open slides ↗
                  </a>
                ) : (
                  <Link
                    className="d-button secondary"
                    href="/dashboard/profile#talk"
                  >
                    Add a slides link
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
        <div className="d-talk-who">
          <span className="d-avatar d-avatar-large">
            {initials(profile?.name || user.name)}
          </span>
          <strong>{profile?.name || user.name || "Your name"}</strong>
          <small>{submission?.organization || "Add your organization"}</small>
        </div>
      </section>

      {/* Numbers are a confirmed-speaker thing — a candidate has no event to
          count, and showing them zeroes would imply one exists. */}
      {confirmed && (
        <section className="d-panel">
          <div className="d-section-head">
            <h2>Your talk, by the numbers</h2>
            <span className="d-muted">
              {event ? event.title : "Live once your date is set"}
            </span>
          </div>
          {stats ? (
            <dl className="d-stats">
              {(
                [
                  ["Saying they'll come", stats.rsvpGoing, "events"],
                  ["Checked in on the day", stats.checkedIn, "profile"],
                  ["Questions on your feed", stats.questions, "community"],
                ] as const
              ).map(([label, value, icon]) => (
                <div key={label}>
                  <dt>
                    <Icon name={icon} />
                    {label}
                  </dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="d-muted">
              Once the board attaches your talk to a date, this is where
              you’ll see who’s coming and who turned up.
            </p>
          )}
        </section>
      )}

      {/* What being confirmed actually gets them — so the wait has a point. */}
      {!confirmed && !declined && (
        <section className="d-panel">
          <div className="d-section-head">
            <h2>What happens next</h2>
            <span className="d-muted">Two steps, both on us</span>
          </div>
          <ol className="d-next">
            <li>
              <strong>We check your windows against the calendar.</strong>
              <span>
                If something lines up, we’ll propose it in your thread. If
                nothing does, we’ll say so rather than leave you waiting.
              </span>
            </li>
            <li>
              <strong>We confirm you as a speaker.</strong>
              <span>
                That opens up your talk title, your slides link, and live
                numbers for who’s coming to your event.
              </span>
            </li>
          </ol>
        </section>
      )}

      <div className="d-columns">
        <section className="d-panel">
          <div className="d-section-head">
            <h2>What we need from you</h2>
            <span className="d-muted">
              {outstanding.length
                ? `${outstanding.length} still to go`
                : "All done"}
            </span>
          </div>
          {checks.map((c) => (
            <Link
              className={`d-task ${c.done ? "complete" : ""}`}
              href={c.href}
              key={c.label}
            >
              <span className="d-task-circle">
                {c.done ? <Icon name="check" /> : (c.step ?? <Icon name="profile" />)}
              </span>
              <span>
                <strong>
                  {c.label}
                  <span className={c.required ? "d-required" : "d-optional"}>
                    {c.required ? "Required" : "Optional"}
                  </span>
                </strong>
                <small>
                  {c.done ? "Done. You can change this anytime." : c.note}
                </small>
              </span>
              <Icon name="arrow" />
            </Link>
          ))}
          {!profile && (
            <p className="d-muted">Your checklist appears once we load your profile.</p>
          )}
        </section>
        <section className="d-panel d-note-panel">
          <span className="d-note-icon">
            <Icon name="community" />
          </span>
          <h2>Talk to the board.</h2>
          <p>
            {confirmed
              ? "One thread with the people organising your visit. Ask about the room, the audience, or anything you need on the day."
              : "One thread with the people working out your date. This is where we'll come back to you — and where to tell us about any constraints we should know."}
          </p>
          <Link href="/dashboard/messages">
            Open your thread <Icon name="arrow" />
          </Link>
        </section>
      </div>
    </>
  );
}
