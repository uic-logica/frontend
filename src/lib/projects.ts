/**
 * What LOGICA is building, for the public /projects page and the Home strip.
 * Kept short on purpose: the full plan, dates and docs live in each team's
 * page in the .github repo, which this links to. Update both together.
 */
export type Project = {
  slug: string;
  name: string;
  line: string;
  hard: string;
  learn: string;
  status: "Main focus" | "Next" | "Later" | "Live";
  demo: string | null;
};

export const ORG = "https://github.com/uic-logica";
export const teamPage = (slug: string) => `${ORG}/.github/tree/main/projects/${slug}`;

export const projects: Project[] = [
  {
    slug: "opportunity-board",
    name: "Opportunity board",
    line: "Every internship and new-grad role worth applying to, always current, filtered to what each member can actually get, with a tracker for every application.",
    hard: "Daily jobs that pull public job boards into one deduped feed, matched to class year.",
    learn: "Scraping, scheduled jobs, data pipelines, search.",
    status: "Main focus",
    demo: "Thu, Nov 12",
  },
  {
    slug: "resume-builder",
    name: "Resume builder",
    line: "A resume tailored to each posting from one proven template. Members' own AI does the writing through our MCP tools, so the club pays for no tokens.",
    hard: "MCP tools that hand an AI the profile, the posting and the template, then render a PDF.",
    learn: "MCP servers, tool design for AI agents, PDF rendering.",
    status: "Main focus",
    demo: "Thu, Nov 19",
  },
  {
    slug: "event-replays",
    name: "Event replays in 3D",
    line: "Film an event on a phone, and anyone can walk through it later on the event page. Every face is blurred before anything is published.",
    hard: "Phone video to a Gaussian-splat scene in the browser, with face blurring first.",
    learn: "Computer vision, GPU jobs, 3D on the web.",
    status: "Next",
    demo: "Thu, Dec 3 (showcase)",
  },
  {
    slug: "mock-interviewer",
    name: "Mock interviewer",
    line: "Practice interviews for roles in your tracker, then get a transcript with feedback through your own AI account.",
    hard: "Role-aware questions and useful, scored feedback.",
    learn: "Voice interfaces, prompt design, evaluation.",
    status: "Later",
    demo: "Thu, Dec 3 (preview)",
  },
  {
    slug: "site",
    name: "This site",
    line: "The public site, member accounts, the member dashboard, the exec workspace and speaker intake. Built by members, from kickoff to live in five weeks.",
    hard: "One app for members, guests and the exec board, each seeing only what's theirs.",
    learn: "Next.js, APIs, auth, design systems.",
    status: "Live",
    demo: null,
  },
];
