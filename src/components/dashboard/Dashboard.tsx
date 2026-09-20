"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
  titles,
  roleName,
  isBoard,
  initials,
} from "./types";
import "./dashboard.css";

export function Dashboard({ section }: { section: Section }) {
  const router = useRouter();
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
          <div className="d-workspace">
            <span className="d-workspace-dot" />
            {user ? roleName(user) : "Your"} workspace
          </div>
          <nav aria-label="Workspace">
            <span className="d-nav-label">Your space</span>
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
              <Link href="/">
                <Icon name="arrow" />
                Visit public site
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
      <div className="d-workarea">
        <header className="d-topbar">
          <span>
            Workspace <span className="d-slash">/</span>{" "}
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
              <span className="sr-only">Loading your workspace</span>
              <div />
              <div />
              <div />
            </div>
          )}
          {authState === "signed-out" && (
            <div className="d-panel d-welcome">
              <h1>Your space at LOGICA.</h1>
              <p>Sign in to see your profile, events, and club activity.</p>
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
              We couldn’t connect to your workspace.{" "}
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
        <footer className="d-footer">
          <span>Logic × growth.</span>
          <span>Built for the people of LOGICA.</span>
        </footer>
      </div>
    </div>
  );
}
