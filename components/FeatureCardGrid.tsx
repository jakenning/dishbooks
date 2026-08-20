import Link from "next/link";

type FeatureCard = { title: string; description: string; href: string };

export function FeatureCardGroup({
  heading,
  cards,
}: {
  heading: string;
  cards: FeatureCard[];
}) {
  return (
    <div className="mb-12 last:mb-0">
      <h2 className="mb-5 flex items-center gap-2.5 h3">
        <span className="h-2 w-2 shrink-0 rounded-full bg-gradient-brand" aria-hidden="true" />
        {heading}
      </h2>
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-surface-4 p-6 transition-all hover:-translate-y-1 hover:border-transparent hover:shadow-xl hover:shadow-primary-500/10"
          >
            <span
              className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-brand transition-transform duration-300 group-hover:scale-x-100"
              aria-hidden="true"
            />
            <p className="text-base font-semibold text-ink">{card.title}</p>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-muted">
              {card.description}
            </p>
            <span className="mt-4 text-sm font-medium text-primary-600 group-hover:text-primary-700">
              Learn more →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
