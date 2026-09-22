"use client";

import { useRef, useState } from "react";
import {
  SLOTS_PER_DAY,
  SLOT_MINUTES,
  type Window,
  addDays,
  slotKey,
  slotsToWindows,
  today,
  toTime,
  weekStart,
  windowsToSlots,
} from "@/lib/availability";

/**
 * Drag-to-paint availability, one week of half-hour cells at a time, any week
 * of any year. Emits the same windows the typed editor does — see lib/availability.
 *
 * Workspace-only: it lives next to the other `d-` components and takes its
 * look from dashboard.css, so there is one place to tune how it feels.
 */

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const ROW_PX = 20;

/** "8 AM", "1:30 PM" — what people say out loud. */
function hourLabel(minutes: number) {
  const h = Math.floor(minutes / 60);
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour} ${h < 12 ? "AM" : "PM"}`;
}

const readableDay = (date: string, opts: Intl.DateTimeFormatOptions) =>
  new Date(`${date}T12:00:00Z`).toLocaleDateString("en-US", {
    ...opts,
    timeZone: "UTC",
  });

export function AvailabilityGrid({
  windows,
  onChange,
}: {
  windows: Window[];
  onChange: (windows: Window[]) => void;
}) {
  const [slots, setSlots] = useState(() => windowsToSlots(windows));
  const [week, setWeek] = useState(() =>
    weekStart([...windowsToSlots(windows)].sort()[0]?.slice(0, 10) ?? today()),
  );
  const [focus, setFocus] = useState<string | null>(null);
  // An in-progress drag: where it started, whether it fills or erases (decided
  // by the first cell), and the selection it started from — so dragging back
  // shrinks the block instead of leaving a trail.
  const drag = useRef<{
    date: string;
    minutes: number;
    on: boolean;
    base: Set<string>;
  } | null>(null);
  const body = useRef<HTMLDivElement | null>(null);
  // Opens on the morning rather than on midnight; the rest is one scroll away.
  const mountBody = (el: HTMLDivElement | null) => {
    // 8 AM, less half a row so the hour's label isn't clipped by the top edge.
    if (el && !body.current)
      el.scrollTop = ((8 * 60) / SLOT_MINUTES) * ROW_PX - ROW_PX / 2;
    body.current = el;
  };

  function commit(next: Set<string>) {
    setSlots(next);
    onChange(slotsToWindows(next));
  }

  function toggle(key: string) {
    const next = new Set(slots);
    if (slots.has(key)) next.delete(key);
    else next.add(key);
    commit(next);
  }

  /**
   * Paints the whole rectangle between where the drag started and the cell the
   * pointer is over now. Steadier than reacting to each cell the pointer
   * touches — a fast drag skips cells, a rectangle can't.
   */
  function paintTo(date: string, minutes: number) {
    const d = drag.current;
    if (!d) return;
    const next = new Set(d.base);
    const [from, to] = d.date <= date ? [d.date, date] : [date, d.date];
    const [lo, hi] =
      d.minutes <= minutes ? [d.minutes, minutes] : [minutes, d.minutes];
    for (let day = from; day <= to; day = addDays(day, 1)) {
      for (let m = lo; m <= hi; m += SLOT_MINUTES) {
        if (d.on) next.add(slotKey(day, m));
        else next.delete(slotKey(day, m));
      }
    }
    commit(next);
  }

  function move(key: string, dx: number, dy: number) {
    const [date, time] = key.split("T");
    const minutes = Number(time.slice(0, 2)) * 60 + Number(time.slice(3));
    const target = Math.min(
      Math.max(minutes + dy * SLOT_MINUTES, 0),
      (SLOTS_PER_DAY - 1) * SLOT_MINUTES,
    );
    const next = slotKey(addDays(date, dx), target);
    const cell = body.current?.querySelector<HTMLButtonElement>(
      `[data-slot="${next}"]`,
    );
    if (cell) {
      setFocus(next);
      cell.focus();
    } else if (dx) {
      // Walked off the edge of the week — bring the next week into view.
      setWeek((w) => addDays(w, dx * 7));
      setFocus(next);
    }
  }

  const days = Array.from({ length: 7 }, (_, i) => addDays(week, i));
  const rows = Array.from(
    { length: SLOTS_PER_DAY },
    (_, i) => i * SLOT_MINUTES,
  );
  const now = today();
  const hours = (slots.size * SLOT_MINUTES) / 60;

  return (
    <div
      className="d-cal"
      onPointerUp={() => (drag.current = null)}
      onPointerLeave={() => (drag.current = null)}
    >
      <div className="d-cal-head">
        <button
          type="button"
          className="d-cal-step"
          onClick={() => setWeek(addDays(week, -7))}
        >
          <span aria-hidden>‹</span>
          <span className="d-sr">Previous week</span>
        </button>
        <strong>
          {readableDay(week, { month: "long", day: "numeric" })} –{" "}
          {readableDay(days[6], { month: "long", day: "numeric" })}
        </strong>
        <button
          type="button"
          className="d-cal-step"
          onClick={() => setWeek(addDays(week, 7))}
        >
          <span aria-hidden>›</span>
          <span className="d-sr">Next week</span>
        </button>
        {week !== weekStart(now) && (
          <button
            type="button"
            className="d-text-button"
            onClick={() => setWeek(weekStart(now))}
          >
            This week
          </button>
        )}
        <label className="d-cal-jump">
          <span className="d-sr">Jump to a date</span>
          <input
            type="date"
            value={week}
            onChange={(e) =>
              e.target.value && setWeek(weekStart(e.target.value))
            }
          />
        </label>
      </div>

      <div className="d-cal-days">
        <span />
        {days.map((date) => (
          <span
            key={date}
            className={
              date === now
                ? "d-cal-today"
                : date < now
                  ? "d-cal-past"
                  : undefined
            }
          >
            {DAYS[new Date(`${date}T00:00:00Z`).getUTCDay()]}
            <em>{Number(date.slice(8))}</em>
          </span>
        ))}
      </div>

      <div ref={mountBody} className="d-cal-body">
        {rows.map((minutes) => (
          <Row
            key={minutes}
            minutes={minutes}
            days={days}
            slots={slots}
            now={now}
            focus={focus ?? slotKey(days[0], 0)}
            onStart={(date, m, pointer) => {
              if (!pointer) {
                toggle(slotKey(date, m));
                return;
              }
              drag.current = {
                date,
                minutes: m,
                on: !slots.has(slotKey(date, m)),
                base: new Set(slots),
              };
              paintTo(date, m);
            }}
            onOver={(date, m) => drag.current && paintTo(date, m)}
            onMove={move}
            onFocus={setFocus}
          />
        ))}
      </div>

      <div className="d-cal-foot">
        <span>
          {slots.size === 0
            ? "Drag across the grid to mark when you're free."
            : `${hours % 1 ? hours.toFixed(1) : hours} hours across ${new Set([...slots].map((s) => s.slice(0, 10))).size} day${
                new Set([...slots].map((s) => s.slice(0, 10))).size === 1
                  ? ""
                  : "s"
              }.`}
        </span>
        {slots.size > 0 && (
          <button
            type="button"
            className="d-text-button"
            onClick={() => {
              setSlots(new Set());
              onChange([]);
            }}
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}

/** One half-hour row: the time label (on the hour only) plus seven cells. */
function Row({
  minutes,
  days,
  slots,
  now,
  focus,
  onStart,
  onOver,
  onMove,
  onFocus,
}: {
  minutes: number;
  days: string[];
  slots: Set<string>;
  now: string;
  focus: string;
  onStart: (date: string, minutes: number, pointer: boolean) => void;
  onOver: (date: string, minutes: number) => void;
  onMove: (key: string, dx: number, dy: number) => void;
  onFocus: (key: string) => void;
}) {
  const onHour = minutes % 60 === 0;
  return (
    <>
      <span className="d-cal-time">{onHour ? hourLabel(minutes) : ""}</span>
      {days.map((date) => {
        const key = slotKey(date, minutes);
        const on = slots.has(key);
        // A block is drawn as one shape: only its ends get rounded corners.
        const above = on && slots.has(slotKey(date, minutes - SLOT_MINUTES));
        const below = on && slots.has(slotKey(date, minutes + SLOT_MINUTES));
        return (
          <button
            key={key}
            type="button"
            data-slot={key}
            aria-pressed={on}
            tabIndex={key === focus ? 0 : -1}
            aria-label={`${readableDay(date, { weekday: "long", month: "long", day: "numeric" })}, ${toTime(minutes)}`}
            onFocus={() => onFocus(key)}
            onPointerDown={(e) => {
              // Touch keeps its implicit capture so the page still scrolls: tap to toggle.
              if (e.pointerType === "touch") return;
              e.currentTarget.releasePointerCapture(e.pointerId);
              onStart(date, minutes, true);
            }}
            onPointerEnter={() => onOver(date, minutes)}
            // Keyboard (and touch tap) arrive as a click with no pointer behind it.
            onClick={(e) => e.detail === 0 && onStart(date, minutes, false)}
            onKeyDown={(e) => {
              const step = {
                ArrowUp: [0, -1],
                ArrowDown: [0, 1],
                ArrowLeft: [-1, 0],
                ArrowRight: [1, 0],
              }[e.key];
              if (!step) return;
              e.preventDefault();
              onMove(key, step[0], step[1]);
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              onStart(date, minutes, false);
            }}
            className={[
              "d-cal-cell",
              onHour ? "d-cal-hour" : "",
              date < now ? "d-cal-past" : "",
              on ? "is-on" : "",
              above ? "joins-above" : "",
              below ? "joins-below" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          />
        );
      })}
    </>
  );
}
