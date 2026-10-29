import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Projects",
  "The software LOGICA members are building at UIC: an opportunity board, a resume builder, 3D event replays, and a mock interviewer.",
  "/projects",
);

import Link from "next/link";
import { ClubShell } from "@/components/club/ClubShell";
import { SiteIcon } from "@/components/site/icons";
import { ORG, projects, teamPage } from "@/lib/projects";

/** Public overview of what members are building; the details live in each team's GitHub page. */
export default function ProjectsPage() {
  return (
    <ClubShell>
      <main className="site-page">
        <header className="site-page-head">
          <p className="site-kicker">PROJECTS</p>
          <h1 className="serif">What we&apos;re building</h1>
        </header>

        <ol className="projects-list">
          {projects.map((p) => (
            <li key={p.slug} className="site-card projects-item" id={p.slug}>
              <div className="projects-top">
                <h2 className="serif">{p.name}</h2>
              </div>
              <p className="projects-line">{p.line}</p>
              <div className="projects-how">
                <section>
                  <h3>How it works</h3>
                  <ol>{p.how.map((step) => <li key={step}>{step}</li>)}</ol>
                </section>
                <section>
                  <h3>What the team builds</h3>
                  <ol>{p.build.map((step) => <li key={step}>{step}</li>)}</ol>
                </section>
              </div>
              <dl className="projects-facts">
                <div>
                  <dt>You learn</dt>
                  <dd>{p.learn}</dd>
                </div>
                <div>
                  <dt>Demo day</dt>
                  <dd>TBD, set once the team starts</dd>
                </div>
              </dl>
              <div className="projects-foot">
                <a className="site-link" href={teamPage(p.slug)} target="_blank" rel="noopener noreferrer">
                  The team&apos;s plan on GitHub <SiteIcon name="external" />
                </a>
                {/* Signs in if needed, then opens the application with this project ranked 1st. */}
                <Link className="site-btn" href={`/signin?next=${encodeURIComponent(`/dashboard/teams?pick=${p.slug.toUpperCase().replace(/-/g, "_")}`)}`}>
                  Apply to this team
                </Link>
              </div>
            </li>
          ))}
        </ol>

        <section className="site-section site-cta" aria-labelledby="build-title">
          <div>
            <h2 id="build-title" className="serif">Want to build one of these?</h2>
            <p>
              Software Teams take members of every level. Sign in with your UIC account, tell us your GitHub, the hours
              you have and the projects you want, and we&apos;ll place you.
            </p>
          </div>
          <div className="projects-cta-actions">
            <a className="site-btn secondary" href={ORG} target="_blank" rel="noopener noreferrer">
              See the code
            </a>
            <Link className="site-btn" href="/signin?next=/dashboard/teams">
              Apply to a Software Team
            </Link>
          </div>
        </section>
      </main>
    </ClubShell>
  );
}
