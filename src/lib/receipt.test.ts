import { describe, expect, it } from "vitest";
import { parseReceipt } from "./receipt";

describe("parseReceipt", () => {
  it("reads a typical store receipt", () => {
    const text = `JEWEL OSCO
1340 S Canal St, Chicago IL
10/12/2026 5:41 PM
PIZZA 12.99
SODA 6.49
SUBTOTAL 19.48
TAX 2.01
TOTAL $21.49
VISA 21.49`;
    expect(parseReceipt(text)).toEqual({ vendor: "JEWEL OSCO", total: 21.49, date: "2026-10-12" });
  });

  it("ignores subtotal and tax lines and handles thousands and written dates", () => {
    const text = `Costco Wholesale
Oct 3, 2026
Sub Total 1,180.00
Tax 104.50
Amount Due 1,284.50`;
    expect(parseReceipt(text)).toEqual({ vendor: "Costco Wholesale", total: 1284.5, date: "2026-10-03" });
  });

  it("falls back to the largest amount, and returns nulls it can't find", () => {
    expect(parseReceipt("Thanks!\n4.00\n12.50\n3.25").total).toBe(12.5);
    expect(parseReceipt("")).toEqual({ vendor: null, total: null, date: null });
  });
});
