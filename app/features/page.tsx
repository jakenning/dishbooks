import type { Metadata } from "next";
import { Hero } from "@/components/Hero";
import { FeatureCardGroup } from "@/components/FeatureCardGrid";
import { FAQAccordion } from "@/components/FAQAccordion";
import { CrossLinksRow } from "@/components/CrossLinksRow";
import { FinalCTA } from "@/components/FinalCTA";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Restaurant Accounting Software Features | DishBooks",
  description:
    "Explore every DishBooks feature — prime cost, multi-location reporting, custom reports, fiscal calendar accounting, and Dex, your financial assistant.",
};

export default function FeaturesHub() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Features" }]} />

      <Hero
        kicker="Features"
        title="Everything DishBooks does for your restaurant's numbers."
        subhead="One platform, eight ways to see your business clearly — from prime cost to bank reconciliation, with Dex, your financial assistant, tying it all together."
      />

      <section className="relative rail pb-8">
        <div className="container-page">
          <FeatureCardGroup
            heading="Cost & financial visibility"
            cards={[
              {
                title: "Prime Cost & COGS",
                description:
                  "Food, beverage, and labor cost, broken down by category and by location, automatically.",
                href: "/features/prime-cost-cogs",
              },
              {
                title: "Smart Dashboard",
                description:
                  "Every number that matters, updated automatically the moment you log in.",
                href: "/features/smart-dashboard",
              },
              {
                title: "Custom Reporting",
                description:
                  "Prebuilt templates like Ops P&L and Prime Cost P&L, or build your own — seen by exactly who you choose.",
                href: "/features/custom-reporting",
              },
            ]}
          />

          <FeatureCardGroup
            heading="Structure & operations"
            cards={[
              {
                title: "Multi-Location Reporting",
                description:
                  "Every location and entity, side by side or combined — no more piecing together spreadsheets.",
                href: "/features/multi-location",
              },
              {
                title: "Fiscal Calendar Accounting",
                description:
                  "13-period, 4-4-5, 4-5-4, 5-4-4, or standard 12-period — every period you compare, actually comparable.",
                href: "/features/fiscal-calendar-accounting",
              },
              {
                title: "Invoice Approval & Bill Pay",
                description:
                  "Every invoice, one connected workflow, from upload to approval to paid.",
                href: "/features/invoice-bill-pay",
              },
            ]}
          />

          <FeatureCardGroup
            heading="Automation & AI"
            cards={[
              {
                title: "Bank Reconciliation",
                description:
                  "Transactions matched automatically against your invoices and books — hours of manual work down to a quick final look.",
                href: "/features/bank-reconciliation",
              },
              {
                title: "Dex",
                description:
                  "Ask a question about your sales, costs, or labor, and get an answer instantly — not another report to dig through.",
                href: "/features/dex-ai",
              },
            ]}
          />
        </div>
      </section>

      <FAQAccordion
        tone="muted"
        items={[
          {
            question: "Are all of these features included in one plan?",
            answer:
              "Yes — every feature on this page is included with your DishBooks subscription, with one exception: Bill Pay (paying vendors by check directly from DishBooks) is an optional add-on you can turn on per location.",
          },
          {
            question: "Do I have to use every feature, or can I pick and choose?",
            answer:
              "Everything is there from day one, but nothing forces you to use it all at once — most operators start with prime cost and the dashboard, then bring in fiscal calendar accounting, custom reporting, or Dex as they need them.",
          },
        ]}
      />

      <CrossLinksRow
        links={[
          { label: "Why DishBooks", href: "/why-dishbooks" },
          { label: "Pricing", href: "/pricing" },
          { label: "Schedule a demo", href: "/demo" },
        ]}
      />

      <FinalCTA
        title="See it running on your own numbers."
        subhead="Every feature above, one login."
      />
    </>
  );
}
