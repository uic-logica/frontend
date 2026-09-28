"use client";

import Image from "next/image";
import { JourneyBackdrop, sceneFor } from "./JourneyBackdrop";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const links = [
  { href: "/about", label: "About" },
  { href: "/events", label: "Events" },
  { href: "/team", label: "Team" },
  { href: "/blog", label: "Blog" },
];

/** Floating navigation with a warm glass capsule and responsive menu. */
export function SiteNav() {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 800);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <nav className="site-nav fixed z-20 flex w-full flex-row items-center justify-between bg-transparent p-6 text-white md:p-8">
        <Link href="/" className="pl-2 text-3xl font-extrabold" aria-label="LOGICA home">
          <Image src="/logica-logo-white.png" alt="LOGICA" width={56} height={56} priority />
        </Link>

        {isMobile ? (
          <div className="site-nav-mobile">
            <Link href="/signin" className="site-signin">
              Sign in
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
          <div className="site-nav-links flex items-center gap-5 text-sm md:gap-6">
            <div className="site-nav-capsule h-10 overflow-hidden">
              <ul className="flex gap-5 md:gap-6">
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
              href="/signin"
              className={`site-signin nav-link flex h-10 items-center px-1 pb-1.5 duration-100 ${
                pathname === "/signin" || pathname.startsWith("/members") ? "nav-link-active" : ""
              }`}
            >
              Sign in
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
              <Link href="/signin" className="text-signal" onClick={() => setOpen(false)}>
                Sign in
              </Link>
            </li>
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
          {[...links, { href: "/join", label: "Join" }, { href: "/signin", label: "Sign in" }].map((item) => (
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

export function ClubShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const scene = sceneFor(pathname);
  // The page is at least as tall as its painting, so the art's closing landmark
  // always sits behind the footer. Panned scenes (start > 0) are much taller than any page.
  const ratios = scene.start
    ? undefined
    : ({ "--art-ratio": scene.height / scene.width, "--art-ratio-phone": scene.mobile ? scene.mobile[2] / scene.mobile[1] : undefined } as React.CSSProperties);
  return (
    <div className="club-shell min-h-screen text-white" data-home={pathname === "/"} data-route={pathname.split("/")[1] || "home"}>
      <div className="journey-stage" style={ratios}>
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
