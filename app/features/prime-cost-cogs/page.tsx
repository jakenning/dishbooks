import type { Metadata } from "next";
import { Hero } from "@/components/Hero";
import { StatCompareCards } from "@/components/StatCompareCards";
import { SectionBlock } from "@/components/SectionBlock";
import { DataTable } from "@/components/DataTable";
import { QuoteCards } from "@/components/QuoteCards";
import { ChecklistBlock } from "@/components/ChecklistBlock";
import { FAQAccordion } from "@/components/FAQAccordion";
import { CrossLinksRow } from "@/components/CrossLinksRow";
import { FinalCTA } from "@/components/FinalCTA";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Prime Cost & COGS Tracking for Restaurants | DishBooks",
  description:
    "See prime cost, food, beverage, and labor cost broken down by category — pulled automatically from your vendor data. Built for restaurants, not generic accounting.",
};

const categoryChips = ["Protein", "Dairy", "Produce", "Beverage"];

export default function PrimeCostCogs() {
  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Features", href: "/features" },
          { label: "Prime Cost & COGS" },
        ]}
      />

      <Hero
        kicker="Restaurant prime cost & COGS software"
        title="Know your prime cost. And what's driving it."
        subhead="A blended COGS percentage doesn't tell you what's working. DishBooks breaks down food, beverage, and labor cost by category and by location, automatically — built specifically for restaurants."
        primaryCta={{ label: "Get started", href: "/signup" }}
        secondaryCta={{ label: "See how it works", href: "#comparison" }}
      />

      <StatCompareCards
        id="comparison"
        title="The problem with one number"
        leftLabel="Generic accounting"
        leftValue="32%"
        leftCaption="Cost of goods sold. One number, no story."
        rightLabel="DishBooks"
        rightItems={[
          { label: "Protein", value: "14.2%" },
          { label: "Dairy", value: "5.1%" },
          { label: "Produce", value: "6.8%" },
          { label: "Beverage", value: "5.9%" },
        ]}
        caption="Pulled automatically from your vendor invoices, with labor reflected as soon as it's entered — see exactly how below. Illustrative figures shown."
      />

      <section className="relative rail pt-16">
        <div className="container-page">
          <div className="flex flex-wrap gap-2">
            {categoryChips.map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-border bg-surface-4 px-4 py-1.5 text-sm font-medium text-ink"
              >
                {chip}
              </span>
            ))}
            <span className="rounded-full border border-dashed border-border bg-surface-2 px-4 py-1.5 text-sm font-medium text-ink-soft">
              + Custom category
            </span>
          </div>
        </div>
      </section>

      <SectionBlock title="Major distributors like US Foods, Ben E Keith, and Sysco connect directly — their invoices flow in automatically.">
        <p>
          Invoices from any other vendor are uploaded directly and go
          through the same AI-assisted coding: a case of chicken wings maps
          to Poultry, a shred of mozzarella to Dairy. Map an item once and
          it&apos;s remembered permanently — new items are flagged the first
          time you see them, and from there it&apos;s hands-off.
        </p>
      </SectionBlock>

      <section className="section-y bg-surface-2">
        <div className="container-page">
          <h2 className="h2 max-w-2xl">
            A single blended number can hide which location actually needs
            attention.
          </h2>
          <p className="body-lg mt-4 max-w-2xl">
            If you run more than one restaurant, DishBooks shows food,
            beverage, and labor cost side by side across every location — so
            you can see which one is running lean and which one needs
            attention, instead of digging through separate reports for each.
          </p>
          <div className="mt-8">
            <DataTable
              columns={["Metric", "Location 1", "Location 2"]}
              rows={[
                ["Prime cost", "58.2%", "51.4%"],
                ["Labor", "29.4%", "24.1%"],
              ]}
            />
          </div>
          <p className="mt-3 text-sm text-ink-soft">
            Illustrative figures — replace with real product screenshot or
            live data once available.
          </p>
        </div>
      </section>

      <QuoteCards
        eyebrow="Ask Dex"
        title="Dex surfaces the specifics a blended report never would."
        quotes={[
          "Location 1 is allocating 6.5% of labor cost to dishwashers — Location 2 is only at 4%.",
          "Protein cost is running 4% higher at Location 1 this month than last.",
        ]}
      />

      <ChecklistBlock
        tone="muted"
        title="Turn visibility into action"
        subhead="Knowing your numbers only matters if it changes what you do next."
        items={[
          "Catch a vendor price increase the week it happens — before it quietly erodes a full quarter of margin.",
          "See labor creeping up at one location and adjust scheduling before it becomes a pattern.",
          "Know exactly which cost category is moving — protein, produce, beverage — and act on it directly instead of guessing.",
          "Compare locations to know where to focus attention first: training, staffing, or vendor negotiation.",
        ]}
      />

      <section className="container-page relative rail py-8">
        <div className="flex items-center gap-3 rounded-lg border border-dashed border-primary-300 bg-primary-500/5 px-6 py-4 text-[15px] text-ink">
          <span className="kicker shrink-0">Coming soon</span>
          <span>
            Set a target prime cost and see how you&apos;re tracking against
            it — budgeting and forecasting, built into DishBooks.
          </span>
        </div>
      </section>

      <FAQAccordion
        items={[
          { question: "Does DishBooks track inventory?", answer: "Not as a standalone system — COGS is measured as purchases against sales. Add beginning and ending inventory counts anytime for a true usage-based number." },
          { question: "How current is my prime cost number?", answer: "Sales and vendor cost data update continuously. Labor reflects as soon as it's entered, so your full prime cost stays accurate without manual reconciliation." },
          { question: "Which vendors sync automatically?", answer: "Major distributors like US Foods, Ben E Keith, and Sysco connect directly. Any other vendor's invoices are uploaded and processed the same way." },
          { question: "Do I have to categorize every invoice myself?", answer: "DishBooks suggests a category the first time a new item appears. Confirm it once and it's remembered every time after." },
        ]}
      />

      <CrossLinksRow
        links={[
          { label: "Invoice Approval & Bill Pay", href: "/features/invoice-bill-pay" },
          { label: "Multi-Location Reporting", href: "/features/multi-location" },
          { label: "Dex AI", href: "/features/dex-ai" },
        ]}
      />

      <FinalCTA
        title="See your prime cost in one place"
        subhead="No spreadsheets. No waiting for month-end."
      />
    </>
  );
}
