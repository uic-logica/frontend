import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("About LOGICA", "Learn about LOGICA, the Latinx Organization for Growth in Computing and Academics at UIC, and our community, mission, and activities.", "/about");

import Link from "next/link";
import { ClubShell } from "@/components/club/ClubShell";

const svg = (d: React.ReactNode) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>{d}</svg>
);

/** `short` is the phone copy from logica.pen V3 "02 · About" (mobile), shown as icon rows. */
const whatWeDo = [
  {
    title: "What we do",
    shortTitle: "Industry access",
    body: "Bring in speakers, run company visits, and pass on the openings that reach us. Last year that meant LeetCode and Hot Wings, and a visit to CME.",
    short: "Speakers, company visits, and opportunities shared directly with members.",
    icon: svg(<><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3" /></>),
  },
  {
    title: "Who shows up",
    shortTitle: "Open community",
    body: "Members come from CS, data science, computer engineering, and plenty of majors that aren't any of those. If you're interested in tech, you're a part of the community.",
    short: "Students from every major and experience level are welcome.",
    icon: svg(<><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>),
  },
];

const values = [
  {
    title: "Diversity",
    body: "The org was founded for Latinx and underrepresented students, and has never been limited to them. Anyone interested in tech is welcome.",
    short: "Built for underrepresented students, open to everyone.",
  },
  {
    title: "Growth and Development",
    shortTitle: "Growth",
    body: "Technical, leadership, and professional skills, picked up from each other as much as from anyone we bring in.",
    short: "Technical, professional, and leadership skills shared peer to peer.",
  },
  {
    title: "Community",
    body: "A family of students who pass along their learned mistakes and successes, and help each other through the rest.",
    short: "Students passing along lessons, opportunities, and support.",
  },
];

const timeline = [
  { label: "Started", body: "LOGICA formed at UIC as a space for Latinx students in computing." },
  { label: "Since", body: "Speakers, company visits, and events run with WiCyS, SHPE, ACM and LUG." },
  { label: "Now", body: "We're building this site, the org's first project." },
];

/** Layout is logica.pen V3 "02 · About" (desktop and mobile); the timeline panel is ours. */
export default function AboutPage() {
  return (
    <ClubShell>
      <main className="site-page">
        <header className="page-head">
          <h1>About LOGICA</h1>
          <p className="page-kicker">Latinx Organization for Growth in Computing and Academics</p>
          <p className="only-d">
            We&apos;re a student org at UIC, working to increase the participation and success of students
            from Latinx and underrepresented communities pursuing careers in computing.
          </p>
          <p className="only-m">
            We increase participation and success for Latinx and underrepresented students pursuing
            computing careers at UIC.
          </p>
        </header>

        <section className="page-section" aria-labelledby="what-we-do">
          <h2 id="what-we-do" className="only-m">What we do</h2>
          <div className="page-grid page-grid-2">
            {whatWeDo.map((item) => (
              <article key={item.title} className="page-card page-row glass">
                <span className="row-icon">{item.icon}</span>
                <div>
                  <h3>
                    <span className="only-d">{item.title}</span>
                    <span className="only-m">{item.shortTitle}</span>
                  </h3>
                  <p className="only-d">{item.body}</p>
                  <p className="only-m">{item.short}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="page-section about-values" aria-labelledby="values">
          <h2 id="values">
            <span className="only-d">Our Core Values</span>
            <span className="only-m">Our core values</span>
          </h2>
          <ul className="page-grid page-grid-3 page-list">
            {values.map((v) => (
              <li key={v.title} className="page-card glass">
                <h3>
                  <span className="only-d">{v.title}</span>
                  <span className="only-m">{v.shortTitle ?? v.title}</span>
                </h3>
                <p className="only-d">{v.body}</p>
                <p className="only-m">{v.short}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="about-panel glass" aria-labelledby="timeline">
          <h2 id="timeline">Timeline</h2>
          <ol>
            {timeline.map((t) => (
              <li key={t.label}>
                <span>{t.label}</span>
                <p>{t.body}</p>
              </li>
            ))}
          </ol>
          <h2>Meet Our Team</h2>
          <p>The students who make LOGICA possible — board and builders.</p>
          <Link href="/team" className="page-link">See the team →</Link>
        </section>
      </main>
    </ClubShell>
  );
}
