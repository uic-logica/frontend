"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Fragment, type ReactNode, useEffect, useState } from "react";
import { api, signOut } from "@/lib/api";
import { Icon } from "./Icon";
import { Overview, Activity, Notifications } from "./Overview";
import { ProfileEditor, Settings } from "./Profile";
import { Events, Community } from "./Participation";
import { Speakers } from "./Speakers";
import { SpeakerHome } from "./SpeakerHome";
import { CandidateHome } from "./CandidateHome";
import { Thread } from "./Thread";
import { Board } from "./Board";
import { BoardHome } from "./BoardHome";
import { Insights } from "./Insights";
import { Documents } from "./Documents";
import { Applications } from "./Applications";
import { Members } from "./Members";
import { AgentAccess } from "./AgentAccess";
import {
  type SessionUser,
  type Profile,
  type Event,
  type Engagement,
  type Notice,
  type Speaker,
  type Member,
  type Section,
  sections,
  titleFor,
  navFor,
  isConfirmedSpeaker,
  roleName,
  runsWorkspace,
  initials,
  PERSONAL_SECTIONS,
} from "./types";
import "./dashboard.css";

/**
 * A section, once opened, stays mounted and is hidden rather than torn down.
 *
 * The shell already survives navigation, but each section was rendered as
 * `{section === "x" && <X />}`, so leaving it unmounted the component and
 * coming back re-ran its fetch from an empty state — "Loading…" on every
 * single click, plus a lost scroll position, search box and open row.
 *
 * ponytail: no cache layer and no SWR dependency; the component instance is
 * the cache. The ceiling is staleness — a pane kept alive does not refetch,
 * so a change made in one section is not reflected in another until a manual
 * refresh or a reload. If that starts to bite, the upgrade is a revalidate
 * signal passed in here, not a data-fetching library.
 */
/** Exec-only sections. Money and pipeline are separate panes, which is also
 *  what keeps one pipeline from ever showing the other's rows. */
const EXEC_SECTIONS = [
  "insights",
  "money",
  "pipeline",
  "applications",
  "documents",
  "members",
] as const satisfies readonly Section[];

function Pane({ active, children }: { active: boolean; children: ReactNode }) {
  // `hidden` rather than unmounting. dashboard.css forces display:none on it,
  // which also takes the contents out of the accessibility tree and out of
  // the tab order — a hidden pane must not be reachable by keyboard.
  return (
    <div hidden={!active} className="d-pane">
      {children}
    </div>
  );
}

/**
 * Rendered once by `app/dashboard/layout.tsx`, not per route — the section
 * comes from the pathname so switching sections re-renders this component
 * instead of remounting it. That's what keeps the session and the loaded
 * data in place; a per-page mount flashed the skeleton (and briefly the
 * signed-out panel) on every click.
 */
