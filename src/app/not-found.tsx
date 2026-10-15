import Link from "next/link";
import { ClubShell } from "@/components/club/ClubShell";

export default function NotFound() {
  return (
    <ClubShell>
      <main className="site-page status-page">
        <p className="status-code serif" aria-hidden="true">404</p>
        <h1 className="serif">This page doesn&apos;t exist.</h1>
        <p className="site-muted">The link may be old or mistyped.</p>
        <div className="status-actions">
          <Link href="/" className="site-btn">Back to LOGICA</Link>
          <Link href="/events" className="site-btn secondary">See events</Link>
        </div>
      </main>
    </ClubShell>
  );
}
