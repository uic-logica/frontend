import { describe, expect, it } from "vitest";
import { eventDate, rsvpWindowOpen, splitEvents, type ClubEvent } from "./events";

const ev = (id: string, startsAt: string): ClubEvent => ({ id, title: id, location: null, startsAt, link: null });

describe("splitEvents", () => {
  it("puts future events in upcoming, soonest first, and the rest in past", () => {
    const now = Date.parse("2026-10-15T12:00:00Z");
    const { upcoming, past } = splitEvents(
      [ev("later", "2026-11-06T23:00:00Z"), ev("gone", "2026-09-08T22:00:00Z"), ev("soon", "2026-10-21T23:00:00Z")],
      null,
      now,
    );
    expect(upcoming.map((e) => e.id)).toEqual(["soon", "later"]);
    expect(past.map((e) => e.id)).toEqual(["gone"]);
  });
});

describe("eventDate", () => {
  it("formats in Chicago time, whatever the machine's zone", () => {
    // 23:00 UTC on Oct 21 is 6:00 PM in Chicago (CDT).
    const d = eventDate("2026-10-21T23:00:00Z");
    expect(d.month).toBe("OCT");
    expect(d.day).toBe("21");
    expect(d.weekdayTime).toBe("Wed 6:00 PM");
    expect(d.time).toBe("6:00 PM");
  });
  it("shows the end time when there is one", () => {
    const d = eventDate("2026-11-23T23:00:00.000Z", "2026-11-24T00:30:00.000Z");
    expect(d.time).toBe("5:00 PM – 6:30 PM");
    expect(d.full).toMatch(/Monday, November 23.*5:00 PM – 6:30 PM$/);
  });
});

describe("rsvpWindowOpen", () => {
  const start = Date.parse("2026-11-10T22:00:00.000Z");
  it("stays open until two hours after the start, and always for TBD", () => {
    expect(rsvpWindowOpen("2026-11-10T22:00:00.000Z", start + 3600_000)).toBe(true);
    expect(rsvpWindowOpen("2026-11-10T22:00:00.000Z", start + 3 * 3600_000)).toBe(false);
    expect(rsvpWindowOpen(null)).toBe(true);
  });
});
