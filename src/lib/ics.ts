/**
 * Builds a single-event .ics file.
 *
 * ponytail: ~25 lines of string building instead of a calendar dependency.
 * The spec is fussy about three things and forgiving about the rest: CRLF
 * line endings, escaped commas/semicolons/newlines in text, and a UID.
 *
 * Events have no end time in the schema, so we assume an hour. Swap in the
 * real value if `endsAt` is ever added.
 */

const DEFAULT_MINUTES = 60;

/** ICS wants UTC as YYYYMMDDTHHMMSSZ, with no punctuation. */
const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

/** Commas, semicolons and backslashes are delimiters; newlines become \n. */
const esc = (s: string) =>
  s.replace(/([\\,;])/g, "\\$1").replace(/\r?\n/g, "\\n");

export type IcsEvent = {
  id: string;
  title: string;
  startsAt: string;
  location?: string | null;
  description?: string | null;
};

export function toIcs(event: IcsEvent): string {
  const start = new Date(event.startsAt);
  const end = new Date(start.getTime() + DEFAULT_MINUTES * 60_000);

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//LOGICA @ UIC//Events//EN",
    "BEGIN:VEVENT",
    `UID:${event.id}@logica.uic.edu`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${esc(event.title)}`,
    event.location ? `LOCATION:${esc(event.location)}` : null,
    event.description ? `DESCRIPTION:${esc(event.description)}` : null,
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean);

  return lines.join("\r\n");
}

/** Filename-safe slug, so the download isn't called "download.ics". */
export const icsFilename = (title: string) =>
  `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "event"}.ics`;

/** Triggers the download. Browser-only — uses a Blob URL, revoked after. */
export function downloadIcs(event: IcsEvent) {
  const url = URL.createObjectURL(new Blob([toIcs(event)], { type: "text/calendar" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = icsFilename(event.title);
  a.click();
  URL.revokeObjectURL(url);
}
