import type { Metadata } from "next";
import { Hero } from "@/components/Hero";
import { SectionBlock } from "@/components/SectionBlock";
import { DataTable } from "@/components/DataTable";
import { FAQAccordion } from "@/components/FAQAccordion";
import { CrossLinksRow } from "@/components/CrossLinksRow";
import { FinalCTA } from "@/components/FinalCTA";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "DishBooks vs QuickBooks for Restaurants | DishBooks",
  description:
    "See how DishBooks compares to QuickBooks for restaurant accounting — prime cost by category, custom role-based reporting, and Dex, your financial assistant.",
};

const capabilityCards = [
  {
    title: "Prime Cost & COGS by category",
    body: "Protein, dairy, produce, beverage, and more — broken out automatically from your vendor invoices, no manual coding required.",
  },
  {
    title: "Multi-location master database, with side-by-side or consolidated reporting",
    body: "One login, one source of truth across every location. Compare stores side-by-side, or roll everything into one consolidated P&L.",
  },
  {
    title: "AI-assisted bank reconciliation and invoice approval",
    body: "Transactions matched automatically and reviewed by you, not re-entered by hand. Invoices route for approval instead of manual data entry.",
  },
  {
    title: "Dex",
    body: "Ask Dex industry-specific questions about your numbers and get an answer instantly — no digging through reports to find it.",
  },
  {
    title: "Smart Dashboards",
    body: "Every restaurant KPI, updated automatically, in one place — no building reports from scratch.",
  },
];

