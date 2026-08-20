"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "./Logo";
import { Button } from "./Button";
import {
  featureLinks,
  whoWeServeBusiness,
  whoWeServeConcept,
  compareLinks,
  resourceLinks,
} from "./nav-data";

type NavItem = { label: string; href: string };

function Dropdown({
  label,
  columns,
}: {
  label: string;
  columns: { heading?: string; items: NavItem[] }[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        className="flex items-center gap-1 py-2 text-sm text-ink-muted hover:text-ink transition-colors"
        aria-expanded={open}
      >
        {label}
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true">
          <path
            d="M1 1L5 5L9 1"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {open && (
        <div className="absolute left-1/2 top-full z-50 flex -translate-x-1/2 gap-8 rounded-xl border border-border bg-surface-4 p-6 shadow-xl shadow-ink/5">
          {columns.map((col, i) => (
            <div key={i} className="min-w-[210px]">
              {col.heading && (
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  {col.heading}
                </p>
              )}
              <ul className="space-y-1">
                {col.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="block rounded-md px-2 py-1.5 text-sm text-ink-muted hover:bg-surface-1 hover:text-ink"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MobileGroup({ heading, items }: { heading: string; items: NavItem[] }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-soft">
        {heading}
      </p>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className="block py-1.5 text-[15px] text-ink">
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 rail border-b border-border bg-surface-4/90 backdrop-blur">
      <div className="container-page flex h-[72px] items-center justify-between">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-6 lg:flex">
            <Dropdown label="Features" columns={[{ items: featureLinks }]} />
            <Link
              href="/why-dishbooks"
              className="py-2 text-sm text-ink-muted hover:text-ink transition-colors"
            >
              Why DishBooks
            </Link>
            <Dropdown
              label="Who We Serve"
              columns={[
                { heading: "Business Type", items: whoWeServeBusiness },
                { heading: "Concept Type", items: whoWeServeConcept },
              ]}
            />
            <Dropdown label="Compare" columns={[{ items: compareLinks }]} />
            <Link
              href="/pricing"
              className="py-2 text-sm text-ink-muted hover:text-ink transition-colors"
            >
              Pricing
            </Link>
            <Dropdown label="Resources" columns={[{ items: resourceLinks }]} />
            <Link
              href="/contact"
              className="py-2 text-sm text-ink-muted hover:text-ink transition-colors"
            >
              Contact
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Button
            href="https://app.dishbooks.com/login"
            variant="ghost"
            size="md"
            className="hidden sm:inline-flex"
          >
            Sign in
          </Button>
          <Button href="/signup" variant="primary" size="md" className="hidden sm:inline-flex">
            Get Started
          </Button>
          <button
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            className="ml-1 flex h-10 w-10 items-center justify-center rounded-full border border-border text-ink lg:hidden"
          >
            {mobileOpen ? (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <path d="M3 3L15 15M15 3L3 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <path d="M2 5H16M2 9H16M2 13H16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="max-h-[calc(100vh-72px)] overflow-y-auto border-t border-border bg-surface-4 lg:hidden">
          <div className="container-page grid gap-8 py-6 sm:grid-cols-2">
            <MobileGroup heading="Features" items={featureLinks} />
            <MobileGroup heading="Who We Serve — Business Type" items={whoWeServeBusiness} />
            <MobileGroup heading="Who We Serve — Concept Type" items={whoWeServeConcept} />
            <MobileGroup heading="Compare" items={compareLinks} />
            <MobileGroup heading="Resources" items={resourceLinks} />
            <MobileGroup
              heading="Company"
              items={[
                { label: "Why DishBooks", href: "/why-dishbooks" },
                { label: "Pricing", href: "/pricing" },
                { label: "Contact", href: "/contact" },
              ]}
            />
          </div>
          <div className="container-page flex gap-3 border-t border-border py-5">
            <Button
              href="https://app.dishbooks.com/login"
              variant="secondary"
              className="flex-1 justify-center"
            >
              Sign in
            </Button>
            <Button href="/signup" className="flex-1 justify-center">
              Get Started
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
