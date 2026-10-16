"use client";

import { useRef, useState } from "react";
import { type ReceiptGuess, parseReceipt } from "@/lib/receipt";

export type ScannedReceipt = ReceiptGuess & { url: string | null; text: string };

/** Phone photos are 3-5 MB; a 1600px JPEG reads just as well and fits the upload limit. */
async function shrink(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b ?? file), "image/jpeg", 0.85));
}

/** Read the text on a receipt photo in the browser (Tesseract, self-hosted under /tesseract). */
async function readText(image: Blob): Promise<string> {
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("eng", 1, {
    workerPath: "/tesseract/worker.min.js",
    corePath: "/tesseract",
    langPath: "/tesseract",
    // Load the worker from our own origin, not a blob, so the site's CSP allows it.
    workerBlobURL: false,
  });
  try {
    const { data } = await worker.recognize(image);
    return data.text;
  } finally {
    await worker.terminate();
  }
}

/**
 * "Scan a receipt" for the Money form: take or pick a photo (or a PDF), read
 * it here in the browser, save it to the club Drive, and hand back what it
 * found so the form fills in. Everything it fills stays editable.
 */
export function ReceiptScan({ onScanned }: { onScanned: (receipt: ScannedReceipt) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<"" | "reading" | "saving">("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [text, setText] = useState("");

  async function scan(file: File) {
    setError("");
    setNote("");
    setText("");
    const isImage = file.type.startsWith("image/");
    let upload: Blob = file;
    let read = "";
    try {
      if (isImage) {
        setStep("reading");
        upload = await shrink(file);
        read = await readText(upload);
        setText(read);
      }
      setStep("saving");
      const form = new FormData();
      form.set("file", upload, isImage ? file.name.replace(/\.[^.]+$/, ".jpg") : file.name);
      const res = await fetch("/api/board/receipts", { method: "POST", body: form });
      const body = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      const guess = parseReceipt(read);
      onScanned({ ...guess, url: res.ok ? (body.url ?? null) : null, text: read });
      const found = [guess.vendor && "store", guess.total != null && "total", guess.date && "date"].filter(Boolean);
      setNote(
        `${isImage ? (found.length ? `Read the ${found.join(", ")}. Check them below.` : "Couldn't read much from that photo; fill in the details below.") : "PDFs aren't read automatically; fill in the details below."} ${res.ok ? "Saved to Drive under Receipts." : `Not saved to Drive: ${body.error ?? "try again"}`}`,
      );
    } catch (e) {
      setError(`Couldn't read that receipt (${(e as Error).message}). You can still fill the form in by hand.`);
    } finally {
      setStep("");
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div className="d-receipt-scan">
      <label className="d-button secondary">
        {step === "reading" ? "Reading the receipt…" : step === "saving" ? "Saving to Drive…" : "Scan a receipt"}
        <input
          ref={input}
          type="file"
          accept="image/*,application/pdf"
          capture="environment"
          className="d-sr"
          disabled={!!step}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void scan(file);
          }}
        />
      </label>
      <small className="d-muted">Take a photo or pick one. It&apos;s read here in your browser and saved to the club Drive.</small>
      {note && <p className="d-success" role="status">{note}</p>}
      {error && <p className="d-error" role="alert">{error}</p>}
      {text && (
        <details>
          <summary>What it read</summary>
          <pre>{text}</pre>
        </details>
      )}
    </div>
  );
}
