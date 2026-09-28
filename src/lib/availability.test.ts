import { describe, expect, it } from "vitest";
import { slotsToWindows, weekStart, windowsToSlots } from "./availability";

describe("windowsToSlots", () => {
  it("covers every day of a multi-day window", () => {
    const slots = windowsToSlots([
      { startDate: "2026-10-05", endDate: "2026-10-07", startTime: "09:00", endTime: "10:00" },
    ]);
    expect(slots.size).toBe(6);
    expect(slots.has("2026-10-06T09:30")).toBe(true);
    expect(slots.has("2026-10-06T10:00")).toBe(false); // end is exclusive
  });

  it("rounds odd times outward so nothing is dropped", () => {
    const slots = windowsToSlots([
      { startDate: "2026-10-05", endDate: "2026-10-05", startTime: "09:15", endTime: "10:45" },
    ]);
    expect([...slots]).toEqual([
      "2026-10-05T09:00",
      "2026-10-05T09:30",
      "2026-10-05T10:00",
      "2026-10-05T10:30",
    ]);
  });

  it("ignores half-filled and backwards windows instead of throwing", () => {
    expect(windowsToSlots([{ startDate: "", endDate: "", startTime: "", endTime: "" }]).size).toBe(0);
    expect(
      windowsToSlots([{ startDate: "2026-10-07", endDate: "2026-10-05", startTime: "09:00", endTime: "10:00" }]).size,
    ).toBe(0);
  });
});

describe("slotsToWindows", () => {
  it("splits a day into one window per contiguous run", () => {
    expect(
      slotsToWindows(["2026-10-05T09:00", "2026-10-05T09:30", "2026-10-05T13:00"]),
    ).toEqual([
      { startDate: "2026-10-05", endDate: "2026-10-05", startTime: "09:00", endTime: "10:00" },
      { startDate: "2026-10-05", endDate: "2026-10-05", startTime: "13:00", endTime: "13:30" },
    ]);
  });

  it("merges consecutive days that share the same hours", () => {
    const slots = windowsToSlots([
      { startDate: "2026-10-05", endDate: "2026-10-09", startTime: "09:00", endTime: "17:00" },
    ]);
    expect(slotsToWindows(slots)).toEqual([
      { startDate: "2026-10-05", endDate: "2026-10-09", startTime: "09:00", endTime: "17:00" },
    ]);
  });

  it("does not merge across a gap day", () => {
    const slots = windowsToSlots([
      { startDate: "2026-10-05", endDate: "2026-10-05", startTime: "09:00", endTime: "10:00" },
      { startDate: "2026-10-07", endDate: "2026-10-07", startTime: "09:00", endTime: "10:00" },
    ]);
    expect(slotsToWindows(slots)).toHaveLength(2);
  });

  it("ends the last slot of the day at 23:59, which a time input accepts", () => {
    expect(slotsToWindows(["2026-10-05T23:30"])[0].endTime).toBe("23:59");
  });

  it("round-trips 23:59 back to the same window", () => {
    const w = [{ startDate: "2026-10-05", endDate: "2026-10-05", startTime: "23:00", endTime: "23:59" }];
    expect(slotsToWindows(windowsToSlots(w))).toEqual(w);
  });
});

describe("weekStart", () => {
  it("returns the Sunday on or before the date", () => {
    expect(weekStart("2026-10-07")).toBe("2026-10-04"); // Wednesday -> Sunday
    expect(weekStart("2026-10-04")).toBe("2026-10-04");
  });
});
