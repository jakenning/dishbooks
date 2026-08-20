"use client";

import { useState } from "react";
import Link from "next/link";
import { MockPanel } from "./MockPanel";

type Tab = {
  label: string;
  kicker: string;
  title: string;
  description: string;
  points: string[];
  href: string;
  variant: "primary" | "cyan" | "violet";
  kind: "chart" | "chat" | "table";
};

export function TabSwitcher({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = useState(0);
  const tab = tabs[active];

  return (
    <div>
      <div
        role="tablist"
        aria-label="DishBooks features"
        className="flex flex-wrap gap-1 rounded-full border border-border bg-surface-4 p-1"
      >
        {tabs.map((t, i) => (
          <button
            key={t.label}
            role="tab"
            aria-selected={i === active}
            onClick={() => setActive(i)}
            className={`relative flex-1 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-medium transition-colors ${
              i === active
                ? "bg-gradient-brand text-white shadow-glow-primary"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div key={active} className="mt-10 grid items-center gap-10 md:grid-cols-2">
        <div>
          <p className="kicker">{tab.kicker}</p>
          <h3 className="h2 mt-3">{tab.title}</h3>
          <p className="body-base mt-4">{tab.description}</p>
          <ul className="mt-5 space-y-2">
            {tab.points.map((point) => (
              <li key={point} className="flex items-start gap-2.5 text-[15px] text-ink">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-brand" />
                {point}
              </li>
            ))}
          </ul>
          <Link
            href={tab.href}
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700"
          >
            Learn more about {tab.label}
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M3.5 8H12.5M12.5 8L8.5 4M12.5 8L8.5 12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>
        <MockPanel variant={tab.variant} kind={tab.kind} />
      </div>
    </div>
  );
}
