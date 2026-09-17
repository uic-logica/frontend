"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClubShell } from "@/components/club/ClubShell";
import { FourDots } from "@/components/brand/LogicaMark";

const memberNav = [
  { href: "/members", label: "Hub" },
  { href: "/feed", label: "Feed" },
  { href: "/profile", label: "Profile" },
  { href: "/events", label: "Events" },
  { href: "/attendance", label: "Attendance" },
];

type AppShellTone = "paper" | "ink";

function MemberToolNav({ tone }: { tone: AppShellTone }) {
  const pathname = usePathname();
  const isInk = tone === "ink";

  return (
    <div className={isInk ? "border-b border-white/15 bg-ink" : "border-b border-ink/10 bg-paper"}>
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-1 px-4 py-3 sm:px-6 lg:px-12">
        {memberNav.map((item) => {
          const active = pathname === item.href || (item.href !== "/members" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                active
                  ? isInk
                    ? "bg-signal text-ink"
                    : "bg-ink text-paper"
                  : isInk
                    ? "text-paper/70 hover:bg-white/10 hover:text-paper"
                    : "text-ink/70 hover:bg-ink/5 hover:text-ink"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
        <Link href="/" className="ml-auto text-sm font-semibold text-signal hover:underline">
          Public site
        </Link>
      </div>
    </div>
  );
}

/** Member-tool pages: club chrome + paper well + member secondary nav. */
export function AppShell({
  children,
  tone = "paper",
}: {
  children: React.ReactNode;
  tone?: AppShellTone;
}) {
  const isInk = tone === "ink";
  return (
    <ClubShell>
      <div className={isInk ? "min-h-[60vh] bg-ink text-paper" : "min-h-[60vh] bg-paper text-ink"}>
        <MemberToolNav tone={tone} />
        {children}
      </div>
    </ClubShell>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  tone = "paper",
}: {
  eyebrow: string;
  title: string;
  description?: string;
  tone?: AppShellTone;
}) {
  const isInk = tone === "ink";
  return (
    <header className={isInk ? "border-b border-white/15 bg-ink" : "border-b border-ink bg-paper"}>
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-12 lg:py-20">
        <FourDots />
        <p className={`type-label mt-4 ${isInk ? "text-signal" : "text-ink-muted"}`}>{eyebrow}</p>
        <h1 className={`type-h1 mt-3 max-w-3xl text-balance ${isInk ? "text-paper" : "text-ink"}`}>
          {title}
        </h1>
        {description && (
          <p className={`mt-4 max-w-measure text-body-lg ${isInk ? "text-paper/70" : "text-ink-muted"}`}>
            {description}
          </p>
        )}
      </div>
    </header>
  );
}

const MONOGRAM = ["ink", "signal"] as const;

export function monogramColor(id: string): (typeof MONOGRAM)[number] {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return MONOGRAM[Math.abs(hash) % MONOGRAM.length];
}

export function initials(name: string | null | undefined, fallback = "?") {
  if (!name?.trim()) return fallback;
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || fallback;
}

export function AvatarMonogram({
  id,
  name,
  size = "md",
}: {
  id: string;
  name?: string | null;
  size?: "sm" | "md" | "lg";
}) {
  const color = monogramColor(id);
  const dims =
    size === "sm" ? "h-10 w-10 text-sm" : size === "lg" ? "h-24 w-24 text-3xl" : "h-14 w-14 text-lg";
  const bg = color === "signal" ? "bg-signal text-paper" : "bg-ink text-paper";

  return (
    <div
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-display ${dims} ${bg}`}
      aria-hidden
    >
      {initials(name)}
    </div>
  );
}

export function RoleChip({ role }: { role: string }) {
  if (role === "MEMBER" || !role) return null;
  const exec = role === "EXEC_BOARD";
  return (
    <span
      className={`inline-flex h-6 items-center rounded-full px-2 type-label ${
        exec ? "bg-ink text-paper" : "bg-signal text-paper"
      }`}
    >
      {exec ? "Exec board" : "Board"}
    </span>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="card flex flex-col items-start gap-4 px-6 py-8">
      <FourDots />
      <h2 className="type-h3">{title}</h2>
      <p className="max-w-measure text-body-sm text-ink-muted">{body}</p>
      {action}
    </div>
  );
}

export function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="type-label text-ink">
        {label}
      </label>
      {error ? (
        <p id={`${id}-error`} className="text-caption text-signal" role="alert">
          {error}
        </p>
      ) : (
        hint && <p className="text-caption text-ink-muted">{hint}</p>
      )}
      {children}
    </div>
  );
}

export const inputClass =
  "min-h-12 w-full rounded-sm border-2 border-rule bg-paper px-3.5 text-body text-ink placeholder:text-ink-muted focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-signal";

export const inputErrorClass =
  "min-h-12 w-full rounded-sm border-2 border-signal bg-paper px-3.5 text-body text-ink placeholder:text-ink-muted focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-signal";

export const buttonClass =
  "inline-flex min-h-12 items-center justify-center rounded-sm bg-signal px-6 text-[17px] font-bold leading-5 tracking-[0.01em] text-paper shadow-block transition-[transform,box-shadow] enabled:hover:brightness-110 enabled:active:translate-x-0.5 enabled:active:translate-y-0.5 enabled:active:shadow-block-active disabled:opacity-60";
