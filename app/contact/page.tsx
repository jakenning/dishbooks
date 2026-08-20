import type { Metadata } from "next";
import Link from "next/link";
import { Hero } from "@/components/Hero";
import { ContactForm } from "@/components/ContactForm";
import { CrossLinksRow } from "@/components/CrossLinksRow";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Contact DishBooks | Restaurant Accounting Software",
  description:
    "Get in touch with DishBooks — questions about restaurant accounting, a demo, or partnering with us.",
};

const helpItems = [
  { text: "General questions about DishBooks", link: { label: "email us at clients@dishbooks.com", href: "mailto:clients@dishbooks.com" } },
  { text: "Want to see it for your restaurant", link: { label: "schedule a demo", href: "/demo" } },
  { text: "Pricing questions", link: { label: "see pricing", href: "/pricing" } },
  { text: "Interested in partnering with DishBooks", link: { label: "email us at clients@dishbooks.com", href: "mailto:clients@dishbooks.com" } },
];

export default function Contact() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Contact" }]} />

      <Hero kicker="Contact" title="Get in touch" subhead="Questions about DishBooks? We're here to help." />

      <section className="relative rail pb-16">
        <div className="container-page grid gap-12 md:grid-cols-2">
          <div>
            <div className="rounded-lg border border-border bg-surface-2 p-8">
              <p className="text-sm font-semibold text-ink-soft">Email</p>
              <a
                href="mailto:clients@dishbooks.com"
                className="mt-1 block text-2xl font-medium text-primary-600 hover:text-primary-700"
              >
                clients@dishbooks.com
              </a>
              <p className="mt-4 text-[15px] text-ink-muted">
                Prefer to talk it through?{" "}
                <Link href="/demo" className="font-medium text-primary-600 hover:text-primary-700">
                  Schedule a demo
                </Link>
              </p>
            </div>

            <div className="mt-8">
              <h2 className="h3 mb-4">How we can help</h2>
              <ul className="space-y-3">
                {helpItems.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[15px] text-ink">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500" />
                    <span>
                      {item.text} —{" "}
                      <Link href={item.link.href} className="font-medium text-primary-600 hover:text-primary-700">
                        {item.link.label}
                      </Link>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <ContactForm />
        </div>
      </section>

      <CrossLinksRow
        links={[
          { label: "Schedule a demo", href: "/demo" },
          { label: "Pricing", href: "/pricing" },
          { label: "Why DishBooks", href: "/why-dishbooks" },
        ]}
      />
    </>
  );
}
