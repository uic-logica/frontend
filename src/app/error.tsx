"use client"; // error boundaries must be client components

import Link from "next/link";
import { useEffect } from "react";
import { ClubShell } from "@/components/club/ClubShell";

export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => console.error(error), [error]);
  return (
    <ClubShell>
      <main className="site-page status-page" role="alert">
        <h1 className="serif">Something went wrong.</h1>
        <p className="site-muted">Try again, or head back home. If it keeps happening, email logica@uic.edu.</p>
        <div className="status-actions">
          <button type="button" onClick={() => retry()} className="site-btn">Try again</button>
          <Link href="/" className="site-btn secondary">Back to LOGICA</Link>
        </div>
      </main>
    </ClubShell>
  );
}
