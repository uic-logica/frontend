import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Projects",
  "The software LOGICA members are building at UIC: an opportunity board, a resume builder, 3D event replays, a mock interviewer and this site.",
  "/projects",
);

import Link from "next/link";
import { ClubShell } from "@/components/club/ClubShell";
import { SiteIcon } from "@/components/site/icons";
import { ORG, projects, teamPage } from "@/lib/projects";

const tone: Record<string, string> = { "Main focus": "focus", Next: "next", Later: "later", Live: "live" };

/** Public overview of what members are building; the details live in each team's GitHub page. */
export default function ProjectsPage() {
  return (
    <ClubShell>
      <main className="site-page">
        <header className="site-page-head">
          <p className="site-kicker">PROJECTS</p>
          <h1 className="serif">What we&apos;re building</h1>
          <p>
            Members build the software that helps students get hired, one team per product, in the open. Every plan,
            design doc, demo and retro is public on GitHub.
          </p>
        </header>

        <ol className="projects-list">
          {projects.map((p) => (
            <li key={p.slug} className="site-card projects-item" id={p.slug}>
              <div className="projects-top">
                <h2 className="serif">{p.name}</h2>
                <span className={`site-badge projects-status ${tone[p.status]}`}>{p.status}</span>
              </div>
              <p className="projects-line">{p.line}</p>
              <dl className="projects-facts">
                <div>
                  <dt>The hard part</dt>
                  <dd>{p.hard}</dd>
                </div>
                <div>
                  <dt>You learn</dt>
                  <dd>{p.learn}</dd>
                </div>
                {p.demo && (
                  <div>
                    <dt>Demo day</dt>
                    <dd>{p.demo}</dd>
                  </div>
                )}
              </dl>
              <a className="site-link" href={teamPage(p.slug)} target="_blank" rel="noopener noreferrer">
                Plan, timeline and demos on GitHub <SiteIcon name="external" />
              </a>
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
