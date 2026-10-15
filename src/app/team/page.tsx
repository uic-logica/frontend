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

/** Team card: round portrait linking to LinkedIn. */
function PersonCard({ person }: { person: Person }) {
  return (
    <a href={person.linkedin} target="_blank" rel="noopener noreferrer" className="person-card">
      <span className="person-photo">
        <Image src={person.image} alt="" fill sizes="(max-width: 799px) 76px, 160px" className="object-cover" />
      </span>
      <h3>{person.name}</h3>
      <p className="person-role">{person.role}</p>
    </a>
  );
}

/** Layout is logica.pen V3 "04 · Team" (desktop and mobile). */
export default function TeamPage() {
  return (
    <ClubShell>
      <main className="site-page">
        <header className="page-head">
          <h1>Our Team</h1>
        </header>

        <section className="team-board" aria-labelledby="exec-board">
          <div className="team-board-head">
            <h2 id="exec-board">Executive Board</h2>
            <p>
              <span className="only-d">The leadership team that guides LOGICA strategy and operations</span>
              <span className="only-m">The students guiding LOGICA strategy and operations.</span>
            </p>
          </div>
          <div className="team-people">
            {exec.map((m) => (
              <PersonCard key={m.id} person={m} />
            ))}
          </div>
        </section>

        <section className="team-cta glass" aria-labelledby="join-board">
          <h2 id="join-board">Interested in joining the board?</h2>
          <p>
            <span className="only-d">Board applications open each semester.</span>
            <span className="only-m">Applications open each semester.</span>
          </p>
          <Link href="/join" className="site-button">Join LOGICA</Link>
        </section>
      </main>
    </ClubShell>
  );
}
