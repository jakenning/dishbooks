import type { Metadata } from "next";
import { Hero } from "@/components/Hero";
import { PositioningCards } from "@/components/PositioningCards";
import { ValueStack } from "@/components/ValueStack";
import { ChecklistBlock } from "@/components/ChecklistBlock";
import { FAQAccordion } from "@/components/FAQAccordion";
import { CrossLinksRow } from "@/components/CrossLinksRow";
import { FinalCTA } from "@/components/FinalCTA";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Why DishBooks | Restaurant Accounting Software",
  description:
    "AI-driven restaurant accounting software built for restaurants — clearer than generic accounting tools, simpler than heavy enterprise-level systems.",
};

const problems = [
  "Financial information often arrives too late to change anything — by the time a report is ready, the month it describes is already over.",
  "Prime cost is hard to track clearly without a system built to show food and labor cost together, and how they're moving.",
  "Total cost of goods sold hides more than it reveals — protein, dairy, produce, and beverage all move differently, and a single blended number buries which one actually needs attention.",
  "Invoices, approvals, bill pay, and the books are often managed in separate tools or manual workflows, creating delays, duplicate work, and unclear responsibility.",
  "Financial reports are written for accountants, not operators — understanding them shouldn't require a degree in one.",
];

const stageCards = [
  {
    title: "Independent operators",
    body: "Restaurant-specific visibility from day one, without hiring a controller or learning a complex system.",
  },
  {
    title: "Growing multi-location groups",
    body: "Compare locations side by side, consolidate reporting, and scope access as the team grows.",
  },
  {
    title: "Accounting firms and bookkeepers",
    body: "A restaurant-specific system to run client books on, instead of forcing restaurant data into generic accounting software.",
  },
];

