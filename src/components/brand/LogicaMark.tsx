import Image from "next/image";

/**
 * Official LOGICA mark — circuit-tree in a circle.
 * Uses the verified logo asset (not a redrawn SVG).
 */
type Props = {
  tone?: "on-ink" | "on-paper";
  /** Show wordmark under the circle (full lockup) or mark only. */
  lockup?: "full" | "mark";
  className?: string;
  /** Mark height in px. */
  size?: number;
};

export function LogicaMark({
  tone = "on-paper",
  lockup = "full",
  className = "",
  size = 40,
}: Props) {
  const wordSize = Math.max(12, Math.round(size * 0.28));
  const invert = tone === "on-paper";

  return (
    <span className={`inline-flex flex-col items-center gap-1 ${className}`}>
      <Image
        src="/logo-nav.png"
        alt={lockup === "mark" ? "LOGICA" : ""}
        width={Math.round(size * (308 / 282))}
        height={size}
        className={invert ? "h-auto invert" : "h-auto"}
        style={{ height: size, width: "auto" }}
        aria-hidden={lockup === "full" ? true : undefined}
      />
      {lockup === "full" && (
        <span
          className="font-display uppercase leading-none tracking-[0.12em]"
          style={{
            color: tone === "on-ink" ? "#FFFFFF" : "#000000",
            fontSize: wordSize,
          }}
        >
          LOGICA
        </span>
      )}
    </span>
  );
}

/** Villela Elenco motif — four red dots = harmony. */
export function FourDots({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`} aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <span key={i} className="h-1.5 w-1.5 rounded-full bg-signal" />
      ))}
    </span>
  );
}
