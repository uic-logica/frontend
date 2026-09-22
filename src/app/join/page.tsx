import Link from "next/link";
import { ClubShell, PageContainer, SectionContainer } from "@/components/club/ClubShell";
import { JoinForm } from "./JoinForm";

const roles = [
  {
    title: "Software Engineer",
    body: "Develop LOGICA products with a team on a weekly cadence — startup-like pace, campus impact.",
  },
  {
    title: "Board Member",
    body: "Help run LOGICA through events, outreach, finances, and day-to-day executive board work.",
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
    a: "No. Both tracks are open to students without prior experience. Enthusiasm and willingness to learn matter most.",
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
        </SectionContainer>

        <SectionContainer>
          <h2 className="type-h2 mb-8 text-white">Available Roles</h2>
          <div className="grid gap-6 md:grid-cols-2">
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
          <JoinForm />
          <p className="mt-4">
            <Link href="/events" className="font-semibold text-signal hover:underline">
              Or attend an event first →
            </Link>
          </p>
        </SectionContainer>
      </PageContainer>
    </ClubShell>
  );
}
