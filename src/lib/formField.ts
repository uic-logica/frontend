/**
 * FormField.type is free text in the backend schema ("text" | "textarea" |
 * ... with no enum), so whatever is in the database reaches the renderer
 * unvalidated. An unknown value must not become a DOM type attribute.
 *
 * Allowlist the types the browser does something useful with — mostly the
 * right keyboard on a phone — and treat everything else as plain text.
 * "textarea" is deliberately absent: it is a different element, handled by
 * the caller, not an input type.
 */
const INPUT_TYPES = ["text", "email", "number", "tel", "url", "date", "time"];

export const inputType = (type: string) =>
  INPUT_TYPES.includes(type) ? type : "text";
