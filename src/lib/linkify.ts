/**
 * Splits text into plain runs and http(s) links, so a pasted announcement's
 * URLs can be rendered as anchors. Trailing punctuation stays text: "form:
 * https://x.y/abc." links https://x.y/abc.
 */
export function linkParts(text: string): { text: string; href?: string }[] {
  const parts: { text: string; href?: string }[] = [];
  const plain = (t: string) => {
    if (!t) return;
    const last = parts.at(-1);
    if (last && !last.href) last.text += t;
    else parts.push({ text: t });
  };
  for (const [i, chunk] of text.split(/(https?:\/\/[^\s<>"]+)/g).entries()) {
    if (i % 2 === 0) {
      plain(chunk);
      continue;
    }
    const href = chunk.replace(/[).,!?:;'\]]+$/, "");
    parts.push({ text: href, href });
    plain(chunk.slice(href.length));
  }
  return parts;
}
