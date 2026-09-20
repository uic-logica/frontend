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
            className="rounded-lg border border-white/40 px-3 py-2 text-white"
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

const legalLinks = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/support", label: "Support" },
];

/** Corner radius for the notch below — kept in one place since the mask math
 * and the piece's own box size both depend on it. */
const CORNER = 40;

/**
 * A flat-topped black box — the rounding lives in two small corner pieces
 * sitting right above it, not on the box itself. Each piece is ink-colored
 * with a radial-gradient mask: transparent (wallpaper showing through)
 * nearest the content above, opaque ink beyond the arc — so it reads as the
 * *picture's* corner curving away into the black, rather than the black
 * box curving up into the picture. Doing it this way (an overlay, not
 * `border-radius` + `overflow:hidden` on the actual fixed background) is
 * what keeps the fixed wallpaper untouched and jank-free.
 */
function CornerNotch({ side }: { side: "left" | "right" }) {
  return (
    <span
      aria-hidden
      className="absolute bottom-full bg-ink"
      style={{
        [side]: 0,
        width: CORNER,
        height: CORNER,
        // Centered on the corner nearest the content above (top-right for the
        // left piece, top-left for the right piece) — transparent there,
        // opaque by the time the arc reaches the true outer corner below it.
        maskImage: `radial-gradient(circle at top ${side === "left" ? "right" : "left"}, transparent ${CORNER - 1}px, black ${CORNER}px)`,
        WebkitMaskImage: `radial-gradient(circle at top ${side === "left" ? "right" : "left"}, transparent ${CORNER - 1}px, black ${CORNER}px)`,
      }}
    />
  );
}

/**
 * The wallpaper behind this is a genuinely fixed, unmoving background (see
 * globals.css) — the footer scrolling up over it, notched corners first, is
 * what creates the "rounded addition below the picture" look.
 */
export function SiteFooter() {
  return (
    // pb-3, not pb-2: at max scroll the footer's own box was landing ~0.5px
    // short of the true viewport bottom (a sub-pixel layout rounding
    // artifact), letting a hairline of the fixed wallpaper show through
    // beneath it. A few extra px of padding overshoots that safely.
    // No overflow-hidden here — the corner notches above are positioned
    // outside this box on purpose (bottom-full), and clipping would cut
    // them off. The glow blur is soft enough not to need containment.
    <footer className="relative flex flex-col items-center bg-ink pb-3 text-white">
      <CornerNotch side="left" />
      <CornerNotch side="right" />

      {/* A soft ember glow behind the mark — the one warm accent in an
          otherwise flat black section, so it reads as a deliberate close to
          the page instead of a plain text block floating in a void.
          Confined to its own clipped wrapper, not the footer itself: the
          glow (420px) is taller than the footer's own content, and with
          nothing to clip it, that excess was inflating the page's real
          scroll height — leaving an actual gap of wallpaper below the
          footer at max scroll, not just a sub-pixel one. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute left-1/2 top-0 h-[420px] w-[720px] -translate-x-1/2 rounded-full opacity-30 blur-[100px]"
          style={{ background: "radial-gradient(closest-side, var(--color-ember), transparent)" }}
        />
      </div>

      <div className="relative mt-16 flex flex-col items-center">
        <Image src="/logica-logo-white.png" alt="LOGICA" width={64} height={64} className="h-16 w-16" />
        <p className="type-label mt-5 text-white/50">Get in touch with us</p>
        <div className="mt-4 flex items-center justify-center gap-6">
          <a
            href="mailto:logica@uic.edu"
            className="inline-flex h-10 w-10 items-center justify-center transition-transform hover:scale-110"
            aria-label="Email"
          >
            <svg viewBox="0 0 512 512" height="26" width="26" fill="currentColor" aria-hidden>
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
      </div>

      <div className="relative mx-auto mt-14 flex w-full max-w-7xl flex-col items-center gap-3 border-t border-ember/50 px-4 py-6 text-sm text-white/60 sm:flex-row sm:justify-between sm:px-6 lg:px-12">
        <span>© {new Date().getFullYear()} LOGICA @ UIC</span>
        <div className="flex items-center gap-6">
          {legalLinks.map((item) => (
            <Link key={item.href} href={item.href} className="text-white/70 hover:text-white">
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}

export function ClubShell({ children }: { children: React.ReactNode }) {
  // No bg here — body already paints the fixed wallpaper. SiteFooter's own
  // rounded-top black box is what caps it off; nothing in between needed.
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