export function Dashboard() {
  const router = useRouter();
  const pathname = usePathname();
  const slug = pathname.replace(/^\/dashboard\/?/, "");
  const section: Section = sections.includes(slug as Section)
    ? (slug as Section)
    : "overview";
  const [user, setUser] = useState<SessionUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [events, setEvents] = useState<Event[] | null>(null);
  const [engagement, setEngagement] = useState<Engagement | null>(null);
  const [notices, setNotices] = useState<Notice[] | null>(null);
  const [speakers, setSpeakers] = useState<Speaker[] | null>(null);
  const [members, setMembers] = useState<Member[] | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [authState, setAuthState] = useState<
    "loading" | "ready" | "signed-out" | "error"
  >("loading");
  const [reload, setReload] = useState(0);
  // Every section opened so far. A section is rendered once it appears here
  // and never removed, so revisiting it is a CSS change, not a refetch.
  //
  // The current section is folded in for this render rather than waiting for
  // the effect below to commit it — an effect runs after paint, which would
  // show one blank frame on a section's first visit, and a blank frame is the
  // flicker this whole change exists to remove.
  const [opened, setOpened] = useState<readonly Section[]>([]);
  const rendered = opened.includes(section) ? opened : [...opened, section];
  const seen = (item: Section) => rendered.includes(item);
  useEffect(() => {
    // This set accumulates across navigations and cannot be derived from the
    // current section alone, which is the case the rule's heuristic does not
    // cover. It self-terminates rather than cascading: once a section is in
    // the list the updater returns `prev` and React bails out.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpened((prev) => (prev.includes(section) ? prev : [...prev, section]));
  }, [section]);
  const [menu, setMenu] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    let alive = true;
    async function load() {
      setErrors([]);
      try {
        const session = await api<{ user?: SessionUser } | null>(
          "/api/auth/session",
        );
        if (!alive) return;
        if (!session?.user) {
          setAuthState("signed-out");
          return;
        }
        const current = session.user;
        if (current.mustChangePassword) {
          router.replace("/speaker-signin/set-password");
          return;
        }
        setUser(current);
        setAuthState("ready");
        async function read<T>(
          path: string,
          label: string,
          set: (v: T) => void,
        ) {
          try {
            const value = await api<T>(path);
            if (alive) set(value);
          } catch {
            if (alive)
              setErrors((prev) => [...prev, `Could not load ${label}.`]);
          }
        }
        await Promise.all([
          read<Profile>(
            current.accountKind === "SPEAKER"
              ? "/api/speaker-profile"
              : "/api/profile",
            "your profile",
            setProfile,
          ),
          read<Event[]>("/api/events", "events", setEvents),
          read<Notice[]>("/api/notifications", "notifications", setNotices),
          ...(current.accountKind === "SPEAKER"
            ? []
            : [
                read<Engagement>("/api/dashboard", "engagement", setEngagement),
              ]),
          // The roster is loaded for the board up front because three of
          // their sections need it to name an owner. The board's own
          // pipelines are fetched inside their sections instead — no point
          // pulling the money down for someone reading the feed.
          ...(runsWorkspace(current)
            ? [
                read<Speaker[]>(
                  "/api/speakers",
                  "speaker submissions",
                  setSpeakers,
                ),
                read<Member[]>("/api/board/members", "the roster", setMembers),
              ]
            : []),
        ]);
      } catch {
        if (alive) setAuthState("error");
      }
    }
    void load();
    return () => {
      alive = false;
    };
  }, [reload, router]);

  useEffect(() => {
    document.title = `${titleFor(section, user, profile)} · LOGICA`;
  }, [section, user, profile]);
  const speaker = user?.accountKind === "SPEAKER";
  const submissionId = profile?.speakerSubmission?.id;
  // The standalone thread is the whole page, so the work area gives up its
  // padding and max-width for it.
  const chatFull = section === "messages" && !!submissionId;
  async function logout() {
    setLeaving(true);
    try {
      await signOut();
      router.push(
        user?.accountKind === "SPEAKER" ? "/speaker-signin" : "/signin",
      );
    } catch {
      setErrors(["Could not sign out. Please try again."]);
      setLeaving(false);
    }
  }
  const nav = navFor(user, profile);
  const isBoardNav = !!user && runsWorkspace(user);
  const unread = notices?.filter((n) => !n.readAt).length ?? 0;
  const href = (item: Section) =>
    item === "overview" ? "/dashboard" : `/dashboard/${item}`;
  return (
    <div className="dash">
      <a href="#dashboard-content" className="d-skip">
        Skip to content
      </a>
      <aside className="d-sidebar">
        <Link className="d-brand" href="/dashboard">
          <Image src="/logica-logo-white.png" alt="" width={40} height={40} />
          <span>
            LOGICA<small>University of Illinois Chicago</small>
          </span>
        </Link>
        <button
          className="d-menu"
          aria-expanded={menu}
          aria-controls="dashboard-nav"
          onClick={() => setMenu(!menu)}
        >
          <Icon name="menu" />
          <span>Menu</span>
        </button>
        <div
          id="dashboard-nav"
          className={`d-sidebar-inner ${menu ? "is-open" : ""}`}
        >
          <nav aria-label="Dashboard">
            {nav.map((item, index) => (
              <Fragment key={item}>
                {/* Board nav runs to ten items. A rule where the club's
                    business ends and their own begins is the difference
                    between a list you scan and one you read. */}
                {isBoardNav &&
                  PERSONAL_SECTIONS.includes(item) &&
                  !PERSONAL_SECTIONS.includes(nav[index - 1]) && (
                    <span className="d-nav-divider" aria-hidden="true">
                      Yours
                    </span>
                  )}
                <Link
                  onClick={() => setMenu(false)}
                  href={href(item)}
                  aria-current={section === item ? "page" : undefined}
                >
                  <Icon name={item} />
                  {titleFor(item, user, profile)}
                  {item === "speakers" &&
                    !!speakers?.filter((s) => s.status === "PENDING")
                      .length && (
                      <span className="d-count">
                        {speakers.filter((s) => s.status === "PENDING").length}
                      </span>
                    )}
                </Link>
              </Fragment>
            ))}
          </nav>
          <div className="d-sidebar-bottom">
            <nav aria-label="Account">
              <Link
                href="/dashboard/notifications"
                aria-current={section === "notifications" ? "page" : undefined}
              >
                <Icon name="notifications" />
                Notifications
                {unread > 0 && <span className="d-count">{unread}</span>}
              </Link>
              {/* Account-level, like notifications and settings — not club
                  business, so it sits in the bottom group rather than
                  lengthening a main nav that already outgrew the rail. */}
              <Link
                href="/dashboard/connections"
                aria-current={section === "connections" ? "page" : undefined}
              >
                <Icon name="connections" />
                MCP Connections
              </Link>
              <Link
                href="/dashboard/settings"
                aria-current={section === "settings" ? "page" : undefined}
              >
                <Icon name="settings" />
                Settings
              </Link>
              {/* Day-to-day chat is Discord's job; this dashboard holds the
                  things that need a record. Hidden until the URL is set
                  rather than guessed at. */}
              {process.env.NEXT_PUBLIC_DISCORD_URL && (
                <a
                  href={process.env.NEXT_PUBLIC_DISCORD_URL}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Icon name="community" />
                  Discord
                </a>
              )}
            </nav>
            {user && (
              <div className="d-account">
                <span className="d-avatar">
                  {initials(profile?.name || user.name)}
                </span>
                <span>
                  <strong>
                    {profile?.name || user.name || "Your account"}
                  </strong>
                  <small>{roleName(user, profile)}</small>
                </span>
                <button
                  aria-label="Sign out"
                  title="Sign out"
                  onClick={logout}
                  disabled={leaving}
                >
                  <Icon name="exit" />
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
      <div className="d-workarea">
        <header className="d-topbar">
          <span>
            <strong>{titleFor(section, user, profile)}</strong>
          </span>
          <div>
            <span className="d-campus">LOGICA @ UIC</span>
            <Link
              aria-label={`${unread} unread notifications`}
              href="/dashboard/notifications"
              className="d-bell"
            >
              <Icon name="notifications" />
              {unread > 0 && <i />}
            </Link>
            <Link
              className="d-avatar d-avatar-small"
              href="/dashboard/profile"
              aria-label="My profile"
            >
              {initials(profile?.name || user?.name || null)}
            </Link>
          </div>
        </header>
        <main
          id="dashboard-content"
          className={`d-main ${chatFull ? "d-main-flush" : ""}`}
        >
          {authState === "loading" && (
            <div className="d-skeleton" role="status">
              <span className="sr-only">Loading your dashboard</span>
              <div />
              <div />
              <div />
            </div>
          )}
          {authState === "signed-out" && (
            <div className="d-panel d-welcome">
              <h1>Sign in to LOGICA.</h1>
              <p>See your profile, events, and club activity.</p>
              <div className="d-actions">
                <Link className="d-button" href="/signin">
                  Member sign-in
                </Link>
                <Link className="d-button secondary" href="/speaker-signin">
                  Speaker sign-in
                </Link>
              </div>
            </div>
          )}
          {authState === "error" && (
            <div className="d-error" role="alert">
              We couldn’t connect to your dashboard.{" "}
              <button onClick={() => setReload((v) => v + 1)}>Try again</button>
            </div>
          )}
          {errors.length > 0 && (
            <div className="d-error" role="alert">
              {errors.join(" ")}{" "}
              <button onClick={() => setReload((v) => v + 1)}>
                Retry loading
              </button>
            </div>
          )}
          {user && authState === "ready" && (
            <>
              {seen("overview") && (
              <Pane active={section === "overview"}>
                {speaker ? (
                  isConfirmedSpeaker(profile) ? (
                    <SpeakerHome user={user} profile={profile} />
                  ) : (
                    <CandidateHome
                      key={profile?.speakerSubmission?.id}
                      user={user}
                      profile={profile}
                      onSaved={setProfile}
                    />
                  )
                ) : runsWorkspace(user) ? (
                  <BoardHome
                    user={user}
                    members={members}
                    events={events}
                    speakers={speakers}
                  />
                ) : (
                  <Overview
                    user={user}
                    profile={profile}
                    events={events}
                    engagement={engagement}
                    speakers={speakers}
                    notices={notices}
                  />
                )}
              </Pane>
              )}
              {seen("messages") && (
              <Pane active={section === "messages"}>
                {submissionId ? (
                  <Thread
                    full
                    submissionId={submissionId}
                    user={user}
                    events={events}
                    windows={profile?.speakerSubmission?.availability ?? []}
                  />
                ) : (
                  <div className="d-empty">
                    <h1>No thread yet</h1>
                    <p>
                      Your thread with the board opens once your visit is on
                      file.
                    </p>
                  </div>
                )}
              </Pane>
              )}
              {seen("profile") && (
              <Pane active={section === "profile"}>
                {profile ? (
                  <ProfileEditor
                    key={profile.id}
                    profile={profile}
                    user={user}
                    onSaved={setProfile}
                  />
                ) : (
                  !errors.length && <p role="status">Loading your profile…</p>
                )}
              </Pane>
              )}
              {seen("events") && (
                <Pane active={section === "events"}>
                  <Events
                    user={user}
                    events={events}
                    engagement={engagement}
                    onEngagement={setEngagement}
                    onEvents={setEvents}
                  />
                </Pane>
              )}
              {seen("activity") && (
                <Pane active={section === "activity"}>
                  <Activity engagement={engagement} />
                </Pane>
              )}
              {seen("community") && (
                <Pane active={section === "community"}>
                  <Community user={user} />
                </Pane>
              )}
              {seen("speakers") && (
              <Pane active={section === "speakers"}>
                {runsWorkspace(user) ? (
                  <Speakers
                    user={user}
                    speakers={speakers}
                    events={events}
                    onChange={setSpeakers}
                  />
                ) : (
                  <div className="d-empty">
                    <h1>Board access required</h1>
                    <p>This directory is available to LOGICA board members.</p>
                    <Link href="/dashboard">Return to your overview</Link>
                  </div>
                )}
              </Pane>
              )}

              {/* Exec sections. The gate is cosmetic — every one of these
                  endpoints re-checks the role server-side — but it still has
                  to be evaluated per pane now that panes outlive their visit,
                  so a demoted user's rendered pane can't linger. */}
              {EXEC_SECTIONS.filter(seen).map((item) => (
                <Pane key={item} active={section === item}>
                  {!runsWorkspace(user) ? (
                    <div className="d-empty">
                      <h1>Board access required</h1>
                      <p>This is available to LOGICA board members.</p>
                      <Link href="/dashboard">Return to your overview</Link>
                    </div>
                  ) : item === "insights" ? (
                    <Insights />
                  ) : item === "money" ? (
                    <Board kind="MONEY" members={members} events={events} />
                  ) : item === "pipeline" ? (
                    <Board kind="OUTREACH" members={members} events={events} />
                  ) : item === "applications" ? (
                    <Applications />
                  ) : item === "documents" ? (
                    <Documents />
                  ) : (
                    <Members
                      user={user}
                      members={members}
                      onChange={() => setReload((v) => v + 1)}
                    />
                  )}
                </Pane>
              ))}

              {seen("notifications") && (
                <Pane active={section === "notifications"}>
                  <Notifications notices={notices} onChange={setNotices} />
                </Pane>
              )}
              {seen("connections") && (
                <Pane active={section === "connections"}>
                  <AgentAccess />
                </Pane>
              )}
              {seen("settings") && (
                <Pane active={section === "settings"}>
                  <Settings user={user} />
                </Pane>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
