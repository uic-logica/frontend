import Link from "next/link";

type ButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "outline";
  size?: "md" | "lg";
  className?: string;
};

// Matches the homepage CTAs (page.tsx): rounded pill, flat fill, hover lift.
const fills = {
  primary: "bg-white text-black hover:-translate-y-0.5",
  outline: "text-white ring-1 ring-white/15 hover:bg-white/5 hover:ring-white/25",
} as const;

const sizes = {
  md: "px-6 py-2.5 text-sm",
  lg: "px-8 py-3 text-lg",
} as const;

/** For plain <a> elements (mailto:, external) that can't use next/link. */
export function buttonClasses(
  variant: keyof typeof fills = "primary",
  size: keyof typeof sizes = "md",
) {
  return `inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-300 ${fills[variant]} ${sizes[size]}`;
}

export function ButtonLink({
  href,
  children,
  variant = "primary",
  size = "md",
  className = "",
}: ButtonProps) {
  return (
    <Link href={href} className={`${buttonClasses(variant, size)} ${className}`}>
      {children}
    </Link>
  );
}
