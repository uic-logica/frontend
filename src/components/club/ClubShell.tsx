"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const links = [
  { href: "/about", label: "About" },
  { href: "/events", label: "Events" },
  { href: "/team", label: "Team" },
  { href: "/blog", label: "Blog" },
];

/** Fixed black nav + spacer. No gradient bar. */
export function SiteNav() {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const [open, setOpen] = useState(false);
  const [hideLinks, setHideLinks] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 800);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    let lastY = window.scrollY;
    const handleScroll = () => {
      const y = window.scrollY;
      setHideLinks(y > lastY && y > 80);
      lastY = y;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav className="fixed z-20 flex w-full flex-row items-center justify-between bg-transparent p-6 text-white md:p-8">
        <Link href="/" className="pl-2 text-3xl font-extrabold" aria-label="LOGICA home">
          <Image src="/logica-logo-white.png" alt="LOGICA" width={56} height={56} priority />
        </Link>

        {isMobile ? (
          <button
            type="button"
            className="border border-white/40 px-3 py-2 text-white"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">Menu</span>
            {open ? "×" : "≡"}
          </button>
        ) : (
          <div className="flex items-center gap-5 text-sm md:gap-6">
            <div className="h-10 overflow-hidden">
              <ul
                className={`flex gap-5 transition-transform duration-300 ease-out md:gap-6 ${
                  hideLinks ? "-translate-y-12" : "translate-y-0"
                }`}
              >
                {links.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <li key={item.href} className="relative flex h-10 items-center">
                      <Link
                        href={item.href}
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
              className={`nav-link flex h-10 items-center px-1 pb-1.5 duration-100 ${
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
        <div className="fixed inset-x-0 top-20 z-20 border-t border-white/10 bg-white/[0.06] backdrop-blur-md px-8 py-4 md:top-24">
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

export function SiteFooter() {
  return (
    <footer className="z-20 flex flex-col items-center text-white">
      <div className="mb-3 text-xl text-white">Get in touch with us</div>
      <div className="flex items-center justify-center gap-6 px-3 py-2">
        <a
          href="mailto:logica@uic.edu"
          className="inline-flex h-10 w-10 items-center justify-center transition-transform hover:scale-110"
          aria-label="Email"
        >
          <svg viewBox="0 0 512 512" height="28" width="28" fill="currentColor" aria-hidden>
            <path d="M464 64H48C21.49 64 0 85.49 0 112v288c0 26.51 21.49 48 48 48h416c26.51 0 48-21.49 48-48V112c0-26.51-21.49-48-48-48zm0 48v40.805c-22.422 18.259-58.168 46.651-134.587 106.49-16.841 13.247-50.201 45.072-73.413 44.701-23.208.375-56.579-31.459-73.413-44.701C106.18 199.465 70.425 171.067 48 152.805V112h416zM48 400V214.398c22.914 18.251 55.409 43.862 104.938 82.646 21.857 17.205 60.134 55.186 103.062 54.955 42.717.231 80.509-37.199 103.053-54.947 49.528-38.783 82.032-64.401 104.947-82.653V400H48z" />
          </svg>
        </a>
        <Link href="/join" className="text-lg font-semibold leading-none text-signal hover:underline">
          Join
        </Link>
        <Link href="/signin" className="text-lg font-semibold leading-none text-white hover:text-signal">
          Sign in
        </Link>
      </div>
      <div className="mb-6 mt-4 text-sm text-white">LOGICA @ UIC © {new Date().getFullYear()}</div>
    </footer>
  );
}

export function ClubShell({ children }: { children: React.ReactNode }) {
  // No bg here — body already paints black. A bg on this wrapper covers the
  // fixed -z-10 canvas/watermark (same stacking as yalecomputersociety.org).
  return (
    <div className="min-h-screen text-white">
      <SiteNav />
      {children}
      <SiteFooter />
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
    <div className={`mb-20 px-4 sm:px-6 lg:px-12 pt-16 sm:pt-20 lg:pt-24 ${className}`}>
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
      className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 mb-16 sm:mb-24 lg:mb-32 ${className}`}
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
