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
export type Speaker = {
  id: string;
  name: string | null;
  email: string | null;
  organization: string | null;
  status: string;
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
export const sections = [
  "overview",
  "profile",
  "events",
  "activity",
  "community",
  "speakers",
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
    return isConfirmedSpeaker(profile ?? null) ? "My talk" : "My visit";
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
  return [
    "overview",
    "profile",
    "events",
    "activity",
    "community",
    ...(isBoard(user) ? (["speakers"] as const) : []),
  ];
}
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
