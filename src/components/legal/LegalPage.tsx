import { Children, isValidElement, type ReactNode } from "react";
import { ClubShell } from "@/components/club/ClubShell";
import { LegalToc } from "./LegalToc";

const slug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** Support, Privacy and Terms (logica.pen V4 16–18): header, an "On this page" list, the sections. */
export function LegalPage({
  eyebrow,
  title,
  dek,
  updated,
  numbered = false,
  children,
}: {
  eyebrow: string;
  title: string;
  dek?: string;
  updated: string;
  /** Privacy and Terms number their sections 01, 02, …; Support doesn't. */
  numbered?: boolean;
  children: ReactNode;
}) {
  // The "On this page" list is read straight off the sections, so it can't drift from them.
  const toc = Children.toArray(children).flatMap((child) =>
    isValidElement<{ title?: string }>(child) && child.props.title ? [child.props.title] : [],
  );
  return (
    <ClubShell>
      <main className="site-page legal-page">
        <header className="site-page-head">
          <p className="site-kicker">{eyebrow}</p>
          <h1 className="serif">{title}</h1>
          {dek && <p>{dek}</p>}
          <p className="legal-updated">Last updated {updated}</p>
        </header>
        <div className="legal-columns">
          <nav className="legal-toc" aria-label="On this page">
            <h2>ON THIS PAGE</h2>
            <LegalToc items={toc.map((t) => ({ id: slug(t), title: t }))} />
          </nav>
          <div className={`legal-content${numbered ? " numbered" : ""}`}>{children}</div>
        </div>
      </main>
    </ClubShell>
  );
}

export function LSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section id={slug(title)} className="legal-section">
      <h2><span className="serif">{title}</span></h2>
      {children}
    </section>
  );
}

export function LList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="legal-list">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

/** Native <details>/<summary> accordion: no JS, works with find-in-page and screen readers. */
export function Faq({ items }: { items: { q: string; a: ReactNode }[] }) {
  return (
    <div className="site-faq">
      {items.map((item) => (
        <details key={item.q}>
          <summary>{item.q}</summary>
          <p>{item.a}</p>
        </details>
      ))}
    </div>
  );
}

export const contactLine = (
  <>
    Questions? Email <a href="mailto:logica@uic.edu">logica@uic.edu</a>.
  </>
);
