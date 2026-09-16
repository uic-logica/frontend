"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";

/** Match YCS: type the org name once, then blink the cursor. */
const FULL_TEXT = "LOGICA Community";
const TYPING_SPEED = 100;
const CURSOR_BLINK_SPEED = 530;

function subscribeReduced(cb: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

function getReduced() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function TypewriterLine() {
  const reduced = useSyncExternalStore(subscribeReduced, getReduced, () => true);
  const [displayText, setDisplayText] = useState(reduced ? FULL_TEXT : "");
  const [isTyping, setIsTyping] = useState(!reduced);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    if (reduced) {
      setDisplayText(FULL_TEXT);
      setIsTyping(false);
      return;
    }

    if (isTyping && displayText.length < FULL_TEXT.length) {
      const timeout = window.setTimeout(() => {
        setDisplayText(FULL_TEXT.slice(0, displayText.length + 1));
      }, TYPING_SPEED);
      return () => window.clearTimeout(timeout);
    }

    if (isTyping && displayText.length === FULL_TEXT.length) {
      setIsTyping(false);
    }
  }, [displayText, isTyping, reduced]);

  useEffect(() => {
    if (reduced) return;
    const cursorInterval = window.setInterval(() => {
      setShowCursor((prev) => !prev);
    }, CURSOR_BLINK_SPEED);
    return () => window.clearInterval(cursorInterval);
  }, [reduced]);

  return (
    <h1 className="text-3xl font-semibold text-white sm:text-5xl md:text-6xl">
      <span className="sr-only">{FULL_TEXT}</span>
      <span aria-hidden className="whitespace-normal sm:whitespace-nowrap">
        {displayText}
        <span className={`${showCursor ? "opacity-100" : "opacity-0"} transition-opacity duration-100`}>
          |
        </span>
      </span>
    </h1>
  );
}

/** Exact YCS ExploreLink classes, with LOGICA signal red. */
export function PinkLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  const cls = `group mt-3 inline-flex cursor-pointer items-center text-signal transition-colors duration-300 hover:text-white hover:underline ${className}`;
  const arrow = (
    <svg
      stroke="currentColor"
      fill="currentColor"
      strokeWidth="0"
      viewBox="0 0 24 24"
      className="ml-2"
      height="22"
      width="22"
      aria-hidden
    >
      <path d="M18.25 15.5a.75.75 0 0 1-.75-.75V7.56L7.28 17.78a.749.749 0 0 1-1.275-.326.749.749 0 0 1 .215-.734L16.44 6.5H9.25a.75.75 0 0 1 0-1.5h9a.75.75 0 0 1 .75.75v9a.75.75 0 0 1-.75.75Z" />
    </svg>
  );

  if (href.startsWith("mailto:") || href.startsWith("http")) {
    return (
      <a href={href} className={cls}>
        <span>{children}</span>
        {arrow}
      </a>
    );
  }

  return (
    <Link href={href} className={cls}>
      <span>{children}</span>
      {arrow}
    </Link>
  );
}
