import type { ReactNode } from "react";

/** Shared rounded glass surface; legacy variants retain the same content API. */
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
  return (
    <div className={`journey-panel relative ${className}`} data-variant={variant} data-seed={seed}>
      <div className={contentClassName}>{children}</div>
    </div>
  );
}
