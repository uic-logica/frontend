"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Fragment, type CSSProperties, type ReactNode, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
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
import { Avatar } from "./Avatar";
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
  PERSONAL_SECTIONS,
} from "./types";
import { BuildTeams, retireTeamsHint, snoozeTeamsHint, teamsHintHidden } from "./BuildTeams";
import "./dashboard.css";

/** logica.pen "35 Dashboard — Variant E (night) · C clouds + city lights": one painting behind every section. */
const art = "dashboard-night";

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
const noSubscribe = () => () => {};

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
  function forgetSession() {
    setUser(null);
    setProfile(null);
    setEvents(null);
    setEngagement(null);
    setNotices(null);
    setSpeakers(null);
    setMembers(null);
  }
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
  // The nav (and so the pointer) only renders client-side after the session
  // loads, so reading localStorage in the initializer can't mismatch the server.
  const [hintOff, setHintOff] = useState(() => typeof window === "undefined" || teamsHintHidden());
  // Applied on another device? The server knows; this browser doesn't yet.
  const hintAccount = user?.accountKind === "MEMBER" ? user.id : null;
  useEffect(() => {
    if (hintOff || !hintAccount) return;
    api<{ track: string }[]>("/api/join/mine")
      .then((rows) => {
        if (rows.some((r) => r.track === "SOFTWARE_ENGINEER")) {
          retireTeamsHint();
          setHintOff(true);
        }
      })
      .catch(() => {});
  }, [hintOff, hintAccount]);
  const [leaving, setLeaving] = useState(false);
  const leavingRef = useRef(false);
  const confirmOut = useRef<HTMLDialogElement>(null);
  const searchDialog = useRef<HTMLDialogElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const isMac = useSyncExternalStore(noSubscribe, () => /Mac|iPhone|iPad/.test(navigator.userAgent), () => false);
  const accountMenu = useRef<HTMLDetailsElement>(null);
  const sideMenu = useRef<HTMLDetailsElement>(null);
  const sidebar = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLSpanElement>(null);

  // One white indicator slides between sidebar items as the section changes,
  // the same motion as the site nav's capsule. Measured from the DOM because
  // it depends on rendered layout, and re-measured whenever the menu itself
  // changes (a guest's items change once their profile loads). Not animated
  // on first placement.
  useLayoutEffect(() => {
    const box = sidebar.current;
    const el = bar.current;
    if (!box || !el) return;
    const place = () => {
      const active = box.querySelector<HTMLElement>("a[aria-current=page]");
      if (!active || !active.offsetParent) {
        el.style.opacity = "0";
        return;
      }
      const a = active.getBoundingClientRect();
      // The sidebar scrolls when the menu is long, so measure in its content box.
      const top = a.top - box.getBoundingClientRect().top + box.scrollTop;
      el.style.opacity = "1";
      el.style.height = `${a.height}px`;
      el.style.transform = `translateY(${top}px)`;
    };
    place();
    const frame = requestAnimationFrame(() => (el.dataset.animate = "true"));
    const menuChanges = new MutationObserver(place);
    menuChanges.observe(box, { subtree: true, childList: true, attributeFilter: ["aria-current"] });
    const resizes = new ResizeObserver(place);
    resizes.observe(box);
    return () => {
      cancelAnimationFrame(frame);
      menuChanges.disconnect();
      resizes.disconnect();
    };
  }, []);

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
          // Drop anything a previous session left behind (QA #80: after
          // signing out, Back showed the sign-in buttons next to the old avatar).
          forgetSession();
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
            if (alive && !leavingRef.current)
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
        if (alive && !leavingRef.current) setAuthState("error");
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
    if (leavingRef.current) return;
    leavingRef.current = true;
    setLeaving(true);
    const destination =
      user?.accountKind === "SPEAKER" ? "/speaker-signin" : "/signin";
    try {
      await signOut(destination);
      forgetSession();
      // A document-level replacement clears the dashboard/router caches and
      // keeps Back from restoring protected UI after the cookie is gone.
      window.location.replace(destination);
    } catch {
      leavingRef.current = false;
      setErrors(["Could not sign out. Please try again."]);
      setLeaving(false);
    }
  }
  const unread = notices?.filter((n) => !n.readAt).length ?? 0;
  const nav = navFor(user, profile);
  // A speaker's profile is their visit form, so it stays in their rail.
  // Everyone else reaches it from the account menus.
  const sideNav = user?.accountKind === "SPEAKER" ? nav : nav.filter((item) => item !== "profile");
  const accountLinks = (
    <>
      <Link href="/dashboard/profile">My profile</Link>
      <Link href="/dashboard/notifications">
        Notifications{unread > 0 && <span className="d-count">{unread}</span>}
      </Link>
      <Link href="/dashboard/connections">MCP Connections</Link>
      <Link href="/dashboard/settings">Settings</Link>
    </>
  );
  const isBoardNav = !!user && runsWorkspace(user);
  const href = (item: Section) =>
    item === "overview" ? "/dashboard" : `/dashboard/${item}`;
  const searchResults = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    const allowed = navFor(user, profile);
    const rows: { label: string; detail: string; href: string }[] = allowed.map((item) => ({
      label: titleFor(item, user, profile),
      detail: "Dashboard section",
      href: href(item),
    }));
    for (const event of events ?? []) rows.push({
      label: event.title,
      detail: `Event${event.location ? ` · ${event.location}` : ""}`,
      href: "/dashboard/events",
    });
    if (user && runsWorkspace(user)) {
      for (const member of members ?? []) rows.push({
        label: member.name || member.email,
        detail: `Member · ${member.major || member.email}`,
        href: "/dashboard/members",
      });
      for (const guest of speakers ?? []) rows.push({
        label: guest.name || guest.email || "Speaker",
        detail: `Speaker${guest.organization ? ` · ${guest.organization}` : ""}`,
        href: "/dashboard/speakers",
      });
    }
    for (const notice of notices ?? []) rows.push({
      label: notice.message,
      detail: "Notification",
      href: "/dashboard/notifications",
    });
    return rows.filter((row) => !needle || `${row.label} ${row.detail}`.toLocaleLowerCase().includes(needle)).slice(0, 12);
  }, [events, members, notices, profile, query, speakers, user]);

  useEffect(() => {
    const openSearch = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLocaleLowerCase() === "k") {
        event.preventDefault();
        searchDialog.current?.showModal();
        requestAnimationFrame(() => searchInput.current?.focus());
      }
    };
    // <details> has no light dismiss; a click anywhere else closes the menus.
    const closeMenus = (event: PointerEvent) => {
      for (const menu of [accountMenu.current, sideMenu.current]) {
        if (menu?.open && !menu.contains(event.target as Node)) menu.removeAttribute("open");
      }
    };
    window.addEventListener("keydown", openSearch);
    window.addEventListener("pointerdown", closeMenus);
    return () => {
      window.removeEventListener("keydown", openSearch);
      window.removeEventListener("pointerdown", closeMenus);
    };
  }, []);

  const closeSearch = () => {
    searchDialog.current?.close();
    setQuery("");
  };
  return (
    <div className="dash" style={{ "--d-art": `url(/journey/${art}.webp?v=${process.env.NEXT_PUBLIC_ART_VERSION})` } as CSSProperties}>
      <a href="#dashboard-content" className="d-skip">
        Skip to content
      </a>
      <aside className="d-sidebar">
        <Link className="d-brand" href="/" aria-label="LOGICA home">
          <span className="d-logo-chip" aria-hidden="true"><Image src="/logica-logo-black.png" alt="" width={26} height={26} /></span>
          <span>
            LOGICA<small>{user ? roleName(user, profile) : "UIC"}</small>
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
          ref={sidebar}
          className={`d-sidebar-inner ${menu ? "is-open" : ""}`}
        >
          <span ref={bar} className="d-nav-bar" aria-hidden="true" />
          <nav aria-label="Dashboard">
            {sideNav.map((item, index) => (
              <Fragment key={item}>
                {/* Board nav runs to ten items. A rule where the club's
                    business ends and their own begins is the difference
                    between a list you scan and one you read. */}
                {isBoardNav &&
                  PERSONAL_SECTIONS.includes(item) &&
                  !PERSONAL_SECTIONS.includes(sideNav[index - 1]) && (
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
                {item === "teams" && !hintOff && !seen("teams") && (
                  <div className="d-callout" role="note">
                    <span>Apply for the software role here!</span>
                    <button type="button" aria-label="Dismiss" onClick={() => { snoozeTeamsHint(); setHintOff(true); }}>×</button>
                  </div>
                )}
              </Fragment>
            ))}
          </nav>
          <div className="d-sidebar-bottom">
            {/* Day-to-day chat is Discord's job; this dashboard holds the
                things that need a record. Hidden until the URL is set
                rather than guessed at. Profile, notifications and settings
                live in the account menus, not the rail. */}
            {process.env.NEXT_PUBLIC_DISCORD_URL && (
              <nav aria-label="Community">
                <a
                  href={process.env.NEXT_PUBLIC_DISCORD_URL}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Icon name="community" />
                  Discord
                </a>
              </nav>
            )}
            {user && (
              <div className="d-account">
                <details ref={sideMenu} className="d-account-menu d-side-menu">
                  <summary>
                    <Avatar name={profile?.name || user.name} photoUrl={profile?.photoUrl} />
                    <span>
                      <strong>
                        {profile?.name || user.name || "Your account"}
                      </strong>
                      <small>{roleName(user, profile)}</small>
                    </span>
                  </summary>
                  <nav aria-label="Your account" onClick={() => { sideMenu.current?.removeAttribute("open"); setMenu(false); }}>
                    {accountLinks}
                  </nav>
                </details>
                <button
                  aria-label="Sign out"
                  title="Sign out"
                  onClick={() => confirmOut.current?.showModal()}
                  disabled={leaving}
                >
                  <Icon name="exit" />
                </button>
                {/* ponytail: native <dialog> gives top layer, focus trap and Esc for free */}
                <dialog ref={confirmOut} className="d-confirm" aria-labelledby="d-confirm-title">
                  <h2 id="d-confirm-title">Sign out of LOGICA?</h2>
                  <p>You&apos;ll need your password to sign back in.</p>
                  <form method="dialog" className="d-actions">
                    <button className="d-button secondary" autoFocus>Cancel</button>
                    <button
                      type="button"
                      className="d-button"
                      disabled={leaving}
                      onClick={logout}
                    >
                      {leaving ? "Signing out…" : "Sign out"}
                    </button>
                  </form>
                </dialog>
              </div>
            )}
          </div>
        </div>
      </aside>
      <div
        className="d-workarea"
      >
        <header className="d-topbar">
          <span className="d-crumbs">
            <span>{speaker ? "Your visit" : user && runsWorkspace(user) ? "Workspace" : "Member home"}</span>
            <span aria-hidden="true">›</span>
            <strong>{titleFor(section, user, profile)}</strong>
          </span>
          <div>
            {user?.accountKind !== "SPEAKER" && (
              <button className="d-global-search" type="button" onClick={() => { searchDialog.current?.showModal(); requestAnimationFrame(() => searchInput.current?.focus()); }}>
                <Icon name="search" />
                <span>Search…</span>
                <kbd>{isMac ? "⌘" : "Ctrl"} K</kbd>
              </button>
            )}
            {user?.accountKind === "MEMBER" && (
              <Link className="d-button d-top-action" href="/dashboard/events">
                {runsWorkspace(user) ? "+ New" : "Find an event"}
              </Link>
            )}
            {user && (
              <>
                <Link
                  aria-label={`${unread} unread notifications`}
                  href="/dashboard/notifications"
                  className="d-bell"
                >
                  <Icon name="notifications" />
                  {unread > 0 && <i />}
                </Link>
                <details ref={accountMenu} className="d-account-menu">
                  <summary>
                    <Avatar name={profile?.name || user.name} photoUrl={profile?.photoUrl} className="d-avatar d-avatar-small" />
                    <span>Profile &amp; prefs</span>
                    <Icon name="chevron" />
                  </summary>
                  <nav aria-label="Profile and preferences" onClick={() => accountMenu.current?.removeAttribute("open")}>
                    {accountLinks}
                  </nav>
                </details>
              </>
            )}
          </div>
        </header>
        <dialog ref={searchDialog} className="d-search-dialog" aria-labelledby="d-search-title" onClose={() => setQuery("")} onClick={(event) => { if (event.target === event.currentTarget) closeSearch(); }}>
          <div className="d-search-dialog-head">
            <Icon name="search" />
            <label id="d-search-title" className="d-sr" htmlFor="dashboard-search">Search your LOGICA workspace</label>
            <input ref={searchInput} id="dashboard-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search sections and your permitted data…" />
            <button type="button" onClick={closeSearch} aria-label="Close search">Esc</button>
          </div>
          <div className="d-search-results">
            {searchResults.length ? searchResults.map((result, index) => (
              <Link key={`${result.href}-${result.label}-${index}`} href={result.href} onClick={closeSearch}>
                <span><strong>{result.label}</strong><small>{result.detail}</small></span>
                <Icon name="arrow" />
              </Link>
            )) : <p>No permitted results match “{query}”.</p>}
          </div>
          <p className="d-search-help">Search only includes dashboard data already loaded for your account.</p>
        </dialog>
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
              {seen("teams") && user && (
                <Pane active={section === "teams"}>
                  <BuildTeams user={user} profile={profile} />
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
