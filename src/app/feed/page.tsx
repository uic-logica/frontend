"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  AppShell,
  AvatarMonogram,
  EmptyState,
  PageHeader,
  buttonClass,
  inputClass,
} from "@/components/shell/AppShell";

type Post = {
  id: string;
  body: string;
  createdAt: string;
  author: { id?: string; name: string | null };
};

/** Feed — fixed Bulcão modules; body capped at 68ch (Eddie §4.3 / §5.1). */
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
    <AppShell>
      <PageHeader
        eyebrow="Feed"
        title="What the club is saying"
        description="Fixed modules like Athos Bulcão tiles — same footprint, shifting content. Sign in to post."
      />

      <div className="mx-auto max-w-shell px-4 py-14 md:px-6 md:py-24">
        <form onSubmit={submit} className="card mb-10 border-ink p-5 shadow-block md:p-6">
          <label htmlFor="draft" className="type-label">
            Compose
          </label>
          <textarea
            id="draft"
            rows={3}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Share an update with LOGICA…"
            className={`${inputClass} mt-2 min-h-[5rem] py-3`}
          />
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button type="submit" disabled={busy} className={buttonClass}>
              {busy ? "Posting…" : "Post"}
            </button>
            <Link href="/signin" className="type-label text-ink-muted underline-offset-4 hover:text-signal hover:underline">
              Need to sign in?
            </Link>
          </div>
        </form>

        {error && (
          <p className="rounded-lg mb-6 border-2 border-signal bg-paper px-4 py-3 text-body-sm text-signal" role="status">
            {error}
          </p>
        )}

        {loading && <p className="text-body text-ink-muted">Loading feed…</p>}

        {!loading && posts.length === 0 && (
          <EmptyState
            title="Feed is quiet"
            body="No posts yet. When members publish, they'll tile in here at a fixed module size."
          />
        )}

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {!loading &&
            posts.map((p, i) => {
              const offset = i % 3 === 1 ? "translate-y-3" : i % 3 === 2 ? "-translate-y-1" : "";
              const rule = i % 2 === 0 ? "border-l-ink" : "border-l-signal";
              return (
                <li
                  key={p.id}
                  className={`feed-module flex flex-col justify-between border-l-4 p-5 ${rule} ${offset}`}
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <AvatarMonogram id={p.author.id ?? p.id} name={p.author.name} size="sm" />
                      <div>
                        <p className="type-label">{p.author.name ?? "Unknown"}</p>
                        <p className="text-caption text-ink-muted">
                          {new Date(p.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <p className="mt-4 max-w-measure text-body">{p.body}</p>
                  </div>
                </li>
              );
            })}
        </ul>
      </div>
    </AppShell>
  );
}
