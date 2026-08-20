import Link from "next/link";
import Image from "next/image";
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
      <p className="mb-4 font-mono text-base font-medium uppercase tracking-[0.1em] text-primary-200">
        {heading}
      </p>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="font-medium text-primary-50 transition-colors hover:text-white"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-primary-900 text-primary-50">
      {/* Held at half strength so the link text keeps its contrast. */}
      <div className="absolute inset-0 opacity-50" aria-hidden="true">
        <Image
          src="/images/footer-bg.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
      </div>

      <div className="relative z-10 rail">
        <div className="container-page py-16">
          <div className="grid grid-cols-2 gap-10 md:grid-cols-6">
            <div className="col-span-2">
              <Logo size="lg" className="text-primary-50" />
              <p className="mt-6 max-w-[288px] font-medium text-primary-200">
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
        </div>

        <div className="border-t border-primary-700">
          <div className="container-page flex flex-col items-start justify-between gap-4 py-8 font-mono text-xs uppercase tracking-[0.1em] text-primary-200 sm:flex-row sm:items-center">
            <p>© {new Date().getFullYear()} DishBooks. All rights reserved.</p>
            <div className="flex flex-wrap gap-x-8 gap-y-2">
              {legalLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="transition-colors hover:text-primary-50"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
