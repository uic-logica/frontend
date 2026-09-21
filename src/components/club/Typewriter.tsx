import Link from "next/link";
import type { CSSProperties } from "react";
import styles from "./Typewriter.module.css";

export const HERO_REVEAL_DURATION = 2350;
const FULL_TEXT = "LOGICA @ UIC";

/** CSS shares the logo's initial-render clock, including before hydration. */
export function TypewriterLine() {
  return (
    <h1 className="text-3xl font-semibold text-white sm:text-5xl md:text-6xl">
      <span className="sr-only">{FULL_TEXT}</span>
      <span aria-hidden className="whitespace-normal sm:whitespace-nowrap">
        {Array.from(FULL_TEXT).map((character, index) => (
          <span
            key={index}
            className={styles.character}
            style={{ "--character-delay": `${((index + 1) / FULL_TEXT.length) * HERO_REVEAL_DURATION}ms` } as CSSProperties}
          >
            {character}
          </span>
        ))}
        <span className={styles.cursor}>|</span>
      </span>
    </h1>
  );
}

/** Exact YCS ExploreLink classes, with LOGICA signal gold. */
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
