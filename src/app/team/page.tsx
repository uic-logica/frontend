import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("Our Team", "Meet the student leaders behind LOGICA at the University of Illinois Chicago and learn how to get involved.", "/team");

import Image from "next/image";
import Link from "next/link";
import { ClubShell } from "@/components/club/ClubShell";

type Person = {
  id: string;
  name: string;
  role: string;
  image: string;
  linkedin: string;
};

const exec: Person[] = [
  {
    id: "diego",
    name: "Diego Flores",
    role: "President",
    image: "/team/diego.jpg",
    linkedin: "https://www.linkedin.com/in/diegoantonioflores",
  },
  {
    id: "nicolas",
    name: "Nicolas Rufino Pinto",
    role: "Vice President",
    image: "/team/nicolas.jpg",
    linkedin: "https://www.linkedin.com/in/nicolas-rufino-pinto-",
  },
  {
    id: "dylan",
    name: "Dylan Cervantes",
    role: "Treasurer",
    image: "/team/dylan.jpg",
    linkedin: "https://www.linkedin.com/in/dylan-cervantes-a80bb82b3",
  },
  {
    id: "angelo",
    name: "Angelo Moises Guerrero",
    role: "Secretary",
    image: "/team/angelo.jpg",
    linkedin: "https://www.linkedin.com/in/angelo-moises-guerrero-526854232",
  },
];

/** Team card: portrait on top, name and role under it, linking to LinkedIn. */
function PersonCard({ person }: { person: Person }) {
  return (
    <a href={person.linkedin} target="_blank" rel="noopener noreferrer" className="site-card team-person">
      <span className="team-photo">
        <Image src={person.image} alt="" fill sizes="(max-width: 799px) 50vw, 265px" className="object-cover" />
      </span>
      <span className="team-info">
        <span>
          <strong>{person.name}</strong>
          <small>{person.role}</small>
        </span>
        <LinkedInIcon />
        <span className="sr-only">(LinkedIn, opens in a new tab)</span>
      </span>
    </a>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}

/** Layout is logica.pen V4 "05 Team". */
export default function TeamPage() {
  return (
    <ClubShell>
      <main className="site-page">
        <header className="site-page-head">
          <h1 className="serif">Our team</h1>
        </header>

        <section className="site-section" aria-labelledby="exec-board">
          <div className="site-head">
            <div>
              <h2 id="exec-board" className="serif">Executive board</h2>
              <p className="site-head-sub">Elected each spring.</p>
            </div>
          </div>
          <div className="team-people">
            {exec.map((m) => (
              <PersonCard key={m.id} person={m} />
            ))}
          </div>
        </section>

        <section className="site-section site-cta" aria-labelledby="join-board">
          <div>
            <h2 id="join-board" className="serif">Interested in joining the board?</h2>
            <p>Applications open each semester.</p>
          </div>
          <Link href="/join" className="site-btn">Join LOGICA</Link>
        </section>
      </main>
    </ClubShell>
  );
}
