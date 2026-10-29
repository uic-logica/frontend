import { describe, expect, it } from "vitest";
import { blocks, firstText, inline, paragraphs, postDate } from "./blog";

describe("blog helpers", () => {
  it("splits paragraphs on blank lines and keeps single line breaks", () => {
    expect(paragraphs("One\nstill one\n\n  \n\nTwo\n")).toEqual(["One\nstill one", "Two"]);
  });
  it("dates posts in Chicago time", () => {
    expect(postDate("2026-10-15T03:00:00Z")).toBe("October 14, 2026");
  });
  it("reads pictures, headings, lists and links", () => {
    expect(blocks("![Yurii at HackHarvard](/api/blog/images/clx1)\n\n## Why him\n\n- Scope\n- [Pitch](https://x.io)\n\nRSVP at https://logicauic.org/events.")).toEqual([
      { kind: "image", alt: "Yurii at HackHarvard", src: "/api/blog/images/clx1" },
      { kind: "heading", text: "Why him" },
      { kind: "list", items: [["Scope"], [{ text: "Pitch", href: "https://x.io" }]] },
      { kind: "text", parts: ["RSVP at ", { text: "https://logicauic.org/events", href: "https://logicauic.org/events" }, "."] },
    ]);
  });
  it("never renders an outside picture or a non-http link", () => {
    expect(blocks("![x](https://evil.example/x.png)")[0].kind).toBe("text");
    expect(inline("[click](javascript:alert(1))")).toEqual(["[click](javascript:alert(1))"]);
  });
  it("describes a post by its first text paragraph", () => {
    expect(firstText("![a](/api/blog/images/c1)\n\n## Hi\n\nOn [Tuesday](https://x.io), pizza.")).toBe("On Tuesday, pizza.");
  });
});
