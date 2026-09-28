import { redirect } from "next/navigation";

/**
 * Was a second check-in form that posted only `eventId`. The backend has
 * required a `code` since check-in codes landed, so every submission from
 * here failed validation — its own hint text admitted the code was "future
 * work". The dashboard's Participation section sends both and works.
 *
 * Redirecting rather than fixing: two check-in surfaces is the actual bug.
 * Same treatment as /members, /profile and /speaker-portal.
 */
export default function Page() {
  redirect("/dashboard/events");
}
