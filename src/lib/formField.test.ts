import { describe, expect, it } from "vitest";
import { inputType } from "./formField";

describe("inputType", () => {
  it("passes through the types the browser handles specially", () => {
    for (const t of ["email", "number", "tel", "url", "date", "time"]) {
      expect(inputType(t)).toBe(t);
    }
  });

  it("falls back to text for a type nobody defined", () => {
    expect(inputType("dropdown")).toBe("text");
    expect(inputType("")).toBe("text");
  });

  it("does not let a database value become an arbitrary type attribute", () => {
    // FormField.type is unvalidated free text, so this is reachable.
    expect(inputType("checkbox")).toBe("text");
    expect(inputType("file")).toBe("text");
    expect(inputType("password")).toBe("text");
    expect(inputType("hidden")).toBe("text");
  });

  it("does not treat textarea as an input type", () => {
    // The caller renders a <textarea> element instead; if this ever
    // returned "textarea" the field would silently become a text box.
    expect(inputType("textarea")).toBe("text");
  });
});
