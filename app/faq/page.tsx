import type { Metadata } from "next";
import { Hero } from "@/components/Hero";
import { FAQAccordion } from "@/components/FAQAccordion";
import { CrossLinksRow } from "@/components/CrossLinksRow";
import { FinalCTA } from "@/components/FinalCTA";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "FAQ | DishBooks",
  description:
    "Answers to common questions about getting started, pricing and billing, security, and support at DishBooks.",
};

export default function FAQ() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "FAQ" }]} />

      <Hero kicker="FAQ" title="Frequently asked questions" subhead="Everything you need to know about getting started, pricing, security, and support." />

      <FAQAccordion
        title="Getting started"
        items={[
          { question: "How do I sign up for DishBooks?", answer: "Enter your email, or sign in with Google or Microsoft. You'll get an email with a link to your DishBooks database, where you'll add your organization name and one credit card. From there, connect your bank, POS, and other accounts to start seeing your numbers." },
          { question: "Is there a free trial?", answer: "Yes — you get 7 free days before you're charged anything. After that, your first 3 months are 50% off ($87.50/mo per restaurant location), then $175/mo per location." },
          { question: "Which POS systems does DishBooks work with?", answer: "Toast is live today. MarginEdge integration is coming very soon, along with vendor integrations for US Foods, Ben E Keith, and Sysco." },
          { question: "I currently use QuickBooks or Restaurant365 — can DishBooks help me switch?", answer: "We're building step-by-step migration guidance for restaurants coming from QuickBooks or Restaurant365. Reach out to our team with questions in the meantime." },
        ]}
      />

      <FAQAccordion
        tone="muted"
        title="Pricing & billing"
        items={[
          { question: "How much does DishBooks cost?", answer: "$175/mo per restaurant location, and $49/mo for any non-restaurant entity (holding, management, or payroll company). You get 7 days free, then your first 3 months are 50% off." },
          { question: "How am I billed?", answer: "One card covers every entity on your account. After your 7-day free trial, you're billed automatically each month on the anniversary of your first charge." },
          { question: "Can I cancel anytime?", answer: "Yes. DishBooks is month-to-month with no long-term contract." },
          { question: "What happens if I cancel?", answer: "You'll keep access through the day before your next billing date, with no refund for the current period. You'll then have 60 days to export your data before your account is permanently deleted." },
          { question: "Do you offer refunds?", answer: "No refunds are issued for partial months." },
        ]}
      />

      <FAQAccordion
        title="Security & your data"
        items={[
          { question: "How is my banking information protected?", answer: "Payments and bank connections are processed through Stripe." },
          { question: "Can I get my data if I decide to leave?", answer: "Yes. You have 60 days after your final billing period to export your financial data and reports. After that window, your database is permanently deleted." },
        ]}
      />

      <FAQAccordion
        tone="muted"
        title="Product & support"
        items={[
          { question: "What is Dex AI?", answer: "Dex is DishBooks' built-in AI assistant. In addition to acting as your accounting assistant, you can ask it plain-language questions — \"How do I pay a bill?\" or \"How do I download my P&L?\" — and Dex AI walks you through it." },
          { question: "Does DishBooks support multiple locations?", answer: "Yes. DishBooks supports multi-entity, multi-location management so operators can compare performance across locations." },
          { question: "Will someone help me get set up?", answer: "Yes. After you sign up, our onboarding team follows up by email, and a dedicated onboarding specialist is available for virtual support as you connect your bank, POS, and credit cards." },
          { question: "How do I get help if something isn't working?", answer: "DishBooks has Tech Support for troubleshooting, and Dex AI can answer many how-to questions right in the app. There are also step-by-step demo videos for connecting your bank, POS, paying bills, and more." },
        ]}
      />

      <CrossLinksRow
        links={[
          { label: "Pricing", href: "/pricing" },
          { label: "Security", href: "/security" },
          { label: "Contact", href: "/contact" },
        ]}
      />

      <FinalCTA
        title="Still have questions?"
        subhead="Our team is happy to help — reach out anytime."
        cta={{ label: "Contact us", href: "/contact" }}
      />
    </>
  );
}
