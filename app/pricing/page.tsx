import type { Metadata } from "next";
import { Hero } from "@/components/Hero";
import { DataTable } from "@/components/DataTable";
import { SectionBlock } from "@/components/SectionBlock";
import { FAQAccordion } from "@/components/FAQAccordion";
import { CrossLinksRow } from "@/components/CrossLinksRow";
import { FinalCTA } from "@/components/FinalCTA";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "DishBooks Pricing | Restaurant Accounting Software",
  description:
    "Simple per-location pricing for restaurant accounting software — prime cost, multi-location reporting, and Dex, your financial assistant, included.",
};

const featureDepth = [
  {
    heading: "Restaurant-specific accounting",
    items: [
      "Prime cost & COGS by category — protein, dairy, produce, beverage, and more, mapped automatically from your vendor invoices",
      "Restaurant KPI visibility — the numbers that actually drive margin, in one place",
      "Smart Dashboard — every restaurant KPI, updated automatically",
    ],
  },
  {
    heading: "Multi-location & reporting",
    items: [
      "Side-by-side or consolidated P&L across every location",
      "One login across your entire restaurant group",
      "Fiscal calendar accounting — 13-period, 4-4-5, 4-5-4, 5-4-4, or standard 12-period",
    ],
  },
  {
    heading: "Automation & AI",
    items: [
      "AI-driven bank reconciliation",
      "Dex, your financial assistant, for instant answers about your numbers",
      "Vendor invoice automation",
    ],
  },
  {
    heading: "Integrations",
    items: ["API integration with MarginEdge, for restaurants that already use it for inventory and recipe costing"],
  },
  {
    heading: "Getting started",
    items: ["No implementation fee — connect your accounts and vendors, and you're set up in days"],
  },
];

