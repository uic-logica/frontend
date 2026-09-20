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
    organization: string | null;
    availability: Window[] | null;
    needs: string | null;
    note: string | null;
  } | null;
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
  notifications: "Notifications",
  settings: "Settings",
};
export function isBoard(user: SessionUser) {
  return (
    user.accountKind === "MEMBER" && ["BOARD", "EXEC_BOARD"].includes(user.role)
  );
}
export function roleName(user: SessionUser) {
  return user.accountKind === "SPEAKER"
    ? "Guest speaker"
    : user.role === "EXEC_BOARD"
      ? "Exec board"
      : user.role === "BOARD"
        ? "Board member"
        : "Member";
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
