import { ClubShell, Section } from "@/components/club/ClubShell";
import { PinkLink } from "@/components/club/Typewriter";

export default function AboutPage() {
  return (
    <ClubShell>
      <div className="mb-20 pt-16 sm:pt-20 lg:pt-24">
        <Section>
          <h1 className="text-3xl font-bold text-white md:text-4xl lg:text-5xl">About LOGICA</h1>
          <p className="mt-4 text-xl text-signal md:text-2xl">
            The community for Latinx engineers &amp; builders at UIC
          </p>
          <p className="mt-8 max-w-3xl text-lg text-white/80">
            As a home for computing and academics at UIC, we&apos;re students looking to
            strengthen campus life through technology, mentorship, and culture — welcoming
            people of all backgrounds and experience levels.
          </p>
        </Section>

        <Section>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="border border-white/20 p-8">
              <h2 className="text-2xl font-bold text-white">We Seek Impact</h2>
              <p className="mt-4 text-white/75">
                We build community and tools that make UIC better for Latinx students in
                computing — from workshops to the products we ship together.
              </p>
            </div>
            <div className="border border-white/20 p-8">
              <h2 className="text-2xl font-bold text-white">We Welcome Learning</h2>
              <p className="mt-4 text-white/75">
                Not everyone arrives with a CS background. We value people who push
                themselves to learn — enthusiasm beats résumé polish.
              </p>
            </div>
          </div>
        </Section>

        <Section>
          <h2 className="mb-8 text-3xl font-bold text-white md:text-4xl">Our Core Values</h2>
          <ul className="grid gap-6 md:grid-cols-3">
            {[
              { t: "Inclusion", d: "We welcome students of all backgrounds and experience levels." },
              { t: "Impact", d: "We build solutions and community that meaningfully improve campus life." },
              { t: "Drive", d: "We love people who push themselves." },
            ].map((v) => (
              <li key={v.t} className="border-t border-signal pt-4">
                <h3 className="text-xl font-bold text-white">{v.t}</h3>
                <p className="mt-2 text-white/70">{v.d}</p>
              </li>
            ))}
          </ul>
        </Section>

        <Section>
          <h2 className="mb-8 text-3xl font-bold text-white md:text-4xl">Timeline</h2>
          <ol className="space-y-8">
            {[
              { y: "Founding", d: "LOGICA formed as a space for Latinx students in computing and academics at UIC." },
              { y: "Growth", d: "Events, mentorship, and project teams became the core of how we show up for members." },
              { y: "Today", d: "We're shipping this platform and expanding pathways for every skill level." },
            ].map((t) => (
              <li key={t.y} className="grid gap-2 md:grid-cols-[8rem_1fr]">
                <span className="type-label text-signal">{t.y}</span>
                <p className="text-white/80">{t.d}</p>
              </li>
            ))}
          </ol>
        </Section>

        <Section>
          <h2 className="text-3xl font-bold text-white md:text-4xl">Meet Our Team</h2>
          <p className="mt-4 max-w-2xl text-white/75">
            The students who make LOGICA possible — board, builders, and mentors.
          </p>
          <PinkLink href="/team" className="mt-6 text-xl">
            See the team
          </PinkLink>
        </Section>
      </div>
    </ClubShell>
  );
}