export default function CompareQuickBooks() {
  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Compare" },
          { label: "QuickBooks" },
        ]}
      />

      <Hero
        kicker="Compare"
        title="DishBooks vs QuickBooks: which is right for your restaurant?"
        subhead="Short answer: DishBooks vs QuickBooks isn't really a fair fight — they're built for different jobs. QuickBooks is solid, general small-business accounting. DishBooks is restaurant-specific financial visibility, built on top of that same foundation."
        primaryCta={{ label: "Get started", href: "/signup" }}
        secondaryCta={{ label: "See the comparison", href: "#comparison" }}
      />

      <SectionBlock title="QuickBooks was built for any small business. DishBooks was built for restaurants.">
        <p>
          Generic accounting software like QuickBooks tracks income and
          expenses well for almost any business, which is exactly why
          it&apos;s the most common accounting platform among restaurants
          today. But it wasn&apos;t built around what makes a restaurant&apos;s
          numbers different — prime cost by category, custom reporting by
          role, side-by-side location and period comparisons, or a fiscal
          calendar that matches how restaurants actually operate. DishBooks
          brings all of that in natively, so you&apos;re not choosing
          between general-purpose software and restaurant-specific
          visibility — you get both.
        </p>
      </SectionBlock>

      <section id="comparison" className="section-y scroll-mt-24 bg-surface-2">
        <div className="container-page">
          <h2 className="h2 mb-8">Side-by-side comparison</h2>
          <DataTable
            highlightColumn={2}
            columns={["Capability", "Generic accounting software", "DishBooks"]}
            rows={[
              ["Prime cost & COGS by category", "Not native — usually needs a separate add-on tool", "Built in"],
              ["Multi-location: one login for every location", "Typically one login per location", "One login, every location"],
              ["Side-by-side or consolidated multi-location P&L", "Limited or manual", "Built in"],
              ["Fiscal calendar accounting (13-period, 4-4-5, 4-5-4, 5-4-4)", "Not supported", "Supported, alongside standard 12-period"],
              ["AI-assisted bank reconciliation", "Manual matching", "AI-matched, human-reviewed"],
              ["Financial assistant for industry-specific questions", "Not available", "Dex, your financial assistant"],
              ["Smart Dashboard — every restaurant KPI, updated automatically", "Not available", "Built in"],
              ["Custom, role-based reports (e.g., an Ops P&L for your GM)", "Not built for restaurant roles", "Built in"],
              ["Scheduled report delivery by email", "Manual export", "Built in, on a cadence you set"],
              ["Period-over-period comparison, side-by-side", "Manual", "Built in"],
            ]}
          />

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {capabilityCards.map((card) => (
              <div key={card.title} className="rounded-lg border border-border bg-surface-4 p-6">
                <p className="text-base font-semibold text-ink">{card.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SectionBlock title="If you already have category-level cost visibility, DishBooks adds what most tools stop short of.">
        <p>
          Many operators pair generic accounting software with MarginEdge,
          MarketMan, xtraCHEF, or Opsi to get category-level cost visibility
          — and that&apos;s a real, valid setup. DishBooks isn&apos;t asking
          you to give that up. If you use MarginEdge specifically, DishBooks
          connects directly via API integration, so you keep MarginEdge for
          inventory and recipe costing, while DishBooks brings the rest: one
          login across every location, custom reports by role, side-by-side
          and period-over-period comparison, a consolidated P&L across your
          whole group, 13-period fiscal calendar accounting, and Dex, your
          financial assistant, for instant answers to industry-specific
          questions.
        </p>
      </SectionBlock>

      <FAQAccordion
        tone="muted"
        items={[
          { question: "Is DishBooks a replacement for QuickBooks?", answer: "DishBooks replaces QuickBooks as your restaurant's books of record — it's a full accounting platform, not an add-on to QuickBooks. The difference is that DishBooks is built around restaurant-specific numbers from the ground up, instead of general small-business accounting." },
          { question: "Can I switch from QuickBooks to DishBooks without losing my financial history?", answer: "Historical financial data can be brought over as part of onboarding, so you're not starting from zero. Talk to the DishBooks team about your specific QuickBooks setup for the exact migration path." },
          { question: "If I use QuickBooks with MarginEdge, MarketMan, xtraCHEF, or Opsi, do I have to give that up?", answer: "No — if you use MarginEdge specifically, DishBooks connects directly via API integration, so you keep it for inventory and recipe costing, while DishBooks replaces QuickBooks underneath it with custom reporting by role, side-by-side and period-over-period comparisons, a consolidated P&L, 13-period accounting, and Dex, your financial assistant." },
          { question: "Why does 13-period accounting matter for restaurants?", answer: "Restaurants run on weeks — payroll, prime cost, and most operating KPIs are tracked weekly. A standard calendar month has an inconsistent number of weeks, so month-over-month comparisons quietly compare unequal amounts of business. 13-period accounting keeps every period four weeks long, so comparisons are actually apples-to-apples. A standard 12-period calendar is available too, if that's what fits your business." },
          { question: "Can different people on my team see different reports?", answer: "Yes — reports can be assigned by role, so a general manager can see the Ops P&L without access to the full Prime Cost P&L or company financials, while an owner or accountant sees everything." },
          { question: "Can reports be sent out automatically?", answer: "Yes — reports can be scheduled to go out by email on whatever cadence you set, so the right report lands in the right inbox without anyone logging in to export it." },
          { question: "Is DishBooks harder to set up than QuickBooks?", answer: "DishBooks is built to get up and running without a lengthy implementation, connecting your accounts and vendors so you're looking at real numbers quickly rather than managing a long onboarding project." },
        ]}
      />

      <CrossLinksRow
        links={[
          { label: "Why DishBooks", href: "/why-dishbooks" },
          { label: "Prime Cost & COGS", href: "/features/prime-cost-cogs" },
          { label: "Multi-Location Reporting", href: "/features/multi-location" },
          { label: "Fiscal Calendar Accounting", href: "/features/fiscal-calendar-accounting" },
          { label: "Dex AI", href: "/features/dex-ai" },
        ]}
      />

      <FinalCTA
        title="Same foundation. Built for restaurants."
        subhead="See what restaurant-specific financial visibility looks like."
      />
    </>
  );
}
