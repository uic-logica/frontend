export type SessionUser = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  accountKind: string;
  mustChangePassword: boolean;
};
export type Window = {
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
};
/** The scheduled event a speaker's talk is attached to, once the board links one. */
export type TalkEvent = {
  id: string;
  title: string;
  startsAt: string;
  location: string | null;
};
/** Null until the talk has an event — there is nothing to count before that. */
export type TalkStats = {
  rsvpGoing: number;
  checkedIn: number;
  questions: number;
} | null;
export type Profile = {
  id: string;
  name: string | null;
  email: string;
  bio: string | null;
  major?: string | null;
  gradYear?: number | null;
  linkedin?: string | null;
  resumeFilename: string | null;
  speakerSubmission?: {
    id: string;
    kind?: VisitKind;
    organization: string | null;
    availability: Window[] | null;
    needs: string | null;
    note: string | null;
    status: string;
    submittedAt: string | null;
    availabilityConfirmedAt: string | null;
    talkTitle: string | null;
    slidesUrl: string | null;
    event: TalkEvent | null;
  } | null;
  talkStats?: TalkStats;
};
/**
 * A submitted guest is a *candidate* until the board confirms them — they
 * can offer availability and talk to us, but there's no talk to prepare
 * yet. Confirming promotes them to a speaker, which is what unlocks the
 * talk details, slides and event numbers. The API enforces the same split.
 */
export function isConfirmedSpeaker(profile: Profile | null) {
  return profile?.speakerSubmission?.status === "CONFIRMED";
}

/** One message in a speaker's thread with the board. */
export type SpeakerMessage = {
  id: string;
  body: string;
  createdAt: string;
  author: {
    id: string;
    name: string | null;
    role: string;
    accountKind: string;
  };
};
export type Event = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  startsAt: string;
};
export type Post = {
  id: string;
  body: string;
  createdAt: string;
  author: { id: string; name: string | null; role: string };
};
export type Notice = {
  id: string;
  message: string;
  createdAt: string;
  readAt: string | null;
};
export type Engagement = {
  involvement: {
    eventsAttended: number;
    postsMade: number;
    formsSubmitted: number;
  };
  rsvps: { eventId: string; status: string }[];
  attendances: { id: string; checkedInAt: string; event: { title: string } }[];
  posts: { id: string; body: string; createdAt: string }[];
  submissions: { id: string; createdAt: string; form: { title: string } }[];
};
/** What we're asking a guest for. Mirrors VisitKind in the backend schema. */
export type VisitKind = "TALK" | "WORKSHOP" | "COMPANY_VISIT";

export const VISIT_LABEL: Record<VisitKind, string> = {
  TALK: "Talk",
  WORKSHOP: "Workshop",
  COMPANY_VISIT: "Company visit",
};

/** "their talk" / "their workshop" — for a sentence rather than a chip. */
export const VISIT_NOUN: Record<VisitKind, string> = {
  TALK: "talk",
  WORKSHOP: "workshop",
  COMPANY_VISIT: "visit",
};

/** Where a minted invite token points. Built here so nothing hardcodes /join. */
export function inviteUrl(token: string) {
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  return `${origin}/invite/${token}`;
}

export type Speaker = {
  id: string;
  name: string | null;
  email: string | null;
  organization: string | null;
  status: string;
  kind?: VisitKind;
  /** An unused, unexpired sign-up link is out there right now. */
  inviteLive?: boolean;
  submittedAt: string | null;
  needs: string | null;
  note: string | null;
  availability: Window[] | null;
  referredBy: string | null;
  availabilityConfirmedAt: string | null;
  talkTitle: string | null;
  slidesUrl: string | null;
  event: TalkEvent | null;
  user: {
    id: string;
    username: string | null;
    linkedin: string | null;
    resumeFilename: string | null;
  } | null;
};
// ---- The board's two pipelines ----------------------------------------
// One shape for both: a spend and a company we're talking to differ only in
// which fields are filled in. Mirrors BoardItem in the backend schema.

export type BoardKind = "MONEY" | "OUTREACH";

export type BoardPerson = { id: string; name: string | null; email?: string };

export type BoardItem = {
  id: string;
  kind: BoardKind;
  title: string;
  stage: string;
  detail: string | null;
  ownerId: string | null;
  nextStepAt: string | null;
  stageChangedAt: string | null;
  archivedAt: string | null;
  updatedAt: string;
  // Money
  amountCents: number | null;
  budgetId: string | null;
  paidByUserId: string | null;
  receiptUrl: string | null;
  // Outreach
  org: string | null;
  contactName: string | null;
  contactEmail: string | null;
  channel: string | null;
  category: string | null;
  link: string | null;
  lastTouchAt: string | null;
  eventId: string | null;
  owner: BoardPerson | null;
  paidBy: BoardPerson | null;
  stageChangedBy: BoardPerson | null;
  createdBy: BoardPerson | null;
  event: { id: string; title: string; startsAt: string } | null;
  budget: { id: string; label: string } | null;
};

