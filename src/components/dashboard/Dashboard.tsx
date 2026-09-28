"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { api, signOut } from "@/lib/api";
import { Icon } from "./Icon";
import { Overview, Activity, Notifications } from "./Overview";
import { ProfileEditor, Settings } from "./Profile";
import { Events, Community } from "./Participation";
import { Speakers } from "./Speakers";
import {
  type SessionUser,
  type Profile,
  type Event,
  type Engagement,
  type Notice,
  type Speaker,
  type Section,
  sections,
  titles,
  roleName,
  isBoard,
  initials,
} from "./types";
import "./dashboard.css";

/** Each section opens on its own night painting (logica.pen Variant E): [image, vertical position]. */
const art: Record<Section, [string, string]> = {
  overview: ["campus-night", "30%"], profile: ["skyline-night", "35%"], events: ["blue-line-night", "55%"],
  activity: ["pilsen-night", "45%"], community: ["lake-night", "55%"], speakers: ["journey-c-night", "8%"],
  notifications: ["golden-hour-night", "60%"], settings: ["journey-c-night", "88%"],
};

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
  const [errors, setErrors] = useState<string[]>([]);
  const [authState, setAuthState] = useState<
    "loading" | "ready" | "signed-out" | "error"
  >("loading");
  const [reload, setReload] = useState(0);
  const [menu, setMenu] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const sidebar = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLSpanElement>(null);

  // One white indicator slides between sidebar items as the section changes,
  // the same motion as the site nav's capsule. Measured from the DOM because
  // it depends on rendered layout; not animated on first placement.
  useLayoutEffect(() => {
    const box = sidebar.current;
    const el = bar.current;
    if (!box || !el) return;
    const active = box.querySelector<HTMLElement>("a[aria-current=page]");
    if (!active || !active.offsetParent) {
      el.style.opacity = "0";
      return;
    }
    const a = active.getBoundingClientRect();
    const top = a.top - box.getBoundingClientRect().top;
    el.style.opacity = "1";
    el.style.height = `${a.height}px`;
    el.style.transform = `translateY(${top}px)`;
    const frame = requestAnimationFrame(() => (el.dataset.animate = "true"));
    return () => cancelAnimationFrame(frame);
  }, [section, user]);

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
          read<Engagement>("/api/dashboard", "engagement", setEngagement),
          read<Notice[]>("/api/notifications", "notifications", setNotices),
          ...(isBoard(current)
            ? [
                read<Speaker[]>(
                  "/api/speakers",
                  "speaker submissions",
                  setSpeakers,
                ),
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
    document.title = `${titles[section]} · LOGICA`;
  }, [section]);
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
  const nav: Section[] = [
    "overview",
    "profile",
    "events",
    "activity",
    "community",
    ...(user && isBoard(user) ? ["speakers" as const] : []),
  ];
  const unread = notices?.filter((n) => !n.readAt).length ?? 0;
  const href = (item: Section) =>
    item === "overview" ? "/dashboard" : `/dashboard/${item}`;
  return (
    <div className="dash" style={{ "--d-art": `url(/journey/${art[section][0]}.webp?v=${process.env.NEXT_PUBLIC_ART_VERSION})`, "--d-art-y": art[section][1] } as CSSProperties}>
      <a href="#dashboard-content" className="d-skip">
        Skip to content
      </a>
      <aside className="d-sidebar">
        <Link className="d-brand" href="/dashboard">
          <Image src="/logica-logo-black.png" alt="" width={40} height={40} />
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
          ref={sidebar}
          className={`d-sidebar-inner ${menu ? "is-open" : ""}`}
        >
          <span ref={bar} className="d-nav-bar" aria-hidden="true" />
          <nav aria-label="Dashboard">
            {nav.map((item) => (
              <Link
                key={item}
                onClick={() => setMenu(false)}
                href={href(item)}
                aria-current={section === item ? "page" : undefined}
              >
                <Icon name={item} />
                {titles[item]}
                {item === "speakers" &&
                  !!speakers?.filter((s) => s.status === "PENDING").length && (
                    <span className="d-count">
                      {speakers.filter((s) => s.status === "PENDING").length}
                    </span>
                  )}
              </Link>
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
              <Link
                href="/dashboard/settings"
                aria-current={section === "settings" ? "page" : undefined}
              >
                <Icon name="settings" />
                Settings
              </Link>
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
                  <small>{roleName(user)}</small>
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
      <div
        className="d-workarea"
      >
        <header className="d-topbar">
          <span>
            <strong>{titles[section]}</strong>
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
        <main id="dashboard-content" className="d-main">
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
              {section === "overview" && (
                <Overview
                  user={user}
                  profile={profile}
                  events={events}
                  engagement={engagement}
                  speakers={speakers}
                  notices={notices}
                />
              )}
              {section === "profile" &&
                (profile ? (
                  <ProfileEditor
                    key={profile.id}
                    profile={profile}
                    user={user}
                    onSaved={setProfile}
                  />
                ) : (
                  !errors.length && <p role="status">Loading your profile…</p>
                ))}
              {section === "events" && (
                <Events
                  user={user}
                  events={events}
                  engagement={engagement}
                  onEngagement={setEngagement}
                  onEvents={setEvents}
                />
              )}
              {section === "activity" && <Activity engagement={engagement} />}
              {section === "community" && <Community user={user} />}
              {section === "speakers" &&
                (isBoard(user) ? (
                  <Speakers
                    user={user}
                    speakers={speakers}
                    onChange={setSpeakers}
                  />
                ) : (
                  <div className="d-empty">
                    <h1>Board access required</h1>
                    <p>This directory is available to LOGICA board members.</p>
                    <Link href="/dashboard">Return to your overview</Link>
                  </div>
                ))}
              {section === "notifications" && (
                <Notifications notices={notices} onChange={setNotices} />
              )}
              {section === "settings" && <Settings user={user} />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
