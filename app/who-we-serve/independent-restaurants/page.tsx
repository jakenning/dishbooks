import type { Metadata } from "next";
import { Hero } from "@/components/Hero";
import { SectionBlock } from "@/components/SectionBlock";
import { FAQAccordion } from "@/components/FAQAccordion";
import { CrossLinksRow } from "@/components/CrossLinksRow";
import { FinalCTA } from "@/components/FinalCTA";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Accounting Software for Independent Restaurants | DishBooks",
  description:
    "Restaurant-specific financial visibility sized for one location — prime cost, COGS, and Dex, your financial assistant — without enterprise pricing or setup.",
};

export default function IndependentRestaurants() {
  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Who We Serve" },
          { label: "Independent Restaurants" },
        ]}
      />

      <Hero
        kicker="Accounting software for independent restaurants"
        title="Real financial visibility, sized for one restaurant."
        subhead="DishBooks gives independent restaurant owners the same prime cost, COGS, and cash flow visibility multi-location groups get — without enterprise pricing or a drawn-out setup."
        primaryCta={{ label: "Get started", href: "/signup" }}
        secondaryCta={{ label: "See how it works", href: "#pillars" }}
      />

      <div id="pillars">
        <SectionBlock title="Generic accounting software wasn't built for a restaurant. Heavy restaurant systems weren't built for one restaurant.">
          <p>
            Basic accounting tools track income and expenses, but miss the
            numbers that actually run a restaurant — prime cost, food cost by
            category, vendor invoices. On the other end, enterprise-level
            restaurant systems can show you everything, but are built and
            priced around multi-location groups with a back-office team to
            run them. An independent operator ends up choosing between too
            little visibility or too much system. DishBooks fits right in
            the middle — restaurant-specific visibility that works just as
            well for one location as it does for many.
          </p>
        </SectionBlock>
      </div>

      <SectionBlock
        tone="muted"
        title="No enterprise contract. No paying for portfolio-level tools you don't need yet."
      >
        <p>
          DishBooks scales down to a single restaurant as naturally as it
          scales up to ten. You get the same prime cost and COGS visibility a
          multi-location group relies on, without a system priced and
          packaged around a portfolio you don&apos;t have.
        </p>
      </SectionBlock>

      <SectionBlock title="Connect your accounts and vendors, and start seeing your numbers — not a months-long implementation.">
        <p>
          Heavier restaurant systems often require dedicated setup time and
          an administrator to maintain them. DishBooks is built to get an
          independent restaurant up and running without that overhead, so
          you&apos;re looking at real numbers, not managing a project.
        </p>
      </SectionBlock>

      <SectionBlock
        tone="muted"
        title="Know your numbers well enough to act on them — not just report them at tax time."
        crossLinks={[
          { label: "Prime Cost & COGS", href: "/features/prime-cost-cogs" },
          { label: "Dex AI", href: "/features/dex-ai" },
        ]}
      >
        <p>
          Prime cost and COGS broken down by category (protein, dairy,
          produce, beverage) show exactly where margin pressure is coming
          from. And when a report alone isn&apos;t enough, ask Dex, your
          financial assistant, a plain-language question instead of digging
          through the numbers yourself.
        </p>
      </SectionBlock>

      <SectionBlock
        title="Know what it actually takes to open a second location — not just whether you want to."
        crossLinks={[{ label: "Multi-Location Reporting", href: "/features/multi-location" }]}
      >
        <p>
          Clear visibility into prime cost, margins, and cash position
          isn&apos;t only about running today&apos;s restaurant better —
          it&apos;s how you know whether your numbers can support a second
          location, and exactly what needs to improve before they can.
          DishBooks gives independent operators that confidence directly.
          And when the numbers say you&apos;re ready, multi-location
          comparison and consolidated reporting are already part of the same
          system — no switching platforms to get there.
        </p>
      </SectionBlock>

      <FAQAccordion
        tone="muted"
        items={[
          { question: "Is DishBooks a good fit for a single, independent restaurant?", answer: "Yes — DishBooks is built to give one restaurant the same prime cost and COGS visibility a multi-location group gets, without a system sized or priced around a portfolio." },
          { question: "Do I need to hire a bookkeeper or controller to use DishBooks?", answer: "No — DishBooks is built so an independent operator can understand their own numbers directly, and Dex, your financial assistant, is there to answer plain-language questions when you want more than a report." },
          { question: "How long does it take to get set up?", answer: "DishBooks is built to avoid the lengthy implementation heavier restaurant systems often require — connect your accounts and vendors, and you're looking at real numbers without a drawn-out setup process." },
          { question: "What happens if I open a second location?", answer: "The same visibility that helped you run your first restaurant well — prime cost, margins, cash position — carries over directly, and multi-location comparison and consolidated reporting are already part of DishBooks. Growing doesn't mean switching to a different system." },
          { question: "Does DishBooks work with my POS?", answer: "Yes — DishBooks connects to your POS to pull in sales data automatically, so your financial picture stays current without manual entry." },
        ]}
      />

      <CrossLinksRow
        links={[
          { label: "Prime Cost & COGS", href: "/features/prime-cost-cogs" },
          { label: "Dex AI", href: "/features/dex-ai" },
          { label: "Multi-Location Reporting", href: "/features/multi-location" },
          { label: "Why DishBooks", href: "/why-dishbooks" },
        ]}
      />

      <FinalCTA
        title="Run one great restaurant, with real numbers behind it."
        subhead="No enterprise system. No guesswork."
      />
    </>
  );
}
