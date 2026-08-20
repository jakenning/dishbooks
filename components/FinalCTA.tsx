import { Button } from "./Button";

export function FinalCTA({
  title,
  subhead,
  cta = { label: "Get started", href: "/signup" },
}: {
  title: string;
  subhead: string;
  cta?: { label: string; href: string };
}) {
  return (
    <section className="section-y">
      <div className="container-page">
        <div className="relative flex flex-col items-start justify-between gap-6 overflow-hidden rounded-xl bg-primary-900 px-8 py-10 shadow-glow-violet sm:flex-row sm:items-center sm:px-12 sm:py-12">
          <div className="blob-field">
            <div className="blob -left-16 -top-24 h-72 w-72 bg-accent-cyan/40" aria-hidden="true" />
            <div className="blob -right-20 -bottom-24 h-72 w-72 bg-accent-violet/50" aria-hidden="true" />
          </div>
          <div className="relative z-10">
            <h2 className="text-2xl font-medium tracking-tight text-white sm:text-3xl">
              {title}
            </h2>
            <p className="mt-2 text-[15px] text-white/70">{subhead}</p>
          </div>
          <Button href={cta.href} variant="inverse" size="lg" className="relative z-10 shrink-0">
            {cta.label}
          </Button>
        </div>
      </div>
    </section>
  );
}
