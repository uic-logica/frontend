import Link from "next/link";
import { AnimatedLogo } from "@/components/club/AnimatedLogo";
import type { ReactNode } from "react";
import { ClubShell, PageContainer, SectionContainer } from "@/components/club/ClubShell";
import { LogoMarquee, PartnerLogo } from "@/components/club/LogoMarquee";
import { HERO_REVEAL_DURATION, TypewriterLine } from "@/components/club/Typewriter";

const stats = [
  {
    value: "100+",
    label: "Members building community and skill across UIC.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    value: "20+",
    label: "Workshops, company visits, and socials hosted each year.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    value: "1",
    label: "Mission: Latinx growth in computing and academics at UIC.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
  },
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
];

const PARTNER_CATEGORIES = [
  {
    key: "company-visits",
    label: "Company Visits",
    partners: [
      { name: "Aon", src: "/sponsors/aon.svg", height: 40 },
      { name: "Microsoft", src: "/sponsors/members/microsoft.svg", height: 40 },
      { name: "Google", src: "/sponsors/members/google.svg", height: 40 },
      { name: "CDW", src: "/sponsors/cdw.svg", height: 40 },
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
    ],
  },
  {
    key: "other",
    label: null,
    partners: [{ name: "DPI", src: "/sponsors/members/dpi-icon.png", height: 40 }],
  },
] as const;

const pathways = [
  {
    index: 1,
    title: "Development",
    text: "Project teams building this site and the club's tools.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
  },
  {
    index: 2,
    title: "Events",
    text: "Socials, hack nights, company visits, and talks.",
    link: "/events",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    index: 3,
    title: "Community",
    text: "Discord, meetups, and Latinx technologists at UIC.",
    link: "/join",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
    ),
  },
];

function LevelCard({
  index,
  title,
  text,
  link,
  icon,
}: {
  index: number;
  title: string;
  text: string;
  link?: string;
  icon?: ReactNode;
}) {
  const card = (
    <div
      className={`club-card group relative flex h-full flex-col bg-white/[0.02] p-6 ${
        link ? "club-card-interactive hover:bg-white/[0.04]" : ""
      }`}
    >
      <div className="mb-4 flex h-5 items-center justify-between">
        <span className="text-xs font-semibold tracking-[0.3em] text-white transition-colors duration-300">
          {String(index).padStart(2, "0")}
        </span>
        {link ? (
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5 text-white/20 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:text-signal"
            fill="currentColor"
            aria-hidden
          >
            <path d="M18.25 15.5a.75.75 0 0 1-.75-.75V7.56L7.28 17.78a.749.749 0 0 1-1.275-.326.749.749 0 0 1 .215-.734L16.44 6.5H9.25a.75.75 0 0 1 0-1.5h9a.75.75 0 0 1 .75.75v9a.75.75 0 0 1-.75.75Z" />
          </svg>
        ) : null}
      </div>
      {icon ? <div className="mb-3 text-white/80">{icon}</div> : null}
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      <span className="mt-3 block h-px w-8 bg-white/15 transition-all duration-300 group-hover:w-12 group-hover:bg-signal" />
      <p className="mt-3 text-body-sm leading-relaxed text-white">{text}</p>
    </div>
  );

  if (!link) return card;
  return (
    <Link href={link} className="block h-full">
      {card}
    </Link>
  );
}

