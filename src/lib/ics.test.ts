import { describe, expect, it } from "vitest";
import { icsFilename, toIcs } from "./ics";

const base = { id: "evt1", title: "Intro to LOGICA", startsAt: "2026-10-03T23:00:00.000Z" };

describe("toIcs", () => {
  it("emits CRLF line endings, which the spec requires", () => {
    const ics = toIcs(base);
    expect(ics).toContain("\r\n");
    expect(ics.split("\r\n")[0]).toBe("BEGIN:VCALENDAR");
    expect(ics.trimEnd().endsWith("END:VCALENDAR")).toBe(true);
  });

  it("writes UTC stamps with no punctuation", () => {
    expect(toIcs(base)).toContain("DTSTART:20261003T230000Z");
  });

  it("defaults to a one-hour event, since the schema has no end time", () => {
    expect(toIcs(base)).toContain("DTEND:20261004T000000Z");
  });

  it("escapes the delimiters that would otherwise corrupt the file", () => {
    const ics = toIcs({
      ...base,
      title: "Talk: AI, ethics; and you",
      location: "SELE 2249, Chicago",
      description: "Line one\nline two",
    });
    expect(ics).toContain("SUMMARY:Talk: AI\\, ethics\\; and you");
    expect(ics).toContain("LOCATION:SELE 2249\\, Chicago");
    expect(ics).toContain("DESCRIPTION:Line one\\nline two");
  });

  it("leaves out optional lines rather than emitting empty ones", () => {
    const ics = toIcs(base);
    expect(ics).not.toContain("LOCATION:");
    expect(ics).not.toContain("DESCRIPTION:");
  });
});

describe("icsFilename", () => {
  it("slugs the title", () => {
    expect(icsFilename("Intro to LOGICA")).toBe("intro-to-logica.ics");
  });

  it("falls back when a title has nothing usable", () => {
    expect(icsFilename("!!!")).toBe("event.ics");
  });
});
