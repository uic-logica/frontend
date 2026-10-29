/**
 * What LOGICA is building, for the public /projects page and the Home strip.
 * Kept short on purpose: the full plan, dates and docs live in each team's
 * page in the .github repo, which this links to. Update both together.
 */
export type Project = {
  slug: string;
  name: string;
  /** What it is, in one or two sentences. */
  line: string;
  /** How it works, step by step, as a member would use it. */
  how: string[];
  /** What the team builds, in order (the milestones on its team page). */
  build: string[];
  learn: string;
};

export const ORG = "https://github.com/uic-logica";
export const teamPage = (slug: string) => `${ORG}/.github/tree/main/projects/${slug}`;

export const projects: Project[] = [
  {
    slug: "opportunity-board",
    name: "Opportunity board",
    line: "One feed of the internships and new-grad roles UIC students can actually apply to, plus a tracker for every application you send.",
    how: [
      "Every day, a job collects open roles from public job boards (Greenhouse, Lever, Ashby) and partner companies.",
      "Duplicates merge, closed roles drop off, and each role is tagged by class year, location and visa sponsorship.",
      "Your dashboard shows the roles that fit your year.",
      "Save a role and move it from Applied to OA, Interview and Offer, with a reminder before its deadline.",
    ],
    build: [
      "A scraper for one company's job board",
      "The roles database, with tags",
      "The daily refresh",
      "The feed in the dashboard",
      "The application tracker and reminders",
    ],
    learn: "Scraping, scheduled jobs, data pipelines, search.",
  },
  {
    slug: "resume-builder",
    name: "Resume builder",
    line: "A one-page resume tailored to each posting, written by your own AI (Claude, ChatGPT or a local model), so the club pays for no AI.",
    how: [
      "Connect your AI to LOGICA's MCP tools once.",
      "Your AI reads your profile, the posting you picked and our one proven template.",
      "It rewrites your bullets for that posting: did X, measured by Y, by doing Z.",
      "LOGICA renders the PDF and lists the posting's keywords your resume is missing.",
    ],
    build: [
      "One template rendered to PDF from your data",
      "The MCP tools your AI uses",
      "A keyword check (plain code, no AI)",
      "A resume page: preview, one version per application, download",
    ],
    learn: "MCP servers, tool design for AI agents, PDF rendering.",
  },
  {
    slug: "event-replays",
    name: "Event replays in 3D",
    line: "Film a LOGICA event on a phone, and anyone can walk through it in 3D later on the event page. Every face is blurred before anything is published.",
    how: [
      "Someone films the room on a phone.",
      "The video is split into frames and every face is blurred.",
      "A rented GPU rebuilds the room as a 3D scene (a Gaussian splat).",
      "The event page opens the scene in your browser, on a laptop or a phone.",
    ],
    build: [
      "One empty room you can walk through in the browser",
      "Upload, GPU job, and the scene saved with its event",
      "The 3D viewer on the event page, working on phones",
    ],
    learn: "Computer vision, GPU jobs, 3D on the web.",
  },
  {
    slug: "mock-interviewer",
    name: "Mock interviewer",
    line: "Practice an interview for a role you're applying to, then get a transcript with feedback. Text first, voice later.",
    how: [
      "Pick a role from your application tracker.",
      "Your own AI interviews you with questions for that role, through LOGICA's MCP tools.",
      "You get a scored transcript with feedback, saved to your dashboard.",
    ],
    build: [
      "One 10-minute behavioral interview, end to end",
      "Questions drawn from a role in your tracker",
      "A scored transcript saved to your dashboard",
    ],
    learn: "Voice interfaces, prompt design, evaluation.",
  },
];
