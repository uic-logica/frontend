"use client";

import { use, useEffect, useRef, useState } from "react";
import { ClubShell, PageContainer, SectionContainer } from "@/components/club/ClubShell";
import { darkButtonClass, darkInputClass } from "@/components/ui/darkForm";
import { ApiError, api } from "@/lib/api";

type Event = { id: string; title: string; description: string | null; location: string | null; startsAt: string };
type Post = { id: string; body: string; createdAt: string; author: { id: string; name: string | null } };
type Material = { id: string; filename: string; mimeType: string; visibility: "PUBLIC" | "INTERNAL"; createdAt: string };
type Profile = { role: string };

/** Signed-in event detail — materials (slides/notes) + a feed for notes/thoughts about this event. */
export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [event, setEvent] = useState<Event | null>(null);
  const [authError, setAuthError] = useState(false);
  const [isBoard, setIsBoard] = useState(false);

  useEffect(() => {
    api<Event>(`/api/events/${id}`)
      .then(setEvent)
      .catch((e: unknown) => {
        if (e instanceof ApiError && e.status === 401) setAuthError(true);
      });
    api<Profile>("/api/profile")
      .then((p) => setIsBoard(p.role === "BOARD" || p.role === "EXEC_BOARD"))
      .catch(() => setIsBoard(false));
  }, [id]);

  return (
    <ClubShell>
      <PageContainer>
        <SectionContainer>
          <div className="mx-auto max-w-md">
            {event ? (
              <>
                <h1 className="text-3xl font-bold md:text-4xl text-white">{event.title}</h1>
                <p className="mt-3 text-body-lg text-white">
                  {new Date(event.startsAt).toLocaleString()}
                  {event.location ? ` · ${event.location}` : ""}
                </p>
                {event.description && <p className="mt-4 text-body text-white">{event.description}</p>}
              </>
            ) : authError ? (
              <>
                <h1 className="text-3xl font-bold md:text-4xl text-white">Event details</h1>
                <p className="mt-3 text-body text-white">
                  <a href="/signin" className="font-bold text-signal hover:underline">
                    Sign in
                  </a>{" "}
                  to see the full date, location, and description. Public materials below don&apos;t require signing in.
                </p>
              </>
            ) : (
              <p className="text-body-sm text-white">Loading…</p>
            )}
          </div>
        </SectionContainer>

        {/* Materials are independently public/internal per-item — this panel works signed out. */}
        <SectionContainer>
          <div className="mx-auto max-w-md">
            <MaterialsPanel eventId={id} isBoard={isBoard} />
          </div>
        </SectionContainer>

        {/* The feed itself requires sign-in (backend), so it handles its own gate. */}
        <SectionContainer>
          <div className="mx-auto max-w-md">
            <FeedPanel eventId={id} eventTitle={event?.title ?? "this event"} />
          </div>
        </SectionContainer>
      </PageContainer>
    </ClubShell>
  );
}

function MaterialsPanel({ eventId, isBoard }: { eventId: string; isBoard: boolean }) {
  const [materials, setMaterials] = useState<Material[] | null>(null);
  const [visibility, setVisibility] = useState<"PUBLIC" | "INTERNAL">("INTERNAL");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  function load() {
    api<Material[]>(`/api/events/${eventId}/materials`)
      .then(setMaterials)
      .catch(() => setMaterials([]));
  }
  useEffect(load, [eventId]);

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(",")[1] ?? "");
        reader.onerror = () => reject(new Error("Could not read file."));
        reader.readAsDataURL(file);
      });
      await api(`/api/events/${eventId}/materials`, {
        method: "POST",
        body: JSON.stringify({ filename: file.name, mimeType: file.type || "application/octet-stream", data, visibility }),
      });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="club-card bg-white/[0.02] p-6 sm:p-8">
      <h2 className="type-h3 text-white">Materials</h2>
      {materials === null && <p className="mt-3 text-body-sm text-white">Loading…</p>}
      {materials?.length === 0 && <p className="mt-3 text-body-sm text-white">Nothing uploaded yet.</p>}
      {materials && materials.length > 0 && (
        <ul className="mt-4 flex flex-col gap-2">
          {materials.map((m) => (
            <li key={m.id} className="rounded-lg flex items-center justify-between gap-3 border border-white/10 px-4 py-3 text-body-sm">
              <a
                href={`/api/materials/${m.id}/download`}
                className="font-bold text-signal hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                {m.filename}
              </a>
              {isBoard && <span className="text-caption text-white">{m.visibility}</span>}
            </li>
          ))}
        </ul>
      )}

      {isBoard && (
        <div className="mt-6 border-t border-white/10 pt-6">
          {error && <p className="mb-3 text-body-sm text-signal">{error}</p>}
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as "PUBLIC" | "INTERNAL")}
              className={`${darkInputClass} w-auto`}
            >
              <option value="INTERNAL">Internal (board only)</option>
              <option value="PUBLIC">Public</option>
            </select>
            <button type="button" disabled={busy} onClick={() => fileInput.current?.click()} className={`${darkButtonClass} w-auto`}>
              {busy ? "Uploading…" : "Upload material"}
            </button>
          </div>
          <input ref={fileInput} type="file" onChange={upload} hidden />
        </div>
      )}
    </div>
  );
}

function FeedPanel({ eventId, eventTitle }: { eventId: string; eventTitle: string }) {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signedOut, setSignedOut] = useState(false);

  function load() {
    api<Post[]>(`/api/events/${eventId}/feed`)
      .then(setPosts)
      .catch((e: unknown) => {
        if (e instanceof ApiError && e.status === 401) setSignedOut(true);
        setPosts([]);
      });
  }
  useEffect(load, [eventId]);

  if (signedOut) {
    return (
      <div className="club-card bg-white/[0.02] p-6 sm:p-8">
        <h2 className="type-h3 text-white">Notes on {eventTitle}</h2>
        <p className="mt-3 text-body-sm text-white">
          <a href="/signin" className="font-bold text-signal hover:underline">
            Sign in
          </a>{" "}
          to read and post notes.
        </p>
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await api(`/api/events/${eventId}/feed`, { method: "POST", body: JSON.stringify({ body: draft }) });
      setDraft("");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="club-card bg-white/[0.02] p-6 sm:p-8">
      <h2 className="type-h3 text-white">Notes on {eventTitle}</h2>

      <form onSubmit={submit} className="mt-4 flex flex-col gap-3">
        {error && <p className="text-body-sm text-signal">{error}</p>}
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Share a thought…"
          rows={2}
          className={`${darkInputClass} min-h-[3.5rem] py-3`}
        />
        <button type="submit" disabled={busy} className={`${darkButtonClass} w-auto self-start`}>
          {busy ? "Posting…" : "Post"}
        </button>
      </form>

      {posts === null && <p className="mt-4 text-body-sm text-white">Loading…</p>}
      {posts?.length === 0 && <p className="mt-4 text-body-sm text-white">No notes yet.</p>}
      {posts && posts.length > 0 && (
        <ul className="mt-6 flex flex-col gap-4">
          {posts.map((p) => (
            <li key={p.id} className="border-t border-white/10 pt-4">
              <p className="type-label text-white">{p.author.name ?? "Someone"}</p>
              <p className="mt-1 text-body text-white">{p.body}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
