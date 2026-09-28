"use client";

import Link from "next/link";
import { use, useEffect, useRef, useState } from "react";
import { ClubShell, PageContainer, SectionContainer } from "@/components/club/ClubShell";
import { darkButtonClass, darkInputClass } from "@/components/ui/darkForm";
import { ApiError, api } from "@/lib/api";

type Event = { id: string; title: string; description: string | null; location: string | null; startsAt: string; link: string | null };
type Material = { id: string; filename: string; mimeType: string; visibility: "PUBLIC" | "INTERNAL"; createdAt: string };
type Profile = { role: string };

/** Public event details, with board-only material management. */
export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [event, setEvent] = useState<Event | null>(null);
  const [eventError, setEventError] = useState<"missing" | "failed" | null>(null);
  const [isBoard, setIsBoard] = useState(false);

  useEffect(() => {
    api<Event>(`/api/events/${id}`)
      .then(setEvent)
      // A bad or stale URL is permanent; telling someone to "try again later"
      // sends them back to the same 404 forever.
      .catch((e: unknown) =>
        setEventError(e instanceof ApiError && e.status === 404 ? "missing" : "failed"),
      );
  }, [id]);

  useEffect(() => {
    api<Profile>("/api/profile")
      .then((p) => setIsBoard(p.role === "BOARD" || p.role === "EXEC_BOARD"))
      .catch(() => undefined);
  }, []);

  return (
    <ClubShell>
      <PageContainer>
        <SectionContainer>
          <div className="mx-auto max-w-md">
            {event ? (
              <>
                <h1 className="type-title text-3xl md:text-4xl text-white">{event.title}</h1>
                <p className="mt-3 text-body-lg text-white">
                  {new Date(event.startsAt).toLocaleString()}
                  {event.location ? ` · ${event.location}` : ""}
                </p>
                {event.description && <p className="mt-4 text-body text-white">{event.description}</p>}
                {event.link && (
                  <a
                    href={event.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-block font-bold text-signal hover:underline"
                  >
                    Event page ↗
                  </a>
                )}
              </>
            ) : eventError ? (
              <>
                <h1 className="type-title text-3xl md:text-4xl text-white">
                  {eventError === "missing" ? "Event not found" : "Event details"}
                </h1>
                <p className="mt-3 text-body text-white">
                  {eventError === "missing" ? (
                    <>
                      That event doesn&apos;t exist, or it&apos;s been taken down.{" "}
                      <Link href="/events" className="font-bold text-signal hover:underline">
                        See what&apos;s coming up
                      </Link>
                      .
                    </>
                  ) : (
                    "Event details are not available right now. Please try again later."
                  )}
                </p>
              </>
            ) : (
              <p className="text-body-sm text-white">Loading…</p>
            )}
          </div>
        </SectionContainer>

        {isBoard && (
          <SectionContainer>
            <div className="mx-auto max-w-md">
              <MaterialsPanel eventId={id} />
            </div>
          </SectionContainer>
        )}
      </PageContainer>
    </ClubShell>
  );
}

function MaterialsPanel({ eventId }: { eventId: string }) {
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
              <span className="text-caption text-white">{m.visibility}</span>
            </li>
          ))}
        </ul>
      )}

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
    </div>
  );
}
