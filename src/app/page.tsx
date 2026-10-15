import Link from "next/link";
import { siteUrl, pageMetadata } from "@/lib/seo";
import { getEvents, eventDate, type ClubEvent } from "@/lib/events";
import { ClubShell, Logo } from "@/components/club/ClubShell";
import { LogoMarquee, LogoTile, type MarqueeLogo } from "@/components/club/LogoMarquee";
import { Painting } from "@/components/site/Painting";
import { StarDivider } from "@/components/site/StarDivider";
import { projects } from "@/lib/projects";
import { SiteIcon, type SiteIconName } from "@/components/site/icons";

// The root layout's "%s | LOGICA @ UIC" template skips its own segment, so the home page names itself in full.
export const metadata = {
  ...pageMetadata("Latinx Community in Computing", "LOGICA @ UIC is the Latinx computing community at the University of Illinois Chicago (UIC): workshops, mentorship, company visits, and software teams.", "/"),
  title: { absolute: "LOGICA @ UIC | Latinx Community in Computing at UIC" },
};

const logo = (name: string, file: string, width: number, height: number): MarqueeLogo => ({ name, src: `/logos/${file.includes(".") ? file : `${file}.png`}`, width, height });

const membersLand = [
  logo("Google", "google", 899, 297),
  logo("JP Morgan", "jpmorgan", 884, 180),
  logo("Blue Cross Blue Shield", "bcbs", 1554, 797),
  logo("McDonald's", "mcdonalds", 2853, 1945),
  logo("SpotHero", "spothero", 350, 220),
  logo("PayPal", "paypal", 412, 101),
  logo("CACI", "caci-wordmark", 1197, 426),
  logo("DPI", "dpi", 840, 312),
  logo("Morningstar", "morningstar", 900, 189),
  logo("BMO", "bmo", 479, 167),
  logo("UIC Technology Solutions", "uic-tech-solutions", 194, 123),
  logo("Invenergy", "invenergy.svg", 154, 32),
  logo("Accenture", "accenture.svg", 204, 56),
];

const partnerGroups: { label: string; logos: MarqueeLogo[] }[] = [
  {
    label: "Company visits",
    logos: [logo("Aon", "aon", 798, 304), logo("Microsoft", "microsoft", 1000, 214), logo("Google", "google", 899, 297), logo("CDW", "cdw", 1000, 537), logo("84.51°", "8451", 600, 218)],
  },
  // Talks have no partner yet: the row says so instead of showing an empty strip.
  { label: "Talks", logos: [] },
  {
    label: "Workshops",
    // TODO: logo files for CAHSI and ThinkChicago ("World Think Chicago").
    logos: [logo("Blue Cross Blue Shield", "bcbs", 1554, 797), logo("Tenacity", "tenacity", 138, 113), logo("The AI Collective", "ai-collective", 587, 284)],
  },
  {
    label: "Partners",
    logos: [logo("Zebra", "zebra.svg", 378, 126), logo("Break Through Tech", "breakthrough", 422, 234), logo("NASA Space Apps Challenge", "spaceapps", 1050, 1056), logo("DPI", "dpi", 840, 312)],
  },
];

const benefits: { title: string; text: string; icon: SiteIconName; link: { href: string; label: string } }[] = [
  { title: "Get hired", text: "Company visits, resume clinics, and intros to the recruiters who come to us.", icon: "briefcase", link: { href: "/events", label: "See events" } },
  { title: "Learn by building", text: "Workshops, hack nights, and project teams that ship real tools, like this site.", icon: "code", link: { href: "/join", label: "Join a team" } },
  { title: "Find your people", text: "Socials, Discord, and upperclassmen who'll answer the questions you won't ask in class.", icon: "users", link: { href: "/signup", label: "Join LOGICA" } },
];

function EventCard({ event }: { event: ClubEvent }) {
  const d = eventDate(event.startsAt);
  return (
    <li className="site-card home-event">
      <span className="site-date"><b>{d.month}</b><span>{d.day}</span></span>
      <h3><Link href={`/events/${event.id}`}>{event.title}</Link></h3>
      <div className="home-event-foot">
        <span>{[event.location, d.time].filter(Boolean).join(" · ")}</span>
        {event.link ? (
          <a className="site-link" href={event.link} target="_blank" rel="noopener noreferrer">RSVP <SiteIcon name="arrow" /></a>
        ) : (
          <Link className="site-link" href={`/events/${event.id}`}>Details <SiteIcon name="arrow" /></Link>
        )}
      </div>
    </li>
  );
}

