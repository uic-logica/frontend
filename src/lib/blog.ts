export type BlogAuthor = { id: string; name: string | null; photoUrl: string | null };
export type BlogSummary = { id: string; slug: string; title: string; excerpt: string; publishedAt: string; author: BlogAuthor };
export type BlogPost = Omit<BlogSummary, "excerpt"> & { body: string };

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

export const postDate = (iso: string) =>
  new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", month: "long", day: "numeric", year: "numeric" }).format(new Date(iso));
