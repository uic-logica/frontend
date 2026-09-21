import type { Section } from "./types";
const paths: Record<
  Section | "arrow" | "exit" | "check" | "menu" | "clock",
  string
> = {
  overview: "M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z",
  profile: "M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0 M4 21v-2a8 8 0 0 1 16 0v2",
  events: "M5 5h14a2 2 0 0 1 2 2v13H3V7a2 2 0 0 1 2-2 M7 2v6 M17 2v6 M3 11h18",
  activity: "M3 20h18 M6 16v-5 M12 16V4 M18 16V8",
  community: "M21 11a8 8 0 0 1-8 8H7l-5 3 1-6a8 8 0 1 1 18-5",
  speakers: "M9 3h6v11H9z M5 10v3a7 7 0 0 0 14 0v-3 M12 20v3 M8 23h8",
  messages: "M4 4h16v12H8l-4 4z M8 9h8 M8 12h5",
  clock: "M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18 M12 7v5l3.5 2",
  notifications: "M5 9a7 7 0 0 1 14 0v6l2 3H3l2-3z M9 21h6",
  settings: "M4 7h16 M4 17h16 M8 4v6 M16 14v6",
  arrow: "M5 12h14 M13 6l6 6-6 6",
  exit: "M9 3H3v18h6 M10 12h11 M17 8l4 4-4 4",
  check: "m5 12 4 4 10-10",
  menu: "M3 6h18 M3 12h18 M3 18h18",
};
export function Icon({ name }: { name: keyof typeof paths }) {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}
