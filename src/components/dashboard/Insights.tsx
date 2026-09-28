"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Empty, Heading } from "./Overview";
import { type ClubInsights, date, initials } from "./types";

/**
 * How the club is actually doing. Read-only — every number is aggregated
 * from events, RSVPs, check-ins and members, so nobody has to maintain it.
 *
 * The bars are two <div>s and a width, not a chart library: there is one
 * chart on this page and it has two series. Adding Recharts for that would
 * cost more than the whole feature.
 */
export function Insights() {
  const [data, setData] = useState<ClubInsights | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    api<ClubInsights>("/api/board/insights")
      .then((d) => alive && setData(d))
      .catch((e: Error) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, []);

  if (error) {
    return (
      <>
        <Heading title="Insights" description="How the club is doing." />
        <p className="d-error" role="alert">
          {error}
        </p>
      </>
    );
  }
  if (!data) {
    return (
      <>
        <Heading title="Insights" description="How the club is doing." />
        <div className="d-skeleton">
          <span />
          <span />
          <span />
        </div>
      </>
    );
  }

  const { members, events, topAttendees } = data;
  const peak = Math.max(1, ...events.map((e) => Math.max(e.going, e.attended)));
  // Newest first from the API; a chart reads left-to-right in time order.
  const timeline = [...events].reverse();

  return (
    <>
      <Heading
        title="How the club is doing."
        description={`Everyone who's signed up, and who's still turning up. "Active" means at least one check-in in the last ${members.activeWindowDays} days.`}
      />

      <div className="d-directory-summary">
        <div>
          <strong>{members.total}</strong>
          <span>Members</span>
        </div>
        <div>
          <strong>{members.active}</strong>
          <span>Active</span>
        </div>
        <div>
          <strong>{members.lapsed}</strong>
          <span>Gone quiet</span>
        </div>
        <div>
          <strong>{members.joinedRecently}</strong>
          <span>Joined recently</span>
        </div>
      </div>

      <section className="d-panel">
        <div className="d-section-head">
          <h2>Who showed up</h2>
          <span className="d-muted">
            <i className="d-key d-key-going" /> said they&apos;d come{" "}
            <i className="d-key d-key-came" /> came
          </span>
        </div>
        {timeline.length === 0 ? (
          <Empty title="No events yet">
            Run one and the attendance picture starts building itself.
          </Empty>
        ) : (
          <ul className="d-bars">
            {timeline.map((event) => (
              <li key={event.id}>
                <div className="d-bar-head">
                  <strong>{event.title}</strong>
                  <span className="d-muted">{date(event.startsAt)}</span>
                </div>
                {/* minWidth only above zero — a sliver where nobody came
                    reads as "a few did", which is the opposite of true. */}
                <div className="d-bar-track">
                  <div
                    className="d-bar d-bar-going"
                    style={{
                      width: `${(event.going / peak) * 100}%`,
                      minWidth: event.going ? 2 : 0,
                    }}
                  />
                  <div
                    className="d-bar d-bar-came"
                    style={{
                      width: `${(event.attended / peak) * 100}%`,
                      minWidth: event.attended ? 2 : 0,
                    }}
                  />
                </div>
                <div className="d-bar-foot">
                  <span>
                    {event.attended} of {event.going}
                  </span>
                  <span className="d-muted">
                    {event.showRate === null
                      ? "nobody RSVP'd"
                      : `${event.showRate}% turned up`}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="d-columns">
        <section className="d-panel">
          <div className="d-section-head">
            <h2>Comes to everything</h2>
          </div>
          {topAttendees.length === 0 ? (
            <Empty title="Nobody has checked in yet">
              Attendance fills this in once people start scanning at the door.
            </Empty>
          ) : (
            <ul className="d-rank">
              {topAttendees.map((person, index) => (
                <li key={person.id}>
                  <span className="d-rank-n">{index + 1}</span>
                  <span className="d-avatar d-avatar-small">{initials(person.name)}</span>
                  <span>
                    <strong>{person.name || person.email}</strong>
                    <small>
                      {[person.major, person.gradYear].filter(Boolean).join(" · ") || person.email}
                    </small>
                  </span>
                  <span className="d-rank-count">{person.attended}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="d-panel">
          <div className="d-section-head">
            <h2>Pipelines</h2>
          </div>
          <Tally title="Guest speakers" counts={data.speakers} />
          <Tally title="Membership applications" counts={data.applications} />
        </section>
      </div>
    </>
  );
}

function Tally({ title, counts }: { title: string; counts: Record<string, number> }) {
  const rows = Object.entries(counts);
  return (
    <div className="d-tally">
      <h3>{title}</h3>
      {rows.length === 0 ? (
        <p className="d-muted">Nothing yet.</p>
      ) : (
        <dl>
          {rows.map(([status, count]) => (
            <div key={status}>
              <dt>{status.charAt(0) + status.slice(1).toLowerCase()}</dt>
              <dd>{count}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
