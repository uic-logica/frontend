import { siteUrl } from "@/lib/seo";
import { pageMetadata } from "@/lib/seo";

// The root layout's "%s | LOGICA @ UIC" template skips its own segment, so the home page names itself in full.
export const metadata = {
  ...pageMetadata("Latinx Community in Computing", "LOGICA @ UIC is the Latinx computing community at the University of Illinois Chicago (UIC): workshops, mentorship, company visits, and software teams.", "/"),
  title: { absolute: "LOGICA @ UIC | Latinx Community in Computing at UIC" },
};

import Link from "next/link";
import { AnimatedLogo } from "@/components/club/AnimatedLogo";
import type { ReactNode } from "react";
import { ClubShell } from "@/components/club/ClubShell";
import { LogoMarquee, PartnerLogo } from "@/components/club/LogoMarquee";
import { HERO_REVEAL_DURATION, TypewriterLine } from "@/components/club/Typewriter";

const stats = [
  { value: "100+", label: "Members building community and skill across UIC.", short: "members" },
  { value: "20+", label: "Workshops, company visits, and socials hosted each year.", short: "events yearly" },
  { value: "1", label: "Mission: Latinx growth in computing and academics at UIC.", short: "shared mission" },
];

const membersLand = [
  { name: "Google", src: "/sponsors/members/google.svg", height: 40 },
  { name: "JP Morgan", src: "/sponsors/members/jpmorgan.svg", height: 36 },
  { name: "Blue Cross Blue Shield", src: "/sponsors/members/bcbs-icon.png", height: 42 },
  { name: "McDonald's", src: "/sponsors/members/mcdonalds.png", height: 48 },
  { name: "SpotHero", src: "/sponsors/members/spothero.png", height: 40 },
  { name: "PayPal", src: "/sponsors/members/paypal.svg", height: 38 },
  { name: "CACI", src: "/sponsors/members/caci-wordmark.png", height: 44 },
  { name: "DPI", src: "/sponsors/members/dpi-icon.png", height: 40 },
  { name: "Morningstar", src: "/sponsors/members/morningstar.svg", height: 36 },
  { name: "BMO", src: "/sponsors/members/bmo.svg", height: 36 },
  { name: "UIC Technology Solutions", src: "/sponsors/members/uic-tech-solutions.png", height: 48 },
  { name: "Invenergy", src: "/sponsors/members/invenergy.svg", height: 32 },
  { name: "Accenture", src: "/sponsors/members/accenture.svg", height: 38 },
];

const PARTNER_CATEGORIES = [
  {
    key: "company-visits",
    label: "Company Visits",
    partners: [
      { name: "Aon", src: "/sponsors/aon.svg", height: 36 },
      { name: "Microsoft", src: "/sponsors/members/microsoft.svg", height: 36 },
      { name: "Google", src: "/sponsors/members/google.svg", height: 36 },
      { name: "CDW", src: "/sponsors/cdw.svg", height: 36 },
      { name: "84.51°", src: "/sponsors/8451.png", height: 32 },
    ],
  },
  {
    key: "talks",
    label: "Talks",
    note: "Coming soon — Fall '26",
    partners: [],
  },
  {
    key: "workshops",
    label: "Workshops",
    partners: [
      { name: "Blue Cross Blue Shield", src: "/sponsors/members/bcbs-icon.png", height: 52 },
      { name: "Tenacity", src: "/sponsors/tenacity.png", height: 52 },
      { name: "The AI Collective", src: "/sponsors/ai-collective.png", height: 52 },
      // TODO: need logo files for CAHSI and ThinkChicago ("World Think Chicago").
    ],
  },
  {
    key: "partners",
    label: "Partners",
    partners: [
      { name: "Zebra", src: "/sponsors/zebra.svg", height: 48 },
      { name: "Break Through Tech", src: "/sponsors/breakthrough.png", height: 40 },
      { name: "NASA Space Apps Challenge", src: "/sponsors/spaceapps.png", height: 72 },
      { name: "DPI", src: "/sponsors/members/dpi-icon.png", height: 40 },
    ],
  },
] as const;

const icon = (d: ReactNode) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    {d}
  </svg>
);

/** Desktop cards and the phone list share this; `short` is the phone copy (logica.pen V3 mobile). */
const pathways = [
  {
    title: "Development",
    text: "Project teams building this site and the club's tools.",
    short: "Build club projects and practical tools.",
    icon: icon(<path d="m16 18 6-6-6-6M8 6l-6 6 6 6" />),
  },
  {
    title: "Events",
    text: "Socials, hack nights, company visits, and talks.",
    short: "Meet people at talks, visits, and socials.",
    link: "/events",
    icon: icon(<><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>),
  },
  {
    title: "Community",
    text: "Discord, meetups, and Latinx technologists at UIC.",
    short: "Find peers across UIC computing programs.",
    link: "/join",
    icon: icon(<><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>),
  },
];

const arrow = (
  <svg viewBox="0 0 24 24" className="pathway-arrow" fill="currentColor" aria-hidden>
    <path d="M18.25 15.5a.75.75 0 0 1-.75-.75V7.56L7.28 17.78a.749.749 0 0 1-1.275-.326.749.749 0 0 1 .215-.734L16.44 6.5H9.25a.75.75 0 0 1 0-1.5h9a.75.75 0 0 1 .75.75v9a.75.75 0 0 1-.75.75Z" />
  </svg>
);