export type Budget = {
  id: string;
  label: string;
  amountCents: number;
  startsAt: string;
  endsAt: string;
  itemCount: number;
  spentCents: number;
  pendingCents: number;
  remainingCents: number;
  owedBackCents: number;
};

export type Budgets = {
  budgets: Budget[];
  unbudgeted: {
    spentCents: number;
    pendingCents: number;
    owedBackCents: number;
  };
};

/** Keep in step with STAGES in the backend's lib/board-item.ts. */
export const STAGES: Record<BoardKind, readonly string[]> = {
  MONEY: ["REQUESTED", "APPROVED", "PAID", "REIMBURSED", "DECLINED"],
  OUTREACH: [
    "PROSPECT",
    "CONTACTED",
    "NEEDS_REPLY",
    "REPLIED",
    "SCHEDULED",
    "DONE",
    "PASSED",
  ],
};

export const STAGE_LABEL: Record<string, string> = {
  REQUESTED: "Requested",
  APPROVED: "Approved",
  PAID: "Paid",
  REIMBURSED: "Paid back",
  DECLINED: "Declined",
  PROSPECT: "Prospect",
  CONTACTED: "Reached out",
  NEEDS_REPLY: "Needs a reply",
  REPLIED: "We replied",
  SCHEDULED: "Scheduled",
  DONE: "Done",
  PASSED: "Passed",
};

/**
 * Which `.d-badge` colour a stage gets. The existing three (confirmed /
 * pending / declined) already mean "good", "waiting", "no", so the stages
 * map onto them rather than inventing a fourth palette.
 */
export function stageTone(stage: string) {
  if (["PAID", "REIMBURSED", "DONE", "SCHEDULED"].includes(stage)) return "confirmed";
  if (["DECLINED", "PASSED"].includes(stage)) return "declined";
  return "pending";
}

/** The public site's own partner taxonomy — see src/app/page.tsx. */
export const OUTREACH_CATEGORIES = [
  "Company visit",
  "Talk",
  "Workshop",
  "Partner",
] as const;
export const OUTREACH_CHANNELS = [
  "LinkedIn",
  "Email",
  "In person",
  "Referral",
] as const;

export type ClubInsights = {
  members: {
    total: number;
    joinedRecently: number;
    active: number;
    lapsed: number;
    activeWindowDays: number;
  };
  events: {
    id: string;
    title: string;
    startsAt: string;
    location: string | null;
    going: number;
    attended: number;
    showRate: number | null;
  }[];
  topAttendees: {
    id: string;
    name: string | null;
    email: string;
    major: string | null;
    gradYear: number | null;
    attended: number;
  }[];
  speakers: Record<string, number>;
  applications: Record<string, number>;
};

export type Officer =
  | "PRESIDENT"
  | "TREASURER"
  | "SECRETARY"
  | "OUTREACH"
  | "OTHER";

export const OFFICER_LABEL: Record<Officer, string> = {
  PRESIDENT: "President",
  TREASURER: "Treasurer",
  SECRETARY: "Secretary",
  OUTREACH: "Outreach",
  OTHER: "Board",
};

export type Member = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  officer: Officer | null;
  major: string | null;
  gradYear: number | null;
  createdAt: string;
  eventsAttended: number;
  postsMade: number;
  lastSeenAt: string | null;
  lastSeenAt_event: string | null;
};

export type DriveFile = {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  modifiedTime?: string;
  size?: string;
  owners?: { displayName: string }[];
};

export type Documents = {
  configured: boolean;
  root: string | null;
  folder?: string | null;
  searching?: string | null;
  files: DriveFile[];
};

export const sections = [
  "overview",
  "profile",
  "events",
  "activity",
  "community",
  "speakers",
  "insights",
  "money",
  "pipeline",
  "documents",
  "members",
  "messages",
  "notifications",
  "settings",
] as const;
export type Section = (typeof sections)[number];
export const titles: Record<Section, string> = {
  overview: "Overview",
  profile: "My profile",
  events: "Events",
  activity: "My engagement",
  community: "Community",
  speakers: "Speaker directory",
  insights: "Insights",
  money: "Money",
  pipeline: "Pipeline",
  documents: "Documents",
  members: "Members",
  messages: "Messages",
  notifications: "Notifications",
  settings: "Settings",
};

