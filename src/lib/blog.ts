export type BlogAuthor = { id: string; name: string | null; photoUrl: string | null };
export type BlogSummary = { id: string; slug: string; title: string; excerpt: string; cover?: string | null; publishedAt: string; author: BlogAuthor };
export type BlogPost = Omit<BlogSummary, "excerpt" | "cover"> & { body: string };

// ponytail: same server fetch + revalidate as lib/events.ts. A post an exec
// publishes shows up within a minute, no redeploy.
const REVALIDATE_SECONDS = 60;
const base = () => process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

async function get<T>(path: string): Promise<T | "missing"> {
  const res = await fetch(`${base()}${path}`, { next: { revalidate: REVALIDATE_SECONDS }, signal: AbortSignal.timeout(8000) });
  if (res.status === 404) return "missing";
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

export async function getPosts(): Promise<{ posts: BlogSummary[]; error: string | null }> {
  try {
    const body = await get<BlogSummary[]>("/api/blog");
    return { posts: Array.isArray(body) ? body : [], error: null };
  } catch {
    return { posts: [], error: "Couldn't load posts right now." };
  }
}

/** The post, "missing" for a 404 (a real not-found), or null when the backend is down. */
export async function getPost(slug: string): Promise<BlogPost | "missing" | null> {
  try {
    return await get<BlogPost>(`/api/blog/${encodeURIComponent(slug)}`);
  } catch {
    return null;
  }
}

/** Blank line = new paragraph, as the dashboard editor says. */
export const paragraphs = (body: string) => body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

/**
 * The little markup posts support, one paragraph at a time:
 *   ![caption](/api/blog/images/<id>)   a picture uploaded from the editor (only ours: the CSP is img-src 'self')
 *   ## Heading
 *   - a list, one item per line
 *   [words](https://…) or a bare https://… link, anywhere in text
 * Anything else is a plain paragraph. ponytail: not Markdown, just these
 * four; add more only when a post needs it.
 */
export type Inline = string | { text: string; href: string };
export type Block =
  | { kind: "image"; alt: string; src: string }
  | { kind: "heading"; text: string }
  | { kind: "list"; items: Inline[][] }
  | { kind: "text"; parts: Inline[] };

const IMAGE = /^!\[([^\]]*)\]\((\/api\/blog\/images\/[a-z0-9]+)\)$/;
const LINK = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|https?:\/\/[^\s<>()]+/g;

export function inline(text: string): Inline[] {
  const parts: Inline[] = [];
  let at = 0;
  for (const m of text.matchAll(LINK)) {
    const whole = m[0];
    let [, words, href] = m;
    let end = m.index + whole.length;
    if (!href) {
      // A bare link ending a sentence keeps its period out of the URL.
      const trimmed = whole.replace(/[.,;:!?'"]+$/, "");
      end -= whole.length - trimmed.length;
      href = words = trimmed;
    }
    if (m.index > at) parts.push(text.slice(at, m.index));
    parts.push({ text: words, href });
    at = end;
  }
  if (at < text.length) parts.push(text.slice(at));
  return parts;
}

export function blocks(body: string): Block[] {
  return paragraphs(body).map((p): Block => {
    const image = IMAGE.exec(p);
    if (image) return { kind: "image", alt: image[1], src: image[2] };
    const heading = /^#{1,3} ([^\n]+)$/.exec(p);
    if (heading) return { kind: "heading", text: heading[1] };
    const lines = p.split("\n");
    if (lines.every((line) => line.startsWith("- "))) return { kind: "list", items: lines.map((line) => inline(line.slice(2))) };
    return { kind: "text", parts: inline(p) };
  });
}

/** The first text paragraph as plain words, for meta descriptions. */
export function firstText(body: string): string {
  const block = blocks(body).find((b) => b.kind === "text");
  return block?.kind === "text" ? block.parts.map((part) => (typeof part === "string" ? part : part.text)).join("").replace(/\s+/g, " ") : "";
}

export const postDate = (iso: string) =>
  new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", month: "long", day: "numeric", year: "numeric" }).format(new Date(iso));
