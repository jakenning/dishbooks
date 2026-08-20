import { Hero } from "@/components/Hero";
import { Button } from "@/components/Button";
import { ChecklistBlock } from "@/components/ChecklistBlock";
import { FinalCTA } from "@/components/FinalCTA";
import { DataTable } from "@/components/DataTable";
import { TabSwitcher } from "@/components/TabSwitcher";
import { IntegrationHubLottie } from "@/components/IntegrationHubLottie";

const featureTabs = [
  {
    label: "Smart Dashboard",
    kicker: "Smart Ops Dashboard",
    title: "Every number that matters, the moment you log in.",
    description:
      "Cash balance, prime cost, net profit, sales trend, and more — updated automatically, in one place.",
    points: [
      "Automate reporting and save hours every week",
      "Control costs and act on real-time data",
      "Get notified of unusual changes before they impact profit",
    ],
    href: "/features/smart-dashboard",
    variant: "primary" as const,
    kind: "chart" as const,
  },
  {
    label: "Bank Reconciliation",
    kicker: "Automated banking & reconciliation",
    title: "Hours of manual matching, down to a quick final look.",
    description:
      "Bank and credit card connections import transactions automatically, match them against your books, and lock reconciled periods.",
    points: [
      "Transactions matched automatically, reviewed by you",
      "Lockable reconciled periods",
      "Fewer surprises at month-end close",
    ],
    href: "/features/bank-reconciliation",
    variant: "cyan" as const,
    kind: "table" as const,
  },
  {
    label: "Dex AI",
    kicker: "Ask Dex",
    title: "Built to scale with you, one login at a time.",
    description:
      "Multi-entity, multi-location management with a shared chart of accounts and role-based permissions — compare locations side by side or consolidate them into one report.",
    points: [
      "One login across your entire restaurant group",
      "Side-by-side or consolidated multi-location P&L",
      "Role-based access as your team grows",
    ],
    href: "/features/dex-ai",
    variant: "violet" as const,
    kind: "chat" as const,
  },
];