function Partners() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="w-3/4 flex flex-col items-center mx-auto">
        <div className="type-title text-3xl text-white text-center md:text-4xl">Our Partners</div>
        <div className=" text-white lg:text-2xl text-lg mt-5 text-center">
          The organizations that make LOGICA possible
        </div>
      </div>

      <div className="mt-14 space-y-12">
        {PARTNER_CATEGORIES.map((category) => (
          <div key={category.key}>
            {category.label ? (
              <div className="mb-6 flex items-center justify-center gap-4">
                <span className="h-px w-8 bg-white/15 sm:w-12" />
                <span className="text-xs font-medium uppercase tracking-[0.25em] text-white">
                  {category.label}
                </span>
                <span className="h-px w-8 bg-white/15 sm:w-12" />
              </div>
            ) : null}
            {category.partners.length > 0 ? (
              <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
                {category.partners.map((partner) => (
                  <PartnerLogo key={partner.name} {...partner} />
                ))}
              </div>
            ) : (
              <p className="text-center text-sm italic text-white">
                {"note" in category ? category.note : "Coming soon"}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="club-card mx-auto mt-16 flex w-fit max-w-xl flex-col items-center gap-3 bg-white/[0.02] px-8 py-10 text-center">
        <p className="text-lg text-white md:text-xl">Interested in partnering with LOGICA?</p>
        <p className="text-sm text-white">Join our community of innovators and tech leaders.</p>
        <Link
          href="/partner"
          className="mt-3 inline-flex items-center rounded-lg bg-white px-6 py-2.5 text-sm font-semibold text-black transition-transform duration-300 hover:-translate-y-0.5"
        >
          Become a Partner
        </Link>
      </div>
    </section>
  );
}

/** Homepage div structure copied from yalecomputersociety.org */
export default function Home() {
  return (
    <ClubShell>
      <PageContainer>
        <SectionContainer className="grid items-center gap-10 pl-6 sm:pl-10 lg:grid-cols-[minmax(0,1fr)_minmax(240px,340px)] lg:gap-12 lg:pl-16">
          <div className="min-w-0">
            <p className="mb-3 text-xl font-semibold text-signal md:text-3xl">
              We are
            </p>
            <TypewriterLine />
            <div className="mt-10 text-base md:text-lg">
              <p className="max-w-2xl text-white">
                Increasing the participation and success of students from Latinx and underrepresented
                communities pursuing careers in the field of computing and computer science.
              </p>
            </div>
          </div>
          <div className="order-first mx-auto w-full max-w-[240px] text-white sm:max-w-[280px] lg:order-last lg:max-w-[340px]">
            <AnimatedLogo duration={HERO_REVEAL_DURATION} />
          </div>
        </SectionContainer>

        <SectionContainer className="mt-20 pl-6 sm:pl-10 lg:pl-16">
          <h2 className="mb-8 type-title text-3xl text-white md:text-4xl">By the numbers</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((s) => (
              <div key={s.value} className="w-full text-left">
                <div className="mb-3 flex items-center gap-3">
                  <span className="text-white opacity-75">{s.icon}</span>
                  <span className="font-display text-3xl text-white md:text-4xl">{s.value}</span>
                </div>
                <div className="text-lg text-white">{s.label}</div>
              </div>
            ))}
          </div>
        </SectionContainer>

        <SectionContainer>
          <h2 className="mb-10 text-center type-title text-3xl text-white md:text-4xl">
            Where Our Members Land
          </h2>
          <LogoMarquee items={membersLand} />
        </SectionContainer>

        <SectionContainer>
          <div className="w-3/4 flex flex-col items-center mx-auto">
            <div className="type-title text-3xl text-white text-center md:text-4xl">
              Cultivating a passion for computer science, at all skill levels
            </div>
            <div className=" text-white lg:text-2xl text-lg mt-5 text-center" />
          </div>
          {/* Three cards, so no `sm:grid-cols-2` step — it would leave one
              card orphaned on its own row, which is the raggedness dropping
              Mentorship was supposed to fix. One column, then three. */}
          <div className="mx-auto mt-10 grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-3">
            {pathways.map((p) => (
              <LevelCard key={p.index} {...p} />
            ))}
          </div>
        </SectionContainer>

        <SectionContainer>
          <Partners />
        </SectionContainer>

        <SectionContainer>
          <div className="club-card mx-auto max-w-3xl bg-white/[0.02] px-8 py-14 md:px-16 md:py-20">
            <div className="flex flex-col items-center text-center">
              <h2 className="type-title text-3xl leading-tight text-white md:text-4xl">
                Ready to join UIC&apos;s Latinx computing community?
              </h2>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-white">
                Open to any UIC student, whatever your major.
              </p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center rounded-lg bg-white px-8 py-3 text-lg font-semibold text-black transition-transform duration-300 hover:-translate-y-0.5"
                >
                  Join LOGICA
                </Link>
                <Link
                  href="/events"
                  className="inline-flex items-center justify-center rounded-lg px-8 py-3 text-lg font-semibold text-white ring-1 ring-white/15 transition-colors duration-300 hover:bg-white/5 hover:ring-white/25"
                >
                  Attend an Event
                </Link>
              </div>
            </div>
          </div>
        </SectionContainer>
      </PageContainer>
    </ClubShell>
  );
}
