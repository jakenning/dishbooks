import Link from "next/link";
import type { ReactNode } from "react";

type ButtonProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "gradient" | "ghost" | "inverse";
  size?: "md" | "lg";
  className?: string;
};

const base =
  "relative inline-flex items-center justify-center gap-2 rounded-full transition-all duration-200 whitespace-nowrap";

const variants = {
  // `btn-glow` paints the blurred halo the design puts behind solid buttons.
  primary: "btn-glow bg-gradient-button text-white hover:-translate-y-0.5",
  secondary:
    "bg-surface-4 text-[color:var(--color-ink-button)] shadow-[0_2px_15px_rgb(130_130_130/0.18)] hover:-translate-y-0.5",
  // White pill whose label carries the display gradient — the "Meet Dex" CTA.
  gradient:
    "bg-surface-4 text-gradient-brand shadow-[0_2px_15px_rgb(130_130_130/0.18)] hover:-translate-y-0.5",
  ghost: "text-ink-muted hover:text-ink",
  inverse:
    "bg-white text-[color:var(--color-ink-button)] hover:-translate-y-0.5",
};

const sizes = {
  md: "px-4 py-2 text-xs font-medium",
  lg: "px-6 py-3 text-base font-semibold",
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
