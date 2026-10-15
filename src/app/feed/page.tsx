"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ClubShell } from "@/components/club/ClubShell";

type Post = {
  id: string;
  body: string;
  createdAt: string;
  author: { id?: string; name: string | null };
};

/** The community feed (logica.pen V4 "19 Feed"): a composer, then the posts in a grid. */
export default function FeedPage() {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function load() {
    api<Post[]>("/api/posts")
      .then((data) => setPosts(Array.isArray(data) ? data : []))
      .catch((e: Error) => {
        setError(e.message);
        setPosts([]);
      });
  }

  useEffect(load, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await api("/api/posts", { method: "POST", body: JSON.stringify({ body: draft }) });
      setDraft("");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  const loading = posts === null;

  return (
    <ClubShell>
      <main className="site-page feed-page">
        <header className="site-page-head">
          <p className="site-kicker">FEED</p>
          <h1 className="serif">What the club is saying</h1>
        </header>

        <form onSubmit={submit} className="site-card feed-composer site-form">
          <label className="site-field" htmlFor="draft">
            <span>Compose</span>
            <textarea id="draft" rows={3} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Share an update with LOGICA…" />
          </label>
          <div className="feed-actions">
            <button type="submit" disabled={busy} className="site-btn">{busy ? "Posting…" : "Post"}</button>
            <Link href="/signin?next=/feed" className="site-muted">Need to sign in?</Link>
          </div>
        </form>

        {error && <p className="site-error" role="status">{error}</p>}

        {loading && <p className="site-muted" role="status">Loading feed…</p>}

        {!loading && posts.length === 0 && (
          <div className="forms-unavailable">
            <h2 className="serif">Feed is quiet</h2>
            <p>No posts yet. When members publish, they&apos;ll show up here.</p>
          </div>
        )}

        {!loading && posts.length > 0 && (
          <ul className="feed-grid">
            {posts.map((p) => (
              <li key={p.id} className="site-card feed-post">
                <div className="feed-author">
                  <span className="speak-initials" aria-hidden="true">{initials(p.author.name)}</span>
                  <span>
                    <strong>{p.author.name ?? "Unknown"}</strong>
                    <small>{when.format(new Date(p.createdAt))}</small>
                  </span>
                </div>
                <p>{p.body}</p>
              </li>
            ))}
          </ul>
        )}
      </main>
    </ClubShell>
  );
}

const when = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

function initials(name: string | null) {
  const parts = name?.trim().split(/\s+/) ?? [];
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}