export default function WhyDishBooks() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Why DishBooks" }]} />

      <Hero
        kicker="Restaurant accounting software built for restaurants"
        title="Built for restaurants. Not bolted onto them."
        subhead="DishBooks is AI-driven restaurant accounting software, built to give restaurant operators real financial visibility — without the generic gaps of basic accounting tools, or the complexity of a heavy, enterprise-level system."
        primaryCta={{ label: "Get started", href: "/signup" }}
        secondaryCta={{ label: "See how it works", href: "#positioning" }}
      />

      <PositioningCards
        id="positioning"
        title="Restaurant financial software shouldn't force a choice between too generic and too complicated."
        supporting="Generic accounting software works fine for any small business, but it wasn't built to show prime cost, COGS by category, or performance across locations — the numbers that actually drive a restaurant's margins. On the other end of the market, heavy, enterprise-level solutions can show you all of that, but often demand months of implementation and ongoing upkeep that most restaurant teams don't have the staff or time to maintain. DishBooks sits in between: restaurant accounting software built for restaurant and hospitality operators, without the overhead."
        cards={[
          { label: "Generic accounting software", caption: "Built for any small business — not restaurants specifically." },
          { label: "DishBooks", caption: "Restaurant-specific visibility, without the overhead." },
          { label: "Heavy, enterprise-level solutions", caption: "Powerful, but built for teams with the time to run it." },
        ]}
      />

      <section className="section-y bg-surface-2">
        <div className="container-page max-w-3xl">
          <h2 className="h2">
            These are the problems that generic software and spreadsheets
            don&apos;t actually solve.
          </h2>
          <p className="body-lg mt-4">
            Restaurants run on thin, fast-moving margins, and most of the
            tools available to operators weren&apos;t built with that reality
            in mind.
          </p>
          <ul className="mt-8 space-y-4">
            {problems.map((problem) => (
              <li key={problem} className="flex items-start gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500" />
                <span className="text-[15px] leading-relaxed text-ink">{problem}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <ValueStack
        title="What restaurant-specific visibility actually looks like"
        items={[
          {
            title: "Prime cost and COGS, broken down the way restaurants actually think about cost.",
            description: "Protein, dairy, produce, and beverage — not one blended cost of goods sold number that hides which category is actually moving.",
            links: [{ label: "Prime Cost & COGS", href: "/features/prime-cost-cogs" }],
          },
          {
            title: "Ask a question, get an answer — not another report to dig through.",
            description: "Dex, your financial assistant, answers real questions about your sales, costs, and labor in plain language, so understanding a swing in the numbers doesn't require being an accountant.",
            links: [{ label: "Dex AI", href: "/features/dex-ai" }],
          },
          {
            title: "Every location, one clear picture.",
            description: "Compare locations side by side or consolidate them into one report — so a growing restaurant group can see what's happening across the whole business, not just one location at a time.",
            links: [{ label: "Multi-Location Reporting", href: "/features/multi-location" }],
          },
          {
            title: "Invoices, approvals, bill pay, and reconciliation, connected — not scattered across separate tools.",
            description: "From an invoice landing in your inbox to a transaction clearing your bank, DishBooks keeps the back office in one connected workflow instead of five disconnected ones.",
            links: [
              { label: "Invoice Approval & Bill Pay", href: "/features/invoice-bill-pay" },
              { label: "Bank Reconciliation", href: "/features/bank-reconciliation" },
            ],
          },
          {
            title: "Reporting and access built around how restaurants actually operate.",
            description: "Fiscal calendars that compare equal periods instead of a 31-day month to a 28-day one, and custom report templates scoped to exactly the right person — DishBooks fits how restaurant finance actually works, not the other way around.",
            links: [
              { label: "Fiscal Calendar Accounting", href: "/features/fiscal-calendar-accounting" },
              { label: "Custom Reporting", href: "/features/custom-reporting" },
            ],
          },
        ]}
      />

      <section className="section-y bg-surface-2">
        <div className="container-page">
          <h2 className="h2 max-w-2xl">
            Whether you run one location or ten — or you&apos;re the
            accountant helping a client run them.
          </h2>
          <p className="body-lg mt-3 max-w-2xl">DishBooks scales with the business, not against it.</p>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {stageCards.map((card) => (
              <div key={card.title} className="rounded-lg border border-border bg-surface-4 p-7">
                <p className="text-base font-semibold text-ink">{card.title}</p>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ChecklistBlock
        title="What changes once you switch to DishBooks"
        subhead="Restaurant-specific visibility only matters if it changes how you run the business."
        items={[
          "Catch a cost or labor problem while there's still time to fix it, instead of finding out at month-end close.",
          "Walk into a lender, investor, or partner conversation with clean, restaurant-specific financials already in hand.",
          "Add a new location without adding a new spreadsheet, a new report template, or a new back-office process.",
          "Spend less time decoding reports and more time acting on what they actually say.",
        ]}
      />

      <FAQAccordion
        items={[
          { question: "What makes DishBooks different from generic accounting software?", answer: "Generic accounting software tracks income and expenses for any small business. DishBooks is built specifically around restaurant numbers — prime cost, COGS by category, invoices, bill pay, and multi-location performance — so operators see what actually drives their margins." },
          { question: "Do I need to be an accountant to use DishBooks?", answer: "No — DishBooks is built so restaurant owners can understand their own numbers, and Dex, your financial assistant, is there to answer plain-language questions when a report alone isn't enough." },
          { question: "Is DishBooks only for restaurant groups with multiple locations?", answer: "No — DishBooks works for a single restaurant just as well as a multi-location group. Multi-location comparison and consolidation are there when you need them, not required to get started." },
          { question: "How much setup or implementation does DishBooks require?", answer: "DishBooks is built to be approachable without a lengthy implementation process or dedicated administrator — connect your accounts and vendors, and start seeing restaurant-specific visibility right away." },
          { question: "Does DishBooks replace my POS system?", answer: "No — DishBooks connects to your POS to pull in sales data automatically, giving you the financial side of the picture without replacing the system your team already runs on the floor." },
          { question: "Can my accountant or bookkeeper use DishBooks too?", answer: "Yes — DishBooks is built for restaurant operators and the accounting firms that support them, so your bookkeeper or accountant can work from the same restaurant-specific data you see." },
          { question: "Is DishBooks worth it for a single independent restaurant?", answer: "Yes — restaurant-specific visibility into prime cost and COGS matters just as much for one location as it does for ten. Multi-location tools are there if and when you need them." },
        ]}
      />

      <CrossLinksRow
        links={[
          { label: "Prime Cost & COGS", href: "/features/prime-cost-cogs" },
          { label: "Invoice Approval & Bill Pay", href: "/features/invoice-bill-pay" },
          { label: "Smart Dashboard", href: "/features/smart-dashboard" },
          { label: "Multi-Location Reporting", href: "/features/multi-location" },
          { label: "Custom Reporting & User Permissions", href: "/features/custom-reporting" },
          { label: "Fiscal Calendar Accounting", href: "/features/fiscal-calendar-accounting" },
          { label: "Dex AI", href: "/features/dex-ai" },
          { label: "Bank Reconciliation", href: "/features/bank-reconciliation" },
        ]}
      />

      <FinalCTA
        title="AI-driven financial clarity, built for restaurants."
        subhead="See what restaurant-specific accounting software actually looks like."
      />
    </>
  );
}
