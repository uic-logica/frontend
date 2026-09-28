/**
 * Grid ⇄ window conversion for the visual availability picker.
 *
 * ponytail: no new field, no migration, no new MCP tool. The grid is a second
 * way to edit the same `{startDate, endDate, startTime, endTime}[]` the form,
 * the API and `set_availability` already speak — so an agent and a speaker
 * dragging cells write the exact same JSON.
 *
 * All string math on purpose: dates never become `Date` objects in local time,
 * so nothing here shifts across DST or the user's timezone.
 */

export type Window = {
  startDate: string; // "YYYY-MM-DD"
  endDate: string;
  startTime: string; // "HH:MM"
  endTime: string;
};

export const SLOT_MINUTES = 30;
export const SLOTS_PER_DAY = (24 * 60) / SLOT_MINUTES;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;

export const toTime = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;

export const toMinutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

export function addDays(date: string, n: number) {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** One cell: "2026-10-05T14:30". */
export const slotKey = (date: string, minutes: number) =>
  `${date}T${toTime(minutes)}`;

/**
 * Paints existing windows onto the grid. Times that don't land on a half hour
 * (the list editor allows 9:15) round outward, so a cell is shown whenever any
 * part of it is free — the grid never silently drops availability.
 */
export function windowsToSlots(windows: Window[]): Set<string> {
  const slots = new Set<string>();
  for (const w of windows ?? []) {
    if (!DATE_RE.test(w?.startDate ?? "") || !DATE_RE.test(w?.endDate ?? ""))
      continue;
    if (!TIME_RE.test(w?.startTime ?? "") || !TIME_RE.test(w?.endTime ?? ""))
      continue;
    const start =
      Math.floor(toMinutes(w.startTime) / SLOT_MINUTES) * SLOT_MINUTES;
    const end = Math.ceil(toMinutes(w.endTime) / SLOT_MINUTES) * SLOT_MINUTES;
    if (end <= start) continue;
    for (let date = w.startDate; date <= w.endDate; date = addDays(date, 1)) {
      for (let m = start; m < end; m += SLOT_MINUTES)
        slots.add(slotKey(date, m));
    }
  }
  return slots;
}

/** Contiguous cells collapse back into windows: runs within a day, then identical runs across consecutive days. */
export function slotsToWindows(slots: Iterable<string>): Window[] {
  const byDate = new Map<string, number[]>();
  for (const key of slots) {
    const [date, time] = key.split("T");
    const mins = byDate.get(date) ?? [];
    mins.push(toMinutes(time));
    byDate.set(date, mins);
  }

  const runs: Window[] = [];
  for (const date of [...byDate.keys()].sort()) {
    const mins = byDate.get(date)!.sort((a, b) => a - b);
    let start = mins[0];
    let prev = mins[0];
    const close = () =>
      runs.push({
        startDate: date,
        endDate: date,
        startTime: toTime(start),
        // The last cell of the day ends at midnight, which no <input type="time"> accepts.
        endTime:
          prev + SLOT_MINUTES >= 24 * 60
            ? "23:59"
            : toTime(prev + SLOT_MINUTES),
      });
    for (const m of mins.slice(1)) {
      if (m !== prev + SLOT_MINUTES) {
        close();
        start = m;
      }
      prev = m;
    }
    close();
  }

  // "Mon–Fri, 9:00–17:00" instead of five identical rows — the board reads these.
  // ponytail: O(n²) scan over a handful of runs; index by time range if a year gets painted solid.
  const merged: Window[] = [];
  for (const w of runs) {
    const open = merged.find(
      (p) =>
        p.startTime === w.startTime &&
        p.endTime === w.endTime &&
        addDays(p.endDate, 1) === w.startDate,
    );
    if (open) open.endDate = w.endDate;
    else merged.push({ ...w });
  }
  return merged;
}

/** Sunday of the week containing `date` — the grid's column origin. */
export function weekStart(date: string) {
  return addDays(date, -new Date(`${date}T00:00:00Z`).getUTCDay());
}

export const today = () => new Date().toLocaleDateString("en-CA"); // local YYYY-MM-DD
