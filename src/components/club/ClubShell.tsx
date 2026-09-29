"use client";

import Image from "next/image";
import { JourneyBackdrop, sceneFor, warmArt } from "./JourneyBackdrop";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

const links = [
  { href: "/about", label: "About" },
  { href: "/events", label: "Events" },
  { href: "/team", label: "Team" },
  { href: "/blog", label: "Blog" },
];

/** Where the capsule's white indicator last sat. Every page renders its own
 * ClubShell, so the nav remounts on navigation; remembering the old spot lets
 * the new indicator start there and slide over, like mapier.ai's. */
let lastBar: { x: number; y: number; w: number; h: number } | null = null;

/** Whether this visitor is signed in, checked once per page load; every page remounts the nav. */
let knownSignedIn: boolean | null = null;

/** Floating navigation with a glass capsule and responsive menu. */
export function SiteNav() {
  const pathname = usePathname();
  const capsule = useRef<HTMLDivElement>(null);
  const navLinks = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [open, setOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(knownSignedIn ?? false);
  const account = signedIn
    ? { href: "/dashboard", label: "Dashboard" }
    : { href: "/signin", label: "Sign in" };

  // Starts from the last answer so the label doesn't flicker, then re-checks (sign-out happens in the dashboard).
  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => (r.ok ? r.json() : null))
      .then((me) => setSignedIn((knownSignedIn = !!me?.user)))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 800);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // One white indicator slides under the active item (mapier.ai's segmented capsule).
  // Measured from the DOM: its size is the rendered text width.
  useLayoutEffect(() => {
    const box = capsule.current;
    const el = bar.current;
    if (!box || !el) return;
    const place = (animate: boolean) => {
      // Sign in sits outside the capsule; the indicator can travel over to it too.
      const active = navLinks.current?.querySelector<HTMLElement>("a[aria-current=page]");
      if (!active) {
        el.style.opacity = "0";
        lastBar = null;
        return;
      }
      const a = active.getBoundingClientRect();
      const c = box.getBoundingClientRect();
      const x = a.left - c.left;
      const y = a.top - c.top;
      el.dataset.animate = animate ? "true" : "";
      el.style.opacity = "1";
      el.style.width = `${a.width}px`;
      el.style.height = `${a.height}px`;
      el.style.transform = `translate(${x}px, ${y}px)`;
      lastBar = { x, y, w: a.width, h: a.height };
    };
    if (lastBar) {
      // Start where the previous page's indicator was, then slide on the next frame.
      el.style.opacity = "1";
      el.style.width = `${lastBar.w}px`;
      el.style.height = `${lastBar.h}px`;
      el.style.transform = `translate(${lastBar.x}px, ${lastBar.y}px)`;
      const frame = requestAnimationFrame(() => place(true));
      return () => cancelAnimationFrame(frame);
    }
    place(false);
  }, [pathname, isMobile]);

  return (
    <>
      <nav className="site-nav fixed z-20 flex w-full flex-row items-center justify-between bg-transparent p-6 text-white md:p-8">
        <Link href="/" className="pl-2 text-3xl font-extrabold" aria-label="LOGICA home">
          <Image src="/logica-logo-white.png" alt="LOGICA" width={56} height={56} priority />
        </Link>

        {isMobile ? (
          <div className="site-nav-mobile">
            <Link href={account.href} className="site-signin">
              {account.label}
            </Link>
            <button
              type="button"
              className="rounded-lg border border-white/40 px-3 py-2 text-white"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              <span className="sr-only">Menu</span>
              {open ? (
                "×"
              ) : (
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                  <path d="M4 7h16M4 12h16M4 17h16" />
                </svg>
              )}
            </button>
          </div>
        ) : (
          <div ref={navLinks} className="site-nav-links flex items-center gap-5 text-sm md:gap-6">
            <div ref={capsule} className="site-nav-capsule h-10">
              <span ref={bar} className="site-nav-bar" aria-hidden="true" />
              <ul className="relative flex gap-5 md:gap-6">
                {links.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <li key={item.href} className="relative flex h-10 items-center">
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={`nav-link transform px-1 pb-1.5 duration-100 ${
                          active ? "nav-link-active" : ""
                        }`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
            <Link
              href={account.href}
              aria-current={pathname === "/signin" ? "page" : undefined}
              className={`site-signin nav-link flex h-10 items-center px-1 pb-1.5 duration-100 ${
                pathname === "/signin" || pathname.startsWith("/members") ? "nav-link-active" : ""
              }`}
            >
              {account.label}
            </Link>
          </div>
        )}
      </nav>
      <div className="h-20 md:h-24" />

      {isMobile && open ? (
        <div className="site-mobile-menu fixed inset-x-0 top-20 z-20 border-t border-white/10 bg-white/[0.06] backdrop-blur-md px-8 py-4 md:top-24">
          <ul className="flex flex-col gap-4 text-lg">
            {links.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-white hover:text-signal" onClick={() => setOpen(false)}>
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href={account.href} className="text-signal" onClick={() => setOpen(false)}>
                {account.label}
              </Link>
            </li>
            {!signedIn && (
              <li>
                <Link href="/signup" className="text-white hover:text-signal" onClick={() => setOpen(false)}>
                  Create account
                </Link>
              </li>
            )}
          </ul>
        </div>
      ) : null}
    </>
  );
}

const legalLinks = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/support", label: "Support" },
];

/** Mapier-style closer: the footer sits on the end of the painting —
 * wordmark on the left, links stacked on the right, fine print below. */
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-in">
        <Link href="/" className="site-footer-mark" aria-label="LOGICA home">
          <Image src="/logica-logo-white.png" alt="" width={88} height={88} />
          <span>LOGICA</span>
        </Link>
        <nav className="site-footer-links" aria-label="Footer">
          {[...links, { href: "/join", label: "Join the team" }, { href: "/signin", label: "Sign in" }, { href: "/signup", label: "Create account" }].map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="site-footer-fine">
          <div>
            <span className="type-label">Get in touch with us</span>
            <a href="mailto:logica@uic.edu">logica@uic.edu</a>
          </div>
          <div>
            {legalLinks.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
            <span>© {new Date().getFullYear()} LOGICA @ UIC</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

/** Every route the nav and footer link to; their paintings are warmed once the page is idle. */
const artRoutes = ["/", "/about", "/events", "/team", "/blog", "/join", "/signin"];
let warmed = false;

export function ClubShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  useEffect(() => {
    if (warmed) return;
    warmed = true;
    // After this page's own painting has loaded, so the prefetch never competes with it.
    const start = () => warmArt(artRoutes.filter((r) => r !== pathname));
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1500));
    if (document.readyState === "complete") idle(start);
    else window.addEventListener("load", () => idle(start), { once: true });
  }, [pathname]);
  const scene = sceneFor(pathname);
  // The page is at least as tall as its painting, so the art's closing landmark
  // reaches the footer; a longer page continues in the painting's bottom colour.
  const stage = {
    "--art-ratio": scene.height / scene.width,
    "--art-ground": scene.ground,
    ...(scene.phone && { "--art-ratio-phone": scene.phone[1] / scene.phone[0], "--art-ground-phone": scene.phone[2] }),
  } as React.CSSProperties;
  return (
    <div className="club-shell min-h-screen text-white" data-home={pathname === "/"} data-route={pathname.split("/")[1] || "home"}>
      <div className="journey-stage" style={stage}>
        <JourneyBackdrop pathname={pathname} />
        <SiteNav />
        {children}
        <SiteFooter />
      </div>
    </div>
  );
}

/** Exact YCS PageContainer classes. */
export function PageContainer({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`page-container mb-20 px-4 sm:px-6 lg:px-12 pt-16 sm:pt-20 lg:pt-24 ${className}`}>
      {children}
    </div>
  );
}

/** Exact YCS SectionContainer classes. */
export function SectionContainer({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`site-section max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 mb-16 sm:mb-24 lg:mb-32 ${className}`}
    >
      {children}
    </section>
  );
}

/** @deprecated use SectionContainer — kept for other pages */
export function Section({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <SectionContainer className={className}>{children}</SectionContainer>;
}
