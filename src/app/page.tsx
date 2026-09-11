import Link from "next/link";

// logica-lean: this is a test hub for the e2e/bare-minimum scaffold, NOT
// the real landing page — that's [FE 1], still owned by Eduardo.
const links = [
  { href: "/signin", label: "Sign in" },
  { href: "/profile", label: "Profile" },
  { href: "/feed", label: "Feed" },
  { href: "/events", label: "Events" },
  { href: "/attendance", label: "Attendance" },
  { href: "/forms/startup-intake", label: "Form: Startup intake" },
  { href: "/forms/company-visit-signup", label: "Form: Company visit signup" },
];

export default function Home() {
  return (
    <main className="mx-auto max-w-sm p-8">
      <h1 className="text-xl font-semibold">E2E scaffold</h1>
      <p className="mt-2 text-sm text-zinc-500">
        Bare-minimum pages to test the backend end-to-end. Not the real site.
      </p>
      <ul className="mt-6 flex flex-col gap-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="underline">{l.label}</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