/**
 * A speaker's "overview" isn't an overview of the club — it's their own
 * talk, and that's the only thing on it.
 */
export function titleFor(
  section: Section,
  user: SessionUser | null,
  profile?: Profile | null,
) {
  if (section === "overview" && user?.accountKind === "SPEAKER") {
    // A workshop host should not be reading the word "talk" all week.
    const noun = VISIT_NOUN[profile?.speakerSubmission?.kind ?? "TALK"];
    return isConfirmedSpeaker(profile ?? null) ? `My ${noun}` : "My visit";
  }
  return titles[section];
}

/**
 * A candidate lands on their one task; their details sit behind it because
 * the board filled those in when they set the account up. A confirmed
 * speaker leads with their profile, then their talk and the thread. Club
 * events, engagement stats and the community feed are member business —
 * a guest has no use for any of it.
 */
export function navFor(
  user: SessionUser | null,
  profile?: Profile | null,
): Section[] {
  if (!user) return ["overview"];
  if (user.accountKind === "SPEAKER") {
    return isConfirmedSpeaker(profile ?? null)
      ? ["profile", "overview", "messages"]
      : ["overview", "messages", "profile"];
  }
  if (isBoard(user)) {
    // Running the club, then being in it. The divider in the sidebar falls
    // between the two groups — nine flat items is where this stops feeling
    // like something you can scan.
    return [
      "overview",
      "insights",
      "money",
      "pipeline",
      "speakers",
      "members",
      "documents",
      "events",
      "community",
      "profile",
    ];
  }
  return ["overview", "profile", "events", "activity", "community"];
}

/**
 * Where the club's business ends and the member's own begins, for the
 * sidebar rule. Board nav only.
 */
export const PERSONAL_SECTIONS: Section[] = ["events", "community", "profile", "activity"];

export function isBoard(user: SessionUser) {
  return (
    user.accountKind === "MEMBER" && ["BOARD", "EXEC_BOARD"].includes(user.role)
  );
}
/**
 * The five kinds of person here — mirrors lib/stage.ts on the backend,
 * which is the authority. A SPEAKER account is a candidate or a speaker
 * depending on the board's decision; BOARD and EXEC_BOARD are members with
 * more of the club to run.
 */
export type Stage =
  | "CANDIDATE"
  | "SPEAKER"
  | "MEMBER"
  | "BOARD"
  | "EXEC_BOARD";

export function stageOf(user: SessionUser, profile?: Profile | null): Stage {
  if (user.accountKind === "SPEAKER") {
    return isConfirmedSpeaker(profile ?? null) ? "SPEAKER" : "CANDIDATE";
  }
  if (user.role === "EXEC_BOARD") return "EXEC_BOARD";
  if (user.role === "BOARD") return "BOARD";
  return "MEMBER";
}

const STAGE_LABELS: Record<Stage, string> = {
  CANDIDATE: "Candidate",
  SPEAKER: "Guest speaker",
  MEMBER: "Member",
  BOARD: "Board member",
  EXEC_BOARD: "Exec board",
};

export function roleName(user: SessionUser, profile?: Profile | null) {
  return STAGE_LABELS[stageOf(user, profile)];
}
export function date(
  value: string,
  options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" },
) {
  return new Date(value).toLocaleDateString("en-US", options);
}
export function initials(name: string | null) {
  return (name || "LOGICA")
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("");
}

/**
 * Cents in, dollars out. Everything money-shaped is stored as whole cents so
 * no total is ever a float; this is the only place that divides.
 */
export function money(cents: number | null | undefined, { cell = false } = {}) {
  if (cents === null || cents === undefined) return cell ? "—" : "$0";
  const negative = cents < 0;
  const text = (Math.abs(cents) / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    // Whole dollars read better in a summary strip; cells need the cents.
    minimumFractionDigits: cell || Math.abs(cents) % 100 !== 0 ? 2 : 0,
    maximumFractionDigits: 2,
  });
  return negative ? `−${text}` : text;
}

/** "in 3 days" / "2 days ago" / "today" — for a next step or a last touch. */
export function relativeDay(value: string | null) {
  if (!value) return null;
  const day = 24 * 60 * 60 * 1000;
  const then = new Date(value);
  const midnight = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((midnight(then) - midnight(new Date())) / day);
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  if (days === -1) return "yesterday";
  if (days > 0) return `in ${days} days`;
  return `${-days} days ago`;
}

export function personName(person: BoardPerson | null | undefined) {
  return person?.name || person?.email || null;
}
