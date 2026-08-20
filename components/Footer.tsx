import Link from "next/link";
import { Logo } from "./Logo";
import {
  featureLinks,
  whoWeServeBusiness,
  whoWeServeConcept,
  compareLinks,
  resourceLinks,
} from "./nav-data";

function FooterColumn({
  heading,
  items,
}: {
  heading: string;
  items: { label: string; href: string }[];
}) {
  return (
    <div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">
        {heading}
      </p>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="text-sm text-ink-muted hover:text-ink"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="relative rail border-t border-border bg-surface-2">
      <div className="container-page py-14">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-6">
          <div className="col-span-2">
            <Logo />
            <p className="mt-4 max-w-[240px] text-sm text-ink-muted">
              AI-powered accounting software, built for restaurants.
            </p>
          </div>
          <FooterColumn heading="Features" items={featureLinks.slice(0, 6)} />
          <FooterColumn
            heading="Who We Serve"
            items={[...whoWeServeBusiness, ...whoWeServeConcept.slice(0, 3)]}
          />
          <FooterColumn heading="Compare" items={compareLinks} />
          <FooterColumn
            heading="Company"
            items={[
              { label: "Why DishBooks", href: "/why-dishbooks" },
              { label: "Pricing", href: "/pricing" },
              { label: "FAQ", href: "/faq" },
              { label: "Contact", href: "/contact" },
              ...resourceLinks,
            ]}
          />
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-border pt-8 sm:flex-row sm:items-center">
          <p className="text-sm text-ink-soft">
            © {new Date().getFullYear()} DishBooks. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/privacy" className="text-sm text-ink-soft hover:text-ink">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-ink-soft hover:text-ink">
              Terms of Service
            </Link>
            <Link href="/security" className="text-sm text-ink-soft hover:text-ink">
              Security
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
