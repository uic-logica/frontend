import type { ReactNode } from "react";
import { ClubShell, PageContainer, SectionContainer } from "@/components/club/ClubShell";

/** Shared shell for the three legal/utility pages — a paper well for dense
 * reading text, instead of white-on-wallpaper for paragraphs of fine print. */
export function LegalPage({
  title,
  dek,
  updated,
  children,
}: {
  title: string;
  dek?: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <ClubShell>
      <PageContainer>
        <SectionContainer>
          <h1 className="type-h1 text-white">{title}</h1>
          {dek && <p className="mt-3 max-w-2xl text-body-lg text-white/70">{dek}</p>}
          <p className="mt-4 text-caption uppercase tracking-[0.2em] text-white/40">
            Last updated {updated}
          </p>
        </SectionContainer>
        <SectionContainer>
          <div className="max-w-measure rounded-2xl bg-paper p-8 text-ink sm:p-12">{children}</div>
        </SectionContainer>
      </PageContainer>
    </ClubShell>
  );
}

export function LSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-10 first:mt-0">
      <h2 className="text-xl font-bold text-ink">{title}</h2>
      <div className="mt-3 space-y-3 text-body text-ink/80">{children}</div>
    </section>
  );
}

export function LList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="list-disc space-y-2 pl-5">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

/** Native <details>/<summary> accordion — no JS, no library, works with
 * find-in-page and screen readers for free. */
export function Faq({ items }: { items: { q: string; a: ReactNode }[] }) {
  return (
    <div className="divide-y divide-ink/10 border-y border-ink/10">
      {items.map((item) => (
        <details key={item.q} className="group py-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-ink marker:content-none">
            {item.q}
            <span className="shrink-0 text-ink/40 transition-transform group-open:rotate-45" aria-hidden>
              +
            </span>
          </summary>
          <div className="mt-3 text-body text-ink/80">{item.a}</div>
        </details>
      ))}
    </div>
  );
}

export const contactLine = (
  <>
    Questions? Email{" "}
    <a href="mailto:logica@uic.edu" className="font-semibold text-ink underline underline-offset-2">
      logica@uic.edu
    </a>
    .
  </>
);
