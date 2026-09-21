import Link from "next/link";
import { ClubShell, PageContainer, SectionContainer } from "@/components/club/ClubShell";
import { buttonClasses } from "@/components/ui/ButtonLink";

const roles = [
  {
    title: "General Member",
    body: "Attend workshops, socials, and talks; contribute to projects and the blog. Open to all UIC students.",
  },
  {
    title: "Software Engineer",
    body: "Develop LOGICA products with a team on a weekly cadence — startup-like pace, campus impact.",
  },
  {
    title: "Mentorship track",
    body: "Beginner-friendly pathway to level up and eventually join a product team.",
  },
];

const steps = [
  {
    title: "Written Application",
    body: "Share a bit about yourself, what you're interested in, and why LOGICA.",
  },
  {
    title: "Interview / Challenge",
    body: "For development tracks: a short product challenge and a chat with leads about how you think.",
  },
  {
    title: "Team Placement",
    body: "Based on your application (and interview when required), you're placed as space permits.",
  },
];

const faqs = [
  {
    q: "Do I need prior experience?",
    a: "Not at all. Mentorship tracks are for beginners. Enthusiasm and willingness to learn matter most.",
  },
  {
    q: "Do I need to be a CS major?",
    a: "No. We welcome students from all majors who care about computing and community.",
  },
  {
    q: "What is the time commitment?",
    a: "Varies by role. Product teams typically meet a few hours a week plus individual work.",
  },
  {
    q: "When will I hear back?",
    a: "We aim to review within a few weeks of each cycle. You'll hear by email.",
  },
];

export default function JoinPage() {
  return (
    <ClubShell>
      <PageContainer>
        <SectionContainer>
          <h1 className="type-title text-3xl md:text-4xl text-white">Join LOGICA</h1>
          <p className="mt-4 max-w-3xl text-body-lg text-white">
            We are UIC&apos;s collective of Latinx developers, designers, and computing enthusiasts.
          </p>
          <p className="mt-6 font-semibold text-signal">
            Apply for general membership — interest forms open on a rolling basis.
          </p>
        </SectionContainer>

        <SectionContainer>
          <h2 className="type-h2 mb-8 text-white">Available Roles</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {roles.map((r) => (
              <article key={r.title} className="club-card p-6">
                <h3 className="type-h4 text-white">{r.title}</h3>
                <p className="mt-3 text-body text-white">{r.body}</p>
              </article>
            ))}
          </div>
        </SectionContainer>

        <SectionContainer>
          <h2 className="type-h2 mb-8 text-white">Application Process</h2>
          <ol className="space-y-8">
            {steps.map((s, i) => (
              <li key={s.title} className="grid gap-2 md:grid-cols-[3rem_1fr]">
                <span className="type-label text-signal">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="type-h4 text-white">{s.title}</h3>
                  <p className="mt-2 text-body text-white">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </SectionContainer>

        <SectionContainer>
          <h2 className="type-h2 mb-8 text-white">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {faqs.map((f) => (
              <div key={f.q}>
                <h3 className="type-h4 text-white">{f.q}</h3>
                <p className="mt-2 text-body text-white">{f.a}</p>
              </div>
            ))}
          </div>
        </SectionContainer>

        <SectionContainer>
          <div className="club-card w-fit max-w-2xl p-8 md:p-12">
            <h2 className="type-h3 text-white">Interested in joining?</h2>
            <p className="mt-3 max-w-2xl text-body text-white">
              Join our community of passionate developers, designers, and tech enthusiasts.
            </p>
            <a
              href="mailto:logica@uic.edu?subject=LOGICA%20membership%20interest"
              className={`${buttonClasses()} mt-6`}
            >
              Apply to Join
            </a>
            <p className="mt-4">
              <Link href="/events" className="font-semibold text-signal hover:underline">
                Or attend an event first →
              </Link>
            </p>
          </div>
        </SectionContainer>
      </PageContainer>
    </ClubShell>
  );
}
