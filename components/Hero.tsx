import type { ReactNode } from "react";
import { Button } from "./Button";

type HeroProps = {
  kicker: string;
  title: ReactNode;
  subhead: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  align?: "left" | "center";
};

export function Hero({
  kicker,
  title,
  subhead,
  primaryCta,
  secondaryCta,
  align = "left",
}: HeroProps) {
  const isCenter = align === "center";
  return (
    <section className="relative section-y overflow-hidden bg-surface-1">
      <div className="blob-field">
        <div
          className="blob -left-24 -top-32 h-[420px] w-[420px] bg-accent-cyan/50"
          aria-hidden="true"
        />
        <div
          className="blob -right-32 top-10 h-[380px] w-[380px] bg-primary-400/50"
          aria-hidden="true"
        />
        <div
          className="blob left-1/3 top-40 h-[320px] w-[320px] bg-accent-violet/30"
          aria-hidden="true"
        />
      </div>

      <div
        className={`container-page relative z-10 ${isCenter ? "text-center" : ""} flex flex-col ${
          isCenter ? "items-center" : "items-start"
        }`}
      >
        <p className="kicker flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-gradient-brand" aria-hidden="true" />
          {kicker}
        </p>
        <h1 className="h1 mt-4 max-w-3xl">{title}</h1>
        <p className="body-lg mt-5 max-w-xl">{subhead}</p>
        {(primaryCta || secondaryCta) && (
          <div className="mt-8 flex flex-wrap items-center gap-3">
            {primaryCta && (
              <Button href={primaryCta.href} size="lg">
                {primaryCta.label}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path
                    d="M3.5 8H12.5M12.5 8L8.5 4M12.5 8L8.5 12"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Button>
            )}
            {secondaryCta && (
              <Button href={secondaryCta.href} variant="secondary" size="lg">
                {secondaryCta.label}
              </Button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
