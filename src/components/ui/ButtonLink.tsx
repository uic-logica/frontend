import Link from "next/link";

type ButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: "signal" | "ink" | "outline" | "outline-ink";
  size?: "md" | "lg";
  className?: string;
};

const fills = {
  signal: "bg-signal text-paper hover:brightness-110",
  ink: "bg-ink text-paper hover:bg-ink/90",
  outline: "bg-transparent text-paper border border-paper hover:bg-paper hover:text-ink",
  "outline-ink": "bg-transparent text-ink border border-ink hover:bg-ink hover:text-paper",
} as const;

const sizes = {
  md: "min-h-12 px-6 text-[17px] leading-5",
  lg: "min-h-14 px-8 text-xl leading-5",
} as const;

export function ButtonLink({
  href,
  children,
  variant = "signal",
  size = "md",
  className = "",
}: ButtonProps) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center rounded-sm font-bold tracking-[0.01em] shadow-block transition-[transform,box-shadow] active:translate-x-0.5 active:translate-y-0.5 active:shadow-block-active ${fills[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </Link>
  );
}
