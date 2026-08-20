import Link from "next/link";
import type { ReactNode } from "react";

type CrossLink = { label: string; href: string };

export function SectionBlock({
  eyebrow,
  title,
  children,
  crossLinks,
  tone = "default",
  className = "",
}: {
  eyebrow?: string;
  title: string;
  children: ReactNode;
  crossLinks?: CrossLink[];
  tone?: "default" | "muted";
  className?: string;
}) {
  return (
    <section className={`section-y ${tone === "muted" ? "bg-surface-2" : ""} ${className}`}>
      <div className="container-page max-w-3xl">
        {eyebrow && <p className="kicker mb-3">{eyebrow}</p>}
        <h2 className="h2">{title}</h2>
        <div className="body-lg mt-4 space-y-4">{children}</div>
        {crossLinks && crossLinks.length > 0 && (
          <p className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[15px]">
            <span className="text-ink-soft">Learn more:</span>
            {crossLinks.map((link, i) => (
              <span key={link.href} className="flex items-center gap-2">
                <Link
                  href={link.href}
                  className="font-medium text-primary-600 hover:text-primary-700"
                >
                  {link.label} →
                </Link>
                {i < crossLinks.length - 1 && (
                  <span className="text-ink-soft">·</span>
                )}
              </span>
            ))}
          </p>
        )}
      </div>
    </section>
  );
}
