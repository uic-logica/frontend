"use client";

import "@/components/site/site.css";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SiteIcon } from "@/components/site/icons";
import { Painting } from "@/components/site/Painting";

const links = [
  { href: "/about", label: "About" },
  { href: "/events", label: "Events" },
  { href: "/team", label: "Team" },
  { href: "/projects", label: "Projects" },
  { href: "/blog", label: "Blog" },
];

/** Whether this visitor is signed in, checked once per page load. Every page renders its own
 * ClubShell, so the nav (and its phone menu) remounts closed on each navigation. */
let knownSignedIn: boolean | null = null;

/** The real logo: black on paper, white on charcoal. CSS shows the one for the current theme. */
export function Logo({ size, priority }: { size: number; priority?: boolean }) {
  return (
    <span className="site-logo" style={{ width: size, height: size }}>
      <Image className="only-light" src="/logica-logo-black.png" alt="" width={size} height={size} priority={priority} />
      <Image className="only-dark" src="/logica-logo-white.png" alt="" width={size} height={size} priority={priority} />
    </span>
  );
}

export function SiteNav() {
  const pathname = usePathname();
  // Light/dark follows the computer; it's changed only in dashboard Settings.
  // The root layout applies a saved choice on a full load; arriving by
  // client-side navigation from the dashboard re-applies it here.
  useEffect(() => {
    try {
      const saved = localStorage.getItem("logica-theme");
      if (saved === "light" || saved === "dark") document.documentElement.dataset.theme = saved;
      else delete document.documentElement.dataset.theme;
    } catch {}
  }, []);
  const [open, setOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(knownSignedIn ?? false);
  const account = signedIn ? { href: "/dashboard", label: "Dashboard" } : { href: "/signin", label: "Sign in" };

  // Starts from the last answer so the label doesn't flicker, then re-checks (sign-out happens in the dashboard).
  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => (r.ok ? r.json() : null))
      .then((me) => setSignedIn((knownSignedIn = !!me?.user)))
      .catch(() => {});
  }, []);

  return (
    <header className="site-nav">
      <div className="site-nav-in">
        <Link href="/" className="site-brand" aria-label="LOGICA home">
          <Logo size={36} priority />
          <span className="site-wordmark">LOGICA</span>
        </Link>
        <nav className="site-nav-links" aria-label="Main">
          {links.map((item) => (
            <Link key={item.href} href={item.href} aria-current={pathname.startsWith(item.href) ? "page" : undefined}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="site-nav-actions">
          <Link href={account.href} className="site-btn secondary sm site-nav-account" aria-current={pathname === account.href ? "page" : undefined}>
            {account.label}
          </Link>
          {!signedIn && (
            <Link href="/join" className="site-btn sm">
              Join
            </Link>
          )}
          <button type="button" className="site-menu-button" aria-expanded={open} aria-controls="site-menu" onClick={() => setOpen((v) => !v)}>
            <span className="sr-only">Menu</span>
            <SiteIcon name={open ? "close" : "menu"} size={20} />
          </button>
        </div>
      </div>
      {open && (
        <nav id="site-menu" className="site-menu" aria-label="Menu">
          {links.map((item) => (
            <Link key={item.href} href={item.href} aria-current={pathname.startsWith(item.href) ? "page" : undefined}>
              {item.label}
            </Link>
          ))}
          <Link href={account.href}>{account.label}</Link>
          {!signedIn && <Link href="/signup">Create account</Link>}
        </nav>
      )}
    </header>
  );
}

const footerColumns = [
  { label: "Explore", links: links },
  {
    label: "Get involved",
    links: [
      { href: "/join", label: "Join LOGICA" },
      { href: "/partner", label: "Partner with us" },
      { href: "/speak", label: "Speak at LOGICA" },
      { href: "/signin", label: "Sign in" },
    ],
  },
  {
    label: "Contact",
    links: [
      { href: "mailto:logica@uic.edu", label: "logica@uic.edu" },
      { href: "/support", label: "Support" },
      { href: "https://github.com/uic-logica", label: "GitHub" },
    ],
  },
];

/** The footer sits on the skyline painting, which fades up into the page. */
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <Painting name="footer" sizes="100vw" className="site-footer-art" />
      <div className="site-footer-in">
        <div className="site-footer-brand">
          <Link href="/" className="site-brand" aria-label="LOGICA home">
            <Logo size={48} />
            <span className="site-wordmark">LOGICA</span>
          </Link>
          <p>The Latinx computing community at the University of Illinois Chicago.</p>
        </div>
        <nav className="site-footer-links" aria-label="Footer">
          {footerColumns.map((column) => (
            <div key={column.label}>
              <h2>{column.label}</h2>
              <ul>
                {column.links.map((item) => (
                  <li key={item.href}>
                    {item.href.startsWith("/") ? <Link href={item.href}>{item.label}</Link> : <a href={item.href}>{item.label}</a>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
      <div className="site-footer-legal">
        <span>© {new Date().getFullYear()} LOGICA @ UIC</span>
        <span>
          <Link href="/privacy">Privacy</Link> · <Link href="/terms">Terms</Link>
        </span>
      </div>
    </footer>
  );
}

/** Every public page: nav, the page, the skyline footer. */
export function ClubShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="site" data-route={pathname.split("/")[1] || "home"}>
      <a href="#site-content" className="site-skip">Skip to content</a>
      <SiteNav />
      <div id="site-content" className="site-content">{children}</div>
      <SiteFooter />
    </div>
  );
}

/** A page's main column. */
export function PageContainer({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <main className={`site-page ${className}`}>{children}</main>;
}

/** One block inside a page's column. */
export function SectionContainer({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`site-section ${className}`}>{children}</section>;
}
