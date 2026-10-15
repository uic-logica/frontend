import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("Join LOGICA", "Join LOGICA at UIC for computing workshops, mentorship, company visits, and community. All majors and experience levels are welcome.", "/join");

import Link from "next/link";
import { ClubShell } from "@/components/club/ClubShell";
import { JoinForm } from "./JoinForm";

// `short` / `shortTitle` are the phone copy (logica.pen V3 "06 · Join" mobile).
const roles = [
  {
    title: "Software Engineer",
    body: "Build open-source products that help students get hired, on a team with check-ins every two days. Needs a @uic.edu account.",
    short: "Build club products with a collaborative team.",
  },
  {
    title: "Board Member",
    body: "Help run LOGICA through events, outreach, finances, and day-to-day executive board work.",
    short: "Help run events, outreach, and finances.",
  },
];

const steps = [
  {
    title: "Written Application",
    body: "Share a bit about yourself, what you're interested in, and why LOGICA.",
    shortTitle: "Submit application",
    short: "Tell us what interests you.",
  },
  {
    title: "Interview / Challenge",
    body: "For development tracks: a short product challenge and a chat with leads about how you think.",
    shortTitle: "Short conversation",
    short: "Meet the team and ask questions.",
  },
  {
    title: "Team Placement",
    body: "Based on your application (and interview when required), you're placed as space permits.",
    shortTitle: "Team placement",
    short: "Choose a track and start building.",
  },
];

const faqs = [
  {
    q: "Do I need prior experience?",
    a: "No. Both tracks are open to students without prior experience. Enthusiasm and willingness to learn matter most.",
    shortQ: "Do I need experience?",
    short: "No. Curiosity and consistency matter more.",
  },
  {
    q: "Do I need to be a CS major?",
    a: "No. We welcome students from all majors who care about computing and community.",
    short: "No. Students from every major are welcome.",
  },
  {
    q: "What is the time commitment?",
    a: "Varies by role. Product teams typically meet a few hours a week plus individual work.",
    short: "Most members spend a few hours each week.",
  },
  {
    q: "When will I hear back?",
    a: "We aim to review within a few weeks of each cycle. You'll hear by email.",
    short: "We respond after each application cycle, by email.",
  },
];

/** Layout is logica.pen V3 "06 · Join" (desktop and mobile), plus the application form the design leaves out. */
export default function JoinPage() {
  return (
    <ClubShell>
      <main className="site-page join-page">
        <header className="page-head">
          <h1>Join LOGICA</h1>
          <p>
            <span className="only-d">We are UIC&apos;s collective of Latinx developers, designers, and computing enthusiasts.</span>
            <span className="only-m">Find your place in UIC&apos;s Latinx computing community.</span>
          </p>
        </header>

        <section className="page-section" aria-labelledby="roles">
          <h2 id="roles">
            <span className="only-d">Available Roles</span>
            <span className="only-m">Available roles</span>
          </h2>
          <div className="page-grid page-grid-2">
            {roles.map((r) => (
              <article key={r.title} className="page-card glass">
                <h3>{r.title}</h3>
                <p className="only-d">{r.body}</p>
                <p className="only-m">{r.short}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="page-section" aria-labelledby="process">
          <h2 id="process">
            <span className="only-d">Application Process</span>
            <span className="only-m">Application process</span>
          </h2>
          <ol className="page-grid page-grid-3 page-list join-steps">
            {steps.map((s, i) => (
              <li key={s.title} className="page-card glass">
                <span className="join-step-number" aria-hidden>{i + 1}</span>
                <div>
                  <h3>
                    <span className="only-d">{s.title}</span>
                    <span className="only-m">{s.shortTitle}</span>
                  </h3>
                  <p className="only-d">{s.body}</p>
                  <p className="only-m">{s.short}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="page-section" aria-labelledby="faq">
          <h2 id="faq">
            <span className="only-d">Frequently Asked Questions</span>
            <span className="only-m">Frequently asked questions</span>
          </h2>
          <div className="page-grid page-grid-2 page-list">
            {faqs.map((f) => (
              <div key={f.q} className="page-card glass">
                <h3>
                  <span className="only-d">{f.q}</span>
                  <span className="only-m">{f.shortQ ?? f.q}</span>
                </h3>
                <p className="only-d">{f.a}</p>
                <p className="only-m">{f.short}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="join-apply" aria-label="Apply">
          <JoinForm />
          <Link href="/events" className="page-link">Or attend an event first →</Link>
        </section>
      </main>
    </ClubShell>
  );
}