/** One pathway: a glass card on desktop, a row of the list panel on phones. */
function Pathway({ index, title, text, short, link, icon }: (typeof pathways)[number] & { index: number; link?: string }) {
  const body = (
    <>
      <span className="pathway-index">
        {String(index).padStart(2, "0")}
        {link ? arrow : null}
      </span>
      <span className="pathway-icon">{icon}</span>
      <span className="pathway-copy">
        <span className="pathway-title">{title}</span>
        <span className="pathway-text only-d">{text}</span>
        <span className="pathway-text only-m">{short}</span>
      </span>
    </>
  );
  return <li>{link ? <Link href={link} className="pathway">{body}</Link> : <div className="pathway">{body}</div>}</li>;
}

/** Desktop partners panel: every category, logos in white. */
function Partners() {
  return (
    <section className="home-partners glass only-d" aria-labelledby="partners-title">
      <h2 id="partners-title">Our Partners</h2>
      <p className="home-partners-sub">The organizations that make LOGICA possible</p>
      {PARTNER_CATEGORIES.map((category) => (
        <div key={category.key} className="partner-group">
          <span className="partner-label">{category.label}</span>
          {category.partners.length > 0 ? (
            <div className="partner-logos">
              {category.partners.map((partner) => (
                <PartnerLogo key={partner.name} {...partner} />
              ))}
            </div>
          ) : (
            <p className="partner-note">{"note" in category ? category.note : "Coming soon"}</p>
          )}
        </div>
      ))}
      <div className="partner-ask">
        <p className="partner-ask-q">Interested in partnering with LOGICA?</p>
        <p>Join our community of innovators and tech leaders.</p>
        <Link href="/partner" className="site-button">Become a Partner</Link>
      </div>
    </section>
  );
}

/** Phone partners: one compact panel, a few logos and the ask (logica.pen V3 mobile). */
function PartnersCompact() {
  const few = [PARTNER_CATEGORIES[0].partners[1], PARTNER_CATEGORIES[0].partners[0], PARTNER_CATEGORIES[0].partners[3], PARTNER_CATEGORIES[2].partners[0]];
  return (
    <section className="home-partners-m only-m" aria-labelledby="partners-title-m">
      <h2 id="partners-title-m">Our partners</h2>
      <div className="glass-m">
        <p>Organizations that host visits, workshops, and opportunities for LOGICA members.</p>
        <div className="partner-logos">
          {few.map((partner) => (
            <PartnerLogo key={partner.name} {...partner} height={28} />
          ))}
        </div>
        <p className="partner-ask-m">
          <span>Interested in partnering?</span>
          <Link href="/partner">Get in touch</Link>
        </p>
      </div>
    </section>
  );
}

/** Homepage div structure copied from yalecomputersociety.org */
export default function Home() {
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
          <div className="hero-copy">
            <p className="hero-kicker">We are</p>
            <TypewriterLine />
            <p className="hero-text only-d">
              Increasing the participation and success of students from Latinx and underrepresented
              communities pursuing careers in the field of computing and computer science.
            </p>
            <p className="hero-text only-m">
              A community for Latinx and underrepresented students building careers in computing.
            </p>
          </div>
          <div className="hero-mark">
            <AnimatedLogo duration={HERO_REVEAL_DURATION} />
          </div>
        </section>

        <section className="home-numbers" aria-labelledby="numbers-title">
          <h2 id="numbers-title">By the numbers</h2>
          <div className="home-stats glass">
            {stats.map((s) => (
              <div key={s.value}>
                <span className="stat-value">{s.value}</span>
                <span className="stat-label only-d">{s.label}</span>
                <span className="stat-label only-m">{s.short}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="home-land glass" aria-labelledby="land-title">
          <h2 id="land-title">
            <span className="only-d">Where Our Members Land</span>
            <span className="only-m">Where our members land</span>
          </h2>
          <LogoMarquee items={membersLand} />
        </section>

        <section className="home-pathways" aria-labelledby="pathways-title">
          <h2 id="pathways-title">
            <span className="only-d">Cultivating a passion for computer science, at all skill levels</span>
            <span className="only-m">Built for every skill level</span>
          </h2>
          <p className="home-pathways-intro only-m">Choose a way to participate, then grow from there.</p>
          <ul className="pathways">
            {pathways.map((p, i) => (
              <Pathway key={p.title} index={i + 1} {...p} />
            ))}
          </ul>
        </section>

        <Partners />
        <PartnersCompact />

        <section className="home-join glass" aria-labelledby="join-title">
          <h2 id="join-title">
            <span className="only-d">Ready to join UIC&apos;s Latinx computing community?</span>
            <span className="only-m">Join LOGICA at UIC</span>
          </h2>
          <p>
            <span className="only-d">Open to any UIC student, whatever your major.</span>
            <span className="only-m">Open to every UIC student, regardless of major or experience.</span>
          </p>
          <div className="home-join-actions">
            <Link href="/signup" className="site-button">Join LOGICA</Link>
            <Link href="/events" className="site-button site-button-soft">
              <span className="only-d">Attend an Event</span>
              <span className="only-m">View events</span>
            </Link>
          </div>
        </section>
      </main>
    </ClubShell>
  );
}
