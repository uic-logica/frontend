import { describe, expect, it } from "vitest";
import { paragraphs, postDate } from "./blog";

describe("blog helpers", () => {
  it("splits paragraphs on blank lines and keeps single line breaks", () => {
    expect(paragraphs("One\nstill one\n\n  \n\nTwo\n")).toEqual(["One\nstill one", "Two"]);
  });
  it("dates posts in Chicago time", () => {
    expect(postDate("2026-10-15T03:00:00Z")).toBe("October 14, 2026");
  });
});
