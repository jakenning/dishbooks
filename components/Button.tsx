import Link from "next/link";
import type { ReactNode } from "react";

type ButtonProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "inverse";
  size?: "md" | "lg";
  className?: string;
};

const base =
  "inline-flex items-center justify-center gap-1.5 font-semibold rounded-full transition-all duration-200 whitespace-nowrap";

const variants = {
  primary:
    "bg-gradient-brand text-white shadow-glow-primary hover:shadow-glow-violet hover:-translate-y-0.5",
  secondary:
    "bg-surface-4 text-ink border border-border hover:border-primary-300 hover:text-primary-600",
  ghost: "text-ink-muted hover:text-ink",
  inverse: "bg-white text-primary-900 hover:bg-primary-100",
};

const sizes = {
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3.5 text-[15px]",
};

export function Button({
  href,
  children,
  variant = "primary",
  size = "md",
  className = "",
}: ButtonProps) {
  return (
    <Link
      href={href}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </Link>
  );
}
