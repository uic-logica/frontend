import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("Join LOGICA", "Join LOGICA at UIC for computing workshops, mentorship, company visits, and community. All majors and experience levels are welcome.", "/join");

import Link from "next/link";
import { ClubShell } from "@/components/club/ClubShell";
import { SiteIcon, type SiteIconName } from "@/components/site/icons";
import { JoinForm } from "./JoinForm";

const roles: { title: string; body: string; note: string; icon: SiteIconName }[] = [
  {
    title: "Software Engineer",
    body: "Build open-source products that help students get hired, on a team with check-ins every two days.",
    note: "Needs a @uic.edu account",
    icon: "code",
  },
  {
    title: "Board Member",
    body: "Help run LOGICA through events, outreach, finances, and day-to-day executive board work.",
    note: "Applications open each semester",
    icon: "briefcase",
  },
];

const steps = [
  { title: "Written application", body: "Share a bit about yourself, what you're interested in, and why LOGICA." },
  { title: "Interview or challenge", body: "For development tracks: a short product challenge and a chat with leads." },
  { title: "Team placement", body: "Based on your application, you're placed as space permits." },
];

const faqs = [
  { q: "Do I need prior experience?", a: "No. Both tracks are open to students without prior experience. Enthusiasm and willingness to learn matter most." },
  { q: "Do I need to be a CS major?", a: "No. We welcome students from all majors who care about computing and community." },
  { q: "What is the time commitment?", a: "Varies by role. Product teams typically meet a few hours a week plus individual work." },
  { q: "When will I hear back?", a: "We aim to review within a few weeks of each cycle. You'll hear by email." },
];

/** Layout is logica.pen V4 "07 Join", plus the application form the design leaves out. */
export default function JoinPage() {
  return (
    <ClubShell>
      <main className="site-page">
        <header className="site-page-head">
          <p className="site-kicker">JOIN LOGICA</p>
          <h1 className="serif">Find your place in UIC&apos;s Latinx computing community.</h1>
          <p>Free, all majors, any experience. Come to an event, or apply to build with us.</p>
        </header>
        <div className="join-actions">
          <Link href="/signup" className="site-btn">Create your account</Link>
          <Link href="/events" className="site-btn secondary">Attend an event first</Link>
        </div>

        <section className="site-section join-first" aria-labelledby="roles">
          <div className="site-head">
            <div>
              <h2 id="roles" className="serif">Available roles</h2>
              <p className="site-head-sub">Optional. Membership itself is just signing up.</p>
            </div>
          </div>
          <ul className="site-features two">
            {roles.map((r) => (
              <li key={r.title} className="site-card">
                <span className="site-feature-icon"><SiteIcon name={r.icon} size={20} /></span>
                <h3>{r.title}</h3>
                <p>{r.body}</p>
                <small className="site-hint">{r.note}</small>
                <a href="#apply" className="site-link">Apply <SiteIcon name="arrow" /></a>
              </li>
            ))}
          </ul>
        </section>

        <section className="site-section" aria-labelledby="process">
          <div className="site-head"><h2 id="process" className="serif">Application process</h2></div>
          <ol className="join-steps">
            {steps.map((s, i) => (
              <li key={s.title}>
                <span className="join-step-top"><span aria-hidden="true">{i + 1}</span></span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="site-section" aria-labelledby="faq">
          <div className="site-head"><h2 id="faq" className="serif">Frequently asked questions</h2></div>
          <div className="site-faq">
            {faqs.map((f, i) => (
              <details key={f.q} open={i === 0}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section id="apply" className="site-section join-apply" aria-label="Apply">
          <JoinForm />
        </section>
      </main>
    </ClubShell>
  );
}
