import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("About LOGICA", "Learn about LOGICA, the Latinx Organization for Growth in Computing and Academics at UIC, and our community, mission, and activities.", "/about");

import Link from "next/link";
import { ClubShell } from "@/components/club/ClubShell";
import { SiteIcon, type SiteIconName } from "@/components/site/icons";
import { StarDivider } from "@/components/site/StarDivider";

const whatWeDo: { title: string; body: string; icon: SiteIconName }[] = [
  {
    title: "Industry access",
    body: "Bring in speakers, run company visits, and pass on the openings that reach us. Last year that meant LeetCode and Hot Wings, and a visit to CME.",
    icon: "mic",
  },
  {
    title: "Open community",
    body: "Members come from CS, data science, computer engineering, and plenty of majors that aren't any of those. If you're interested in tech, you're a part of the community.",
    icon: "users",
  },
];

const values = [
  { title: "Diversity", body: "Founded for Latinx and underrepresented students, never limited to them. Anyone interested in tech is welcome." },
  { title: "Growth and development", body: "Technical, leadership, and professional skills, picked up from each other as much as from anyone we bring in." },
  { title: "Community", body: "Students passing along lessons, opportunities, and support." },
];

const timeline = [
  { label: "Started", body: "LOGICA formed at UIC as a space for Latinx students in computing." },
  { label: "Since", body: "Speakers, company visits, and events run with WiCyS, SHPE, ACM and LUG." },
  { label: "Now", body: "We're building this site. It's the org's first project." },
];

/** Layout is logica.pen V4 "02 About". */
export default function AboutPage() {
  return (
    <ClubShell>
      <main className="site-page">
        <header className="site-page-head">
          <p className="site-kicker">LATINX ORGANIZATION FOR GROWTH IN COMPUTING AND ACADEMICS</p>
          <h1 className="serif">About LOGICA</h1>
          <p>A family of students who pass along their mistakes and successes, and help each other through the rest.</p>
        </header>

        <section className="site-section" aria-labelledby="what-we-do">
          <div className="site-head"><h2 id="what-we-do" className="serif">What we do</h2></div>
          <ul className="site-features two">
            {whatWeDo.map((item) => (
              <li key={item.title} className="site-card">
                <span className="site-feature-icon"><SiteIcon name={item.icon} size={20} /></span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <StarDivider className="about-stars" />

        <section className="site-section about-values-section" aria-labelledby="values">
          <div className="site-head"><h2 id="values" className="serif">Our core values</h2></div>
          <ol className="about-values">
            {values.map((v, i) => (
              <li key={v.title}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                <h3 className="serif">{v.title}</h3>
                <p>{v.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="site-section" aria-labelledby="timeline">
          <div className="site-head"><h2 id="timeline" className="serif">Timeline</h2></div>
          <ol className="about-timeline">
            {timeline.map((t, i) => (
              <li key={t.label} data-now={i === timeline.length - 1 || undefined}>
                <span>{t.label}</span>
                <p>{t.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="site-section site-cta">
          <h2 className="serif">Meet our team</h2>
          <Link href="/team" className="site-btn secondary">See the team</Link>
        </section>
      </main>
    </ClubShell>
  );
}