export default async function Home() {
  const { upcoming, error } = await getEvents();
  const next = upcoming[0];

  return (
    <ClubShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              // WebSite is what Google reads for the site name shown in results.
              "@type": "WebSite",
              name: "LOGICA @ UIC",
              alternateName: ["LOGICA UIC", "UIC LOGICA", "LOGICA"],
              url: siteUrl.href,
            },
            {
              "@type": "Organization",
              name: "LOGICA @ UIC",
              alternateName: ["LOGICA UIC", "UIC LOGICA", "LOGICA", "Latinx Organization for Growth in Computing and Academics"],
              description: "A student organization at the University of Illinois Chicago (UIC) supporting Latinx and underrepresented students in computing.",
              email: "logica@uic.edu",
              url: siteUrl.href,
              logo: new URL("/icon.png", siteUrl).href,
              parentOrganization: { "@type": "CollegeOrUniversity", name: "University of Illinois Chicago", url: "https://www.uic.edu/" },
              sameAs: ["https://github.com/uic-logica"],
            },
          ],
        }).replace(/</g, "\\u003c") }}
      />
      <main className="home">
        <section className="home-hero">
          <Painting name="hero" sizes="100vw" className="home-hero-art" high />
          <div className="home-hero-copy site-wrap">
            <div className="home-hero-brand">
              <Logo size={56} priority />
              <span>LOGICA @ UIC</span>
            </div>
            <h1 className="serif">The Latinx computing community at UIC.</h1>
            <div className="home-hero-actions">
              <Link href="/signup" className="site-btn">Join LOGICA</Link>
              <Link href="/events" className="site-btn secondary">See upcoming events <SiteIcon name="arrow" /></Link>
            </div>
            {next && (
              <Link href={`/events/${next.id}`} className="home-next">
                <span className="site-date"><b>{eventDate(next.startsAt).month}</b><span>{eventDate(next.startsAt).day}</span></span>
                <span className="home-next-text">
                  <small>Next up · {eventDate(next.startsAt).weekdayTime}</small>
                  <strong>{next.title}</strong>
                </span>
                <SiteIcon name="arrow" />
              </Link>
            )}
          </div>
          <a href="#coming-up" className="home-peek"><SiteIcon name="chevronDown" /> Coming up this month</a>
        </section>

        <section id="coming-up" className="site-wrap home-block" aria-labelledby="coming-up-title">
          <div className="site-head">
            <h2 id="coming-up-title" className="serif">Coming up</h2>
            <Link href="/events" className="site-link">All events <SiteIcon name="arrow" /></Link>
          </div>
          {upcoming.length > 0 ? (
            <ul className="home-events">
              {upcoming.slice(0, 3).map((event) => <EventCard key={event.id} event={event} />)}
            </ul>
          ) : (
            <p className="site-empty">{error ?? "No upcoming events scheduled"}</p>
          )}
        </section>

        <StarDivider className="home-stars" />

        <section className="site-wrap home-block" aria-labelledby="people-title">
          <div className="site-head">
            <h2 id="people-title" className="serif">People, not just programs</h2>
          </div>
          {/* TODO(real content): the design pairs a 2x2 grid with a member quote card. The quote is mock, so the grid spans the full width until a member gives a real one. */}
          <div className="home-people">
            {[1, 2, 3, 4].map((n) => <Painting key={n} name={`people-${n}`} sizes="(max-width: 799px) 50vw, 550px" className="home-people-art" />)}
          </div>
          <div className="home-land">
            <h3 className="site-kicker">Where our members land</h3>
            <LogoMarquee items={membersLand} />
          </div>
        </section>

        <section className="site-wrap home-block" aria-labelledby="get-title">
          <div className="site-head">
            <h2 id="get-title" className="serif">What you get</h2>
          </div>
          <ul className="site-features">
            {benefits.map((b) => (
              <li key={b.title} className="site-card">
                <span className="site-feature-icon"><SiteIcon name={b.icon} size={20} /></span>
                <h3>{b.title}</h3>
                <p>{b.text}</p>
                <Link href={b.link.href} className="site-link">{b.link.label} <SiteIcon name="arrow" /></Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="site-wrap home-block" aria-labelledby="building-title">
          <div className="site-head">
            <h2 id="building-title" className="serif">What we&apos;re building</h2>
            <Link href="/projects" className="site-link">All projects <SiteIcon name="arrow" /></Link>
          </div>
          <ul className="home-building">
            {projects.filter((p) => p.slug !== "site").map((p) => (
              <li key={p.slug}>
                <Link href={`/projects#${p.slug}`}>
                  <strong>{p.name}</strong>
                  <span>{p.status === "Main focus" ? `Demo ${p.demo}` : p.status}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <StarDivider className="home-stars" />

        <section className="site-wrap home-block" aria-labelledby="join-title">
          <div className="home-join">
            <h2 id="join-title" className="serif">Ready to join UIC&apos;s Latinx computing community?</h2>
            <p>Free, open to every UIC student, whatever your major or experience.</p>
            <div className="home-hero-actions">
              <Link href="/signup" className="site-btn">Join LOGICA</Link>
              <Link href="/events" className="site-btn secondary">Attend an event first</Link>
            </div>
          </div>
        </section>

        <section className="site-wrap home-partners" aria-labelledby="partners-title">
          <div className="home-partners-head">
            <h2 id="partners-title" className="site-kicker">Supported by</h2>
            <Link href="/partner" className="site-link">Partner with us <SiteIcon name="arrow" /></Link>
          </div>
          <dl>
            {partnerGroups.map((group) => (
              <div key={group.label} className="home-partner-row">
                <dt>{group.label}</dt>
                <dd>
                  {group.logos.length > 0 ? group.logos.map((l) => <LogoTile key={l.name} {...l} />) : <span className="site-muted">Coming soon</span>}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      </main>
    </ClubShell>
  );
}
