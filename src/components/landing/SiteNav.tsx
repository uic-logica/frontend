"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LogicaMark } from "@/components/brand/LogicaMark";

/** Primary club nav — YCS pattern, Elenco ink + signal. */
const clubLinks = [
  { href: "/about", label: "About" },
  { href: "/events", label: "Events" },
  { href: "/team", label: "Team" },
  { href: "/join", label: "Join" },
];

export function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav className="fixed inset-x-0 top-0 z-30 flex w-full items-center justify-between bg-ink px-4 py-6 text-paper md:px-8 lg:px-12">
        <Link href="/" className="flex items-center gap-3 pl-1" aria-label="LOGICA home">
          <LogicaMark tone="on-ink" lockup="mark" size={35} />
          <span className="font-display text-2xl tracking-[0.06em] uppercase">LOGICA</span>
        </Link>

        <ul className="hidden items-center gap-10 text-lg font-semibold md:flex">
          {clubLinks.map((item) => {
            const active = pathname === item.href;
            return (
              <li key={item.href} className="relative">
                <Link
                  href={item.href}
                  className={`px-1 pb-1 transition-colors ${
                    active ? "text-signal" : "text-paper hover:text-signal"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
          <li>
            <Link
              href="/signin"
              className={`px-1 pb-1 transition-colors ${
                pathname === "/signin" || pathname === "/profile" || pathname === "/feed"
                  ? "text-signal"
                  : "text-paper/70 hover:text-signal"
              }`}
            >
              Members
            </Link>
          </li>
        </ul>

        <button
          type="button"
          className="inline-flex min-h-11 min-w-11 items-center justify-center border border-paper/40 text-paper md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">Menu</span>
          <span aria-hidden className="text-lg font-bold">
            {open ? "×" : "≡"}
          </span>
        </button>
      </nav>

      {/* spacer under fixed nav */}
      <div className="h-24" aria-hidden />

      {open && (
        <div
          id="mobile-nav"
          className="fixed inset-x-0 top-24 z-30 border-t border-paper/15 bg-ink px-4 py-4 md:hidden"
        >
          <ul className="flex flex-col gap-3 text-lg font-semibold">
            {[...clubLinks, { href: "/signin", label: "Members" }].map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block py-2 text-paper hover:text-signal"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
