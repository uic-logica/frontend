import type { CSSProperties } from "react";
import styles from "./Typewriter.module.css";

export const HERO_REVEAL_DURATION = 1600;
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