export default function Home() {
  return (
    <>
      <Hero
        kicker="Restaurant accounting, simplified"
        title={
          <>
            AI-powered accounting software,{" "}
            <span className="text-gradient-brand">built for restaurants.</span>
          </>
        }
        subhead="Know your numbers, control your costs, and grow with confidence."
        primaryCta={{ label: "Get started", href: "/signup" }}
        secondaryCta={{ label: "Meet Dex", href: "#dex" }}
      />

      {/* The gap in generic tools */}
      <section className="section-y">
        <div className="container-page grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="h2">
              Most accounting software isn&apos;t designed for the hospitality
              industry.
            </h2>
            <p className="body-lg mt-4">
              Daily sales summaries, prime cost tracking, multi-location
              operations — generic tools can&apos;t keep up. DishBooks is
              purpose-built for the industry, powered by Dex AI to deliver
              smart insights in a single, connected platform.
            </p>
            <Button href="/why-dishbooks" variant="secondary" className="mt-6">
              See why DishBooks →
            </Button>
          </div>
          <div className="min-w-0 rounded-lg border border-border bg-surface-2 p-6">
            <DataTable
              columns={["Metric", "Location 1", "Location 2"]}
              rows={[
                ["Prime cost", "58.2%", "51.4%"],
                ["Labor", "29.4%", "24.1%"],
                ["Net profit", { text: "12.6%", included: true }, { text: "9.8%", included: true }],
              ]}
            />
            <p className="mt-3 text-xs text-ink-soft">
              Illustrative dashboard data — every location, one connected view.
            </p>
          </div>
        </div>
      </section>

      {/* Meet Dex */}
      <section id="dex" className="relative section-y scroll-mt-24 overflow-hidden border-t-white/10 bg-primary-900 text-white">
        <div className="blob-field">
          <div className="blob -left-20 top-0 h-96 w-96 bg-accent-cyan/40" aria-hidden="true" />
          <div className="blob -right-24 bottom-0 h-96 w-96 bg-accent-violet/50" aria-hidden="true" />
        </div>
        <div className="bg-grain absolute inset-0" aria-hidden="true" />

        <div className="container-page relative z-10">
          <div className="max-w-2xl">
            <p className="kicker flex items-center gap-2 text-primary-300">
              <span className="h-1.5 w-1.5 rounded-full bg-gradient-brand" aria-hidden="true" />
              Meet Dex
            </p>
            <h2 className="mt-3 text-3xl font-medium tracking-tight sm:text-4xl">
              Your AI financial assistant
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-white/70">
              The brain behind your numbers — working around the clock to turn
              data into actionable insight. Ask Dex what happened, why it
              happened, and what&apos;s next.
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {["What happened?", "Why did it happen?", "What's next?"].map((q) => (
              <div
                key={q}
                className="rounded-lg border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-colors hover:border-white/25 hover:bg-white/10"
              >
                <p className="text-lg font-medium">{q}</p>
              </div>
            ))}
          </div>
          <Button href="/features/dex-ai" variant="inverse" className="mt-8">
            Explore Dex AI →
          </Button>
        </div>
      </section>

      {/* Feature tabs */}
      <section className="section-y">
        <div className="container-page">
          <div className="max-w-2xl">
            <h2 className="h2">What DishBooks does for your restaurant</h2>
            <p className="body-lg mt-3">
              From daily sales to bank reconciliation, DishBooks brings
              everything into one system.
            </p>
          </div>

          <div className="mt-12">
            <TabSwitcher tabs={featureTabs} />
          </div>
        </div>
      </section>

      {/* Integrations hub */}
      <section className="section-y bg-surface-2">
        <div className="container-page grid items-center gap-12 md:grid-cols-2">
          <div>
            <p className="kicker">Connected, not bolted on</p>
            <h2 className="h2 mt-3">
              Connects with the tools restaurants already run on.
            </h2>
            <p className="body-lg mt-4">
              DishBooks pulls sales from your POS, transactions from your
              bank, and vendor invoices from your distributors — automatically,
              so your numbers stay current without manual entry.
            </p>
            <ul className="mt-6 space-y-2">
              {[
                "POS integration — Toast live today",
                "Bank & credit card feeds, every account",
                "Vendor invoices — US Foods, Ben E Keith, Sysco",
                "MarginEdge API integration",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-[15px] text-ink">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-brand" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <IntegrationHubLottie className="max-w-[560px]" />
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="section-y bg-surface-2">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="h2">Simple, transparent pricing</h2>
            <p className="body-lg mt-3">
              One plan, priced by entity type. Every restaurant location gets
              the full feature set — no tiers to climb.
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-2xl gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-gradient-brand p-7 text-white shadow-glow-violet">
              <p className="text-sm font-semibold text-white/80">
                Restaurant location
              </p>
              <p className="mt-2 text-3xl font-semibold">$175/mo</p>
              <p className="mt-1 text-sm text-white/70">per location, billed monthly</p>
            </div>
            <div className="rounded-lg border border-border bg-surface-4 p-7 transition-shadow hover:shadow-lg hover:shadow-ink/5">
              <p className="text-sm font-semibold text-ink-soft">
                Non-restaurant entity
              </p>
              <p className="mt-2 text-3xl font-semibold text-ink">$49/mo</p>
              <p className="mt-1 text-sm text-ink-muted">per entity, billed monthly</p>
            </div>
          </div>
          <div className="mt-8 flex flex-col items-center gap-3">
            <p className="text-sm text-ink-soft">14-day free trial. Cancel anytime.</p>
            <Button href="/pricing">See full pricing →</Button>
          </div>
        </div>
      </section>

      <ChecklistBlock
        title="Know your numbers. Control your costs."
        subhead="DishBooks solves the core financial challenges restaurants face by unifying data, automating workflows, and delivering restaurant-specific insights."
        items={[
          "Automate data entry — reduce manual work and errors.",
          "Accurate P&Ls — access reports across all locations at your fingertips.",
          "Full visibility — reporting designed with restaurant owners in mind.",
          "Budgeting & forecasting — know where you're going, and how to get there.",
        ]}
      />

      <FinalCTA
        title="Accounting that finally works the way restaurants do."
        subhead="Trusted by restaurant operators and accounting partners."
      />
    </>
  );
}