export default function Pricing() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Pricing" }]} />

      <Hero
        kicker="Pricing"
        title="Simple, transparent pricing for restaurant groups"
        subhead="Priced by entity type — full accrual accounting for your restaurants, simplified cash-basis accounting for everything else. Start with a 14-day free trial. Cancel anytime."
        primaryCta={{ label: "Get started", href: "/signup" }}
        secondaryCta={{ label: "Schedule a demo", href: "/demo" }}
      />

      <section className="relative rail pb-8">
        <div className="container-page">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-primary-500 p-8 text-white">
              <p className="text-sm font-semibold text-white/80">Restaurant location</p>
              <p className="mt-3 text-4xl font-semibold tracking-tight">$175/mo</p>
              <p className="mt-1 text-[15px] text-white/70">per restaurant location, billed monthly</p>
              <p className="mt-4 text-[15px] leading-relaxed text-white/90">
                Accrual accounting, with prime cost and COGS broken down by
                GL category — protein, dairy, produce, beverage, and more.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-surface-4 p-8">
              <p className="text-sm font-semibold text-ink-soft">Non-restaurant entity</p>
              <p className="mt-3 text-4xl font-semibold tracking-tight text-ink">$49/mo</p>
              <p className="mt-1 text-[15px] text-ink-muted">per non-restaurant entity, billed monthly</p>
              <p className="mt-4 text-[15px] leading-relaxed text-ink-muted">
                Cash-basis accounting, for management companies, real estate
                entities, and other non-restaurant entities in your group
                that don&apos;t need GL-level cost breakdown.
              </p>
            </div>
          </div>
          <p className="mt-6 text-center text-sm text-ink-soft">
            14-day free trial. Cancel anytime.
          </p>
        </div>
      </section>

      <section className="section-y bg-surface-2">
        <div className="container-page">
          <h2 className="h2 mb-8">What&apos;s included, by entity type</h2>
          <DataTable
            highlightColumn={2}
            columns={["Feature", "Non-restaurant entity — $49/mo", "Restaurant location — $175/mo"]}
            rows={[
              ["Accounting basis", "Cash basis", "Accrual"],
              ["GL-level cost breakdown by category", { text: "Not included", included: false }, { text: "Included", included: true }],
              ["Prime cost & COGS visibility", { text: "Not included", included: false }, { text: "Included", included: true }],
              ["Smart Dashboard", { text: "Not included", included: false }, { text: "Included", included: true }],
              ["Multi-location / consolidated reporting", { text: "Included", included: true }, { text: "Included", included: true }],
              ["Fiscal calendar accounting", { text: "Included", included: true }, { text: "Included", included: true }],
              ["AI-driven bank reconciliation", { text: "Included", included: true }, { text: "Included", included: true }],
              ["Dex, your financial assistant", { text: "Included", included: true }, { text: "Included", included: true }],
              ["API integration with MarginEdge", "Not applicable", { text: "Included", included: true }],
            ]}
          />
          <p className="mt-4 text-sm text-ink-soft">
            Note: the $49 tier is limited to cash-basis accounting by design
            — this is what keeps it scoped to genuinely simpler entities,
            rather than a discount a restaurant location could opt into.
          </p>
        </div>
      </section>

      <section className="section-y">
        <div className="container-page">
          <h2 className="h2 max-w-2xl">
            Every restaurant location gets the same full feature set.
          </h2>
          <p className="body-lg mt-3 max-w-2xl">
            No tiers to climb, no add-on modules to unlock — every restaurant
            location includes:
          </p>
          <div className="mt-10 grid gap-8 md:grid-cols-2">
            {featureDepth.map((group) => (
              <div key={group.heading}>
                <h3 className="h3 mb-3">{group.heading}</h3>
                <ul className="space-y-2.5">
                  {group.items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-[15px] text-ink-muted">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0 text-success">
                        <path d="M3 8.5L6.2 11.5L13 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SectionBlock tone="muted" title="Every restaurant, the same full feature set — no tiers to climb.">
        <p>
          Some platforms gate their most useful features — AI-powered
          dashboards, advanced reporting — behind a higher-priced module or
          plan, even for the same restaurant. DishBooks doesn&apos;t. Every
          restaurant location gets the full feature set from day one,
          whether you&apos;re running one restaurant or twenty. The
          lower-priced non-restaurant entity rate isn&apos;t a
          stripped-down version of the same product — it&apos;s scoped to
          cash-basis entities that genuinely don&apos;t need GL-level cost
          breakdown, like a holding company or management company.
        </p>
      </SectionBlock>

      <FAQAccordion
        items={[
          { question: 'What counts as a "restaurant location" versus a "non-restaurant entity"?', answer: "A restaurant location is any place you're serving food or drink to customers, and runs on full accrual accounting with GL-level cost breakdown by category. A non-restaurant entity is a supporting piece of your business — a management company, commissary or central kitchen, or real estate holding entity, for example — that needs to be part of your consolidated books but doesn't need that level of breakdown, so it runs on cash-basis accounting instead." },
          { question: "Can a restaurant sign up as a non-restaurant entity to save money?", answer: "No — the $49 tier is limited to cash-basis accounting and doesn't include GL-level cost breakdown or prime cost visibility. If you need accrual accounting or category-level cost tracking, you'll want the restaurant-location plan." },
          { question: "Do I need to pay for every location separately?", answer: "Yes — each restaurant location is billed at $175/month, and each non-restaurant entity at $49/month. You can add locations as your group grows." },
          { question: "Is there a free trial?", answer: "Yes — every account starts with a 14-day free trial." },
          { question: "What happens after the free trial?", answer: "You're charged based on how many locations and entities you've added, and billed again on that same date every month after." },
          { question: "Can I cancel anytime?", answer: "Yes. If you cancel partway through a billing month, you'll keep access through the end of that month — there's no refund for the current month, but you won't be billed again going forward." },
          { question: "Is there an implementation or setup fee?", answer: "No — there's no implementation fee. You get started by connecting your accounts and vendors, typically within days, not weeks." },
          { question: "I already use QuickBooks and MarginEdge — do I need DishBooks?", answer: "DishBooks isn't trying to replace your inventory or recipe costing tool — it upgrades the accounting and reporting layer underneath it. If you use MarginEdge, DishBooks connects directly via API integration, so you don't have to choose." },
          { question: "Does every restaurant location get the same features, or are some gated to a higher tier?", answer: "The same features, every time. Every restaurant location includes the full feature set — nothing to unlock by upgrading." },
        ]}
      />

      <CrossLinksRow
        links={[
          { label: "Why DishBooks", href: "/why-dishbooks" },
          { label: "Prime Cost & COGS", href: "/features/prime-cost-cogs" },
          { label: "Multi-Location Reporting", href: "/features/multi-location" },
          { label: "Dex AI", href: "/features/dex-ai" },
          { label: "Compare: DishBooks vs QuickBooks", href: "/compare/quickbooks" },
          { label: "Compare: DishBooks vs Restaurant365", href: "/compare/restaurant365" },
        ]}
      />

      <FinalCTA
        title="See what one simple plan gets you."
        subhead="Every feature, every location, from day one."
      />
    </>
  );
}
