"use client";

import { useRef, useState } from "react";
import { api } from "@/lib/api";

const MAX_BYTES = 5 * 1024 * 1024; // matches backend's cap

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1] ?? "");
    reader.onerror = () => reject(new Error("Could not read file."));
    reader.readAsDataURL(file);
  });
}

/** Shared by /profile and /speaker-portal — same upload logic, caller supplies the theme's classes. */
export function ResumeUpload({
  filename,
  onChange,
  buttonClassName,
  linkClassName,
  textClassName = "text-body-sm",
}: {
  filename: string | null;
  onChange: (filename: string | null) => void;
  buttonClassName: string;
  linkClassName: string;
  textClassName?: string;
}) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > MAX_BYTES) {
      setError("File too large — max 5MB.");
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const data = await fileToBase64(file);
      await api("/api/profile/resume", {
        method: "POST",
        body: JSON.stringify({ filename: file.name, mimeType: file.type || "application/octet-stream", data }),
      });
      onChange(file.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    setError(null);
    try {
      await api("/api/profile/resume", { method: "DELETE" });
      onChange(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      {error && <p className="mb-2 text-caption text-signal">{error}</p>}
      {filename ? (
        <div className="flex flex-wrap items-center gap-3">
          <span className={textClassName}>{filename}</span>
          <button type="button" disabled={busy} onClick={remove} className={linkClassName}>
            {busy ? "Removing…" : "Remove"}
          </button>
        </div>
      ) : (
        <button type="button" disabled={busy} onClick={() => fileInput.current?.click()} className={buttonClassName}>
          {busy ? "Uploading…" : "Upload resume"}
        </button>
      )}
      <input ref={fileInput} type="file" accept=".pdf,.doc,.docx" onChange={upload} hidden />
    </div>
  );
}
