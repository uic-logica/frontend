import { ClubShell, PageContainer, SectionContainer } from "@/components/club/ClubShell";
import { PinkLink } from "@/components/club/Typewriter";

export default function AboutPage() {
  return (
    <ClubShell>
      <PageContainer>
        <SectionContainer>
          <h1 className="text-3xl font-bold md:text-4xl text-white">About LOGICA</h1>
          <p className="mt-4 text-xl text-signal md:text-2xl">
            Latinx Organization for Growth in Computing and Academics
          </p>
          <p className="mt-8 max-w-3xl text-body-lg text-white">
            We&apos;re a student org at UIC, working to increase the participation and
            success of students from Latinx and underrepresented communities pursuing
            careers in computing.
          </p>
        </SectionContainer>

        <SectionContainer>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-2xl border border-white/20 p-8">
              <h2 className="type-h3 text-white">What we actually do</h2>
              <p className="mt-4 text-body text-white">
                Bring in speakers, run company visits, and pass on the openings that reach
                us. Last year that meant LeetCode and Hot Wings, and a visit to CME.
              </p>
            </div>
            <div className="rounded-2xl border border-white/20 p-8">
              <h2 className="type-h3 text-white">Who shows up</h2>
              <p className="mt-4 text-body text-white">
                Members come from CS, data science, computer engineering, and plenty of
                majors that aren&apos;t any of those. If you&apos;re interested in tech,
                you&apos;re a part of the community.
              </p>
            </div>
          </div>
        </SectionContainer>

        <SectionContainer>
          <h2 className="type-h2 mb-8 text-white">Our Core Values</h2>
          <ul className="grid gap-6 md:grid-cols-3">
            {[
              {
                t: "Diversity",
                d: "The org was founded for Latinx and underrepresented students, and has never been limited to them. Anyone interested in tech is welcome.",
              },
              {
                t: "Growth and Development",
                d: "Technical, leadership, and professional skills, picked up from each other as much as from anyone we bring in.",
              },
              {
                t: "Community",
                d: "A family of students who pass along their learned mistakes and successes, and help each other through the rest.",
              },
            ].map((v) => (
              <li key={v.t} className="border-t border-signal pt-4">
                <h3 className="type-h4 text-white">{v.t}</h3>
                <p className="mt-2 text-body-sm text-white">{v.d}</p>
              </li>
            ))}
          </ul>
        </SectionContainer>

        <SectionContainer>
          <h2 className="type-h2 mb-8 text-white">Timeline</h2>
          <ol className="space-y-8">
            {[
              { y: "Started", d: "LOGICA formed at UIC as a space for Latinx students in computing." },
              {
                y: "Since",
                d: "Speakers, company visits, and events run with WiCyS, SHPE, ACM and LUG."
              },
              { y: "Now", d: "We're building this site, the org's first project." },
            ].map((t) => (
              <li key={t.y} className="grid gap-2 md:grid-cols-[8rem_1fr]">
                <span className="type-label text-signal">{t.y}</span>
                <p className="text-body text-white">{t.d}</p>
              </li>
            ))}
          </ol>
        </SectionContainer>

        <SectionContainer>
          <h2 className="type-h2 text-white">Meet Our Team</h2>
          <p className="mt-4 max-w-2xl text-body text-white">
            The students who make LOGICA possible — board and builders.
          </p>
          <PinkLink href="/team" className="mt-6 text-xl">
            See the team
          </PinkLink>
        </SectionContainer>
      </PageContainer>
    </ClubShell>
  );
}
