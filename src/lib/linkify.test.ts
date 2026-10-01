import { describe, expect, it } from "vitest";
import { linkParts } from "./linkify";

describe("linkParts", () => {
  it("links URLs and keeps the text around them", () => {
    expect(linkParts("🔗 RSVP: https://forms.gle/3LvX1x\n📍 CDRLC")).toEqual([
      { text: "🔗 RSVP: " },
      { text: "https://forms.gle/3LvX1x", href: "https://forms.gle/3LvX1x" },
      { text: "\n📍 CDRLC" },
    ]);
  });

  it("leaves trailing punctuation out of the link", () => {
    expect(linkParts("at https://x.org/a. Then (https://y.org/b)")).toEqual([
      { text: "at " },
      { text: "https://x.org/a", href: "https://x.org/a" },
      { text: ". Then (" },
      { text: "https://y.org/b", href: "https://y.org/b" },
      { text: ")" },
    ]);
  });

  it("never links anything that isn't http(s)", () => {
    expect(linkParts("javascript:alert(1) and ftp://x")).toEqual([{ text: "javascript:alert(1) and ftp://x" }]);
  });
});
