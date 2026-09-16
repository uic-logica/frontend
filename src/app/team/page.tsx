import Image from "next/image";
import Link from "next/link";
import { ClubShell, Section } from "@/components/club/ClubShell";

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

/** Team card — LinkedIn link, no zoom/lift. */
function PersonCard({ person }: { person: Person }) {
  return (
    <a
      href={person.linkedin}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex flex-col items-center"
    >
      <div className="relative mb-4">
        <div className="relative h-40 w-40 overflow-hidden rounded-xl md:h-48 md:w-48 lg:h-56 lg:w-56">
          <Image
            src={person.image}
            alt={person.name}
            fill
            sizes="(max-width: 768px) 40vw, (max-width: 1200px) 33vw, 20vw"
            className="object-cover"
          />
        </div>
      </div>
      <h3 className="text-center text-xl font-bold text-white group-hover:text-signal">{person.name}</h3>
      <p className="text-center font-mono text-sm text-signal">{person.role}</p>
    </a>
  );
}

function BoardSection({
  title,
  subtitle,
  people,
  className = "",
}: {
  title: string;
  subtitle: string;
  people: Person[];
  className?: string;
}) {
  return (
    <Section className={className}>
      <div className="mb-12 border-b border-zinc-800 pb-4">
        <h2 className="text-3xl font-bold text-white md:text-4xl">{title}</h2>
        <p className="mt-2 text-lg text-zinc-400">{subtitle}</p>
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 lg:grid-cols-4">
        {people.map((m) => (
          <PersonCard key={m.id} person={m} />
        ))}
      </div>
    </Section>
  );
}

export default function TeamPage() {
  return (
    <ClubShell>
      <div className="mb-20 pt-16 sm:pt-20 lg:pt-24">
        <Section>
          <h1 className="mb-4 text-3xl font-bold text-white md:text-4xl lg:text-5xl">Our Team</h1>
          <p className="mb-16 max-w-2xl text-xl text-zinc-400">
            Meet the talented individuals who make LOGICA possible
          </p>
        </Section>

        <BoardSection
          title="Executive Board"
          subtitle="The leadership team that guides LOGICA strategy and operations"
          people={exec}
          className="mt-8"
        />

        <Section className="mt-32">
          <div className="rounded-2xl bg-white/[0.02] p-8 ring-1 ring-white/10 md:p-10">
            <div className="max-w-3xl">
              <h2 className="mb-4 text-3xl font-bold leading-tight text-white md:text-4xl lg:text-5xl">
                Interested in joining our team?
              </h2>
              <p className="mb-8 text-lg leading-relaxed text-gray-400 lg:text-2xl">
                We&apos;re always looking for passionate students to join our development, design,
                and events teams. Applications open each semester.
              </p>
              <Link
                href="/join"
                className="inline-flex items-center justify-center rounded-lg bg-white px-8 py-3 text-lg font-semibold text-ink transition-transform duration-300 hover:-translate-y-0.5"
              >
                Join LOGICA
              </Link>
            </div>
          </div>
        </Section>
      </div>
    </ClubShell>
  );
}
