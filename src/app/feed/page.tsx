"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type Post = { id: string; body: string; createdAt: string; author: { name: string | null } };

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  function load() {
    api<Post[]>("/api/posts").then(setPosts).catch((e) => setError(e.message));
  }

  useEffect(load, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    try {
      await api("/api/posts", { method: "POST", body: JSON.stringify({ body: draft }) });
      setDraft("");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <main className="mx-auto max-w-lg p-8">
      <h1 className="text-xl font-semibold">Feed [scaffold]</h1>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <form onSubmit={submit} className="mt-4 flex gap-2">
        <input
          placeholder="What's happening?"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="flex-1 border px-3 py-2"
        />
        <button type="submit" className="border px-3 py-2">Post</button>
      </form>
      <ul className="mt-6 flex flex-col gap-3">
        {posts.map((p) => (
          <li key={p.id} className="border p-3">
            <p className="text-sm text-zinc-500">{p.author.name ?? "Unknown"}</p>
            <p>{p.body}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
