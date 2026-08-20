import { Button } from "./Button";
import { ArrowRight } from "./icons";

export function FinalCTA({
  title,
  subhead,
  cta = { label: "Get Started", href: "/signup" },
}: {
  title: string;
  subhead: string;
  cta?: { label: string; href: string };
}) {
  return (
    <section className="section-y bg-surface-3">
      <div className="container-page">
        <div className="flex flex-col items-start justify-between gap-8 rounded-xl bg-primary-500 px-8 py-10 sm:flex-row sm:items-center sm:px-12 sm:py-6">
          <div className="max-w-[653px]">
            <h2 className="text-[28px] font-medium leading-none tracking-[-0.03em] text-neutral-50 md:text-[36px]">
              {title}
            </h2>
            <p className="mt-2 font-medium leading-relaxed text-primary-200">
              {subhead}
            </p>
          </div>
          <Button href={cta.href} variant="inverse" size="lg" className="shrink-0">
            {cta.label}
            <ArrowRight />
          </Button>
        </div>
      </div>
    </section>
  );
}
