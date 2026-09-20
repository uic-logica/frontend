import type { ReactNode } from "react";
import { tornEdgeClipPath } from "@/lib/tornEdge";

/**
 * A quiet, opaque, geometric container — the deliberate opposite of trying to
 * visually match the wallpaper's chaos with glass or brush effects.
 *
 * `ink`: flat black, sharp corners, thin signal-gold top rule.
 * `torn`: flat black, but a jagged clip-path edge so the panel reads as cut
 * from the same paper-collage material as the wallpaper, instead of a
 * foreign UI shape laid on top of it.
 */
export function Panel({
  variant,
  seed,
  className = "",
  contentClassName = "p-8",
  children,
}: {
  variant: "ink" | "torn";
  seed: string;
  className?: string;
  contentClassName?: string;
  children: ReactNode;
}) {
  if (variant === "ink") {
    return (
      <div className={`relative bg-black ${className}`}>
        <span aria-hidden className="absolute inset-x-0 top-0 h-1 bg-signal" />
        <div className={contentClassName}>{children}</div>
      </div>
    );
  }

  return (
    <div className={`relative bg-black ${className}`} style={{ clipPath: tornEdgeClipPath(seed) }}>
      <div className={contentClassName}>{children}</div>
    </div>
  );
}
