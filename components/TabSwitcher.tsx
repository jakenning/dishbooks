"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MockPanel } from "./MockPanel";
import { ArrowRight, BulletList } from "./icons";

type Tab = {
  label: string;
  kicker: string;
  title: string;
  description: string;
  points: string[];
  href: string;
  variant: "primary" | "cyan" | "violet";
  kind: "chart" | "chat" | "table";
  /** Product shot from the design; falls back to MockPanel when absent. */
  image?: { src: string; alt: string; width: number; height: number };
};

export function TabSwitcher({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = useState(0);
  const tab = tabs[active];

  return (
    <div>
      <div
        role="tablist"
        aria-label="DishBooks features"
        className="flex flex-wrap gap-1 rounded-full bg-surface-veil p-1"
      >
        {tabs.map((t, i) => (
          <button
            key={t.label}
            role="tab"
            aria-selected={i === active}
            onClick={() => setActive(i)}
            className={`relative flex-1 whitespace-nowrap rounded-full px-6 py-3 text-base font-semibold transition-colors ${
              i === active
                ? "bg-gradient-button text-white"
                : "bg-surface-4 text-[color:var(--color-ink-button)] hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div key={active} className="mt-12 grid items-center gap-10 md:grid-cols-2 md:gap-16">
        <div>
          <p className="kicker">{tab.kicker}</p>
          <h3 className="h2 mt-3">{tab.title}</h3>
          <p className="body-lg mt-4">{tab.description}</p>
          <div className="mt-6">
            <BulletList items={tab.points} />
          </div>
          <Link
            href={tab.href}
            className="mt-6 inline-flex items-center gap-2 font-semibold text-primary-500 transition-colors hover:text-primary-600"
          >
            Learn more about {tab.label}
            <ArrowRight />
          </Link>
        </div>
        {tab.image ? (
          <Image
            src={tab.image.src}
            alt={tab.image.alt}
            width={tab.image.width}
            height={tab.image.height}
            sizes="(min-width: 768px) 50vw, 100vw"
            className="h-auto w-full rounded-2xl bg-surface-4 object-cover"
          />
        ) : (
          <MockPanel variant={tab.variant} kind={tab.kind} />
        )}
      </div>
    </div>
  );
}
