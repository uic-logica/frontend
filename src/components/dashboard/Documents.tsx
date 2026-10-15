"use client";
import { useEffect, useState } from "react";
import { api, peek } from "@/lib/api";
import { Empty, Heading } from "./Overview";
import { Icon } from "./Icon";
import { useUrlState } from "./useUrlState";
import { type Documents as Listing, type DriveFile, date } from "./types";

const FOLDER = "application/vnd.google-apps.folder";

/** `?path=` is the folder stack as JSON; anything malformed means the root. */
function parseTrail(raw: string): { id: string; name: string }[] {
  if (!raw) return [];
  try {
    const value = JSON.parse(raw);
    return Array.isArray(value) ? value.filter((c) => typeof c?.id === "string" && typeof c?.name === "string") : [];
  } catch {
    return [];
  }
}

/**
 * The club's Drive, from inside the dashboard. Everything is already in
 * Drive; the problem was never storage, it was finding the thing.
 *
 * Read-only on purpose — editing happens in Drive, which is better at it.
 */
export function Documents() {
  const [data, setData] = useState<Listing | null>(() => peek<Listing>("/api/board/documents") ?? null);
  const [error, setError] = useState("");
  const [query, setQuery] = useUrlState("q");
  // A stack, so "back" is honest: Drive's API gives children, not a path.
  // Kept in the URL, so the browser's Back goes up a folder and a refresh or
  // a pasted link opens the same folder.
  const [path, setPath] = useUrlState("path");
  const trail = parseTrail(path);
  const setTrail = (next: { id: string; name: string }[], push = false) =>
    setPath(next.length ? JSON.stringify(next) : "", { push });
  // The next folder's tiles aren't cached yet: keep the current ones, dimmed.
  const [stale, setStale] = useState(false);

  const folder = trail.length ? trail[trail.length - 1].id : "";
  const searching = query.trim();

  useEffect(() => {
    let alive = true;
    const params = searching
      ? `?q=${encodeURIComponent(searching)}`
      : folder
        ? `?folder=${encodeURIComponent(folder)}`
        : "";
    // Typing shouldn't fire a Drive call per keystroke.
    const timer = setTimeout(
      () => {
        // Cleared here rather than in the effect body so the old folder's
        // tiles don't linger under a new heading, without a second render
        // pass on every keystroke.
        const hit = peek<Listing>(`/api/board/documents${params}`);
        if (alive) {
          if (hit) setData(hit);
          setStale(!hit);
        }
        api<Listing>(`/api/board/documents${params}`)
          .then((d) => alive && (setData(d), setError(""), setStale(false)))
          .catch((e: Error) => alive && setError(e.message));
      },
      searching ? 350 : 0,
    );
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [folder, searching]);

  return (
    <>
      <Heading
        title="Documents"
        description="One shared index for current files, decisions, and event materials."
      />

      {error && (
        <p className="d-error" role="alert">
          {error}
        </p>
      )}

      {data && !data.configured ? (
        <section className="d-panel d-note-panel">
          <span className="d-note-icon">
            <Icon name="documents" />
          </span>
          <div>
            <h2>Google Drive isn&apos;t connected yet</h2>
            <p>
              Once an exec adds the club&apos;s service account, the shared
              Drive shows up here with real file names, owners and dates.
              Everything else on the board works without it.
            </p>
            <p className="d-footnote">
              Setup is four steps, all on Google&apos;s side, and they&apos;re
              written down in the backend&apos;s <code>.env.example</code>{" "}
              under <code>GOOGLE_SERVICE_ACCOUNT_EMAIL</code>.
            </p>
          </div>
        </section>
      ) : (
        <>
          <section className="d-panel d-directory">
            <div className="d-directory-toolbar">
              <label className="d-search">
                <span className="sr-only">Search the club&apos;s Drive</span>
                <input
                  placeholder="Search every file by name…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
              {!searching && (
                <nav className="d-crumbs" aria-label="Folder">
                  <button className="d-text-button" onClick={() => setTrail([], true)}>
                    LOGICA
                  </button>
                  {trail.map((crumb, i) => (
                    <span key={crumb.id}>
                      {" / "}
                      <button
                        className="d-text-button"
                        onClick={() => setTrail(trail.slice(0, i + 1), true)}
                      >
                        {crumb.name}
                      </button>
                    </span>
                  ))}
                </nav>
              )}
            </div>

            {!data && !error && <p className="d-muted">Loading…</p>}

            {data?.files.length === 0 && (
              <Empty title={searching ? "Nothing matches that" : "This folder is empty"}>
                {searching
                  ? "Try part of the file name instead."
                  : "Add something to it in Drive and it shows up here."}
              </Empty>
            )}

            {!!data?.files.length && (
              <ul className="d-tile-grid" aria-busy={stale} data-stale={stale || undefined}>
                {data.files.map((file) => (
                  <Tile
                    key={file.id}
                    file={file}
                    onOpenFolder={() =>
                      setTrail([...trail, { id: file.id, name: file.name }], true)
                    }
                  />
                ))}
              </ul>
            )}
          </section>
          {searching && data?.configured && (
            <p className="d-footnote">
              Searching the whole shared folder, not just where you are.
            </p>
          )}
        </>
      )}
    </>
  );
}

function Tile({ file, onOpenFolder }: { file: DriveFile; onOpenFolder: () => void }) {
  const isFolder = file.mimeType === FOLDER;
  const owner = file.owners?.[0]?.displayName;
  const meta = [
    isFolder ? "Folder" : kindOf(file.mimeType),
    file.modifiedTime ? date(file.modifiedTime) : null,
    owner,
  ]
    .filter(Boolean)
    .join(" · ");

  const body = (
    <>
      <span className="d-tile-mark" data-folder={isFolder || undefined}>
        <Icon name={isFolder ? "overview" : "documents"} />
      </span>
      <strong>{file.name}</strong>
      <small>{meta}</small>
    </>
  );

  return (
    <li className="d-tile">
      {isFolder ? (
        <button onClick={onOpenFolder}>{body}</button>
      ) : (
        <a href={file.webViewLink ?? "#"} target="_blank" rel="noreferrer noopener">
          {body}
        </a>
      )}
    </li>
  );
}

/** Google's mime types are long and unreadable; these are the ones we see. */
function kindOf(mime: string) {
  if (mime.includes("spreadsheet")) return "Sheet";
  if (mime.includes("presentation")) return "Slides";
  if (mime.includes("document")) return "Doc";
  if (mime.includes("pdf")) return "PDF";
  if (mime.includes("form")) return "Form";
  if (mime.startsWith("image/")) return "Image";
  return "File";
}
