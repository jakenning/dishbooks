type Card = { label: string; caption: string };

export function PositioningCards({
  id,
  title,
  supporting,
  cards,
}: {
  id?: string;
  title: string;
  supporting?: string;
  cards: [Card, Card, Card];
}) {
  return (
    <section id={id} className="section-y scroll-mt-24">
      <div className="container-page">
        <h2 className="h2 max-w-3xl">{title}</h2>
        {supporting && <p className="body-lg mt-4 max-w-2xl">{supporting}</p>}

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {cards.map((card, i) => {
            const isCenter = i === 1;
            return (
              <div
                key={card.label}
                className={`rounded-xl p-7 transition-transform ${
                  isCenter
                    ? "bg-gradient-brand text-white shadow-glow-violet md:-translate-y-3"
                    : "border border-border bg-surface-2 text-ink"
                }`}
              >
                <p
                  className={`text-base font-semibold ${
                    isCenter ? "text-white" : "text-ink"
                  }`}
                >
                  {card.label}
                </p>
                <p
                  className={`mt-2 text-[15px] leading-relaxed ${
                    isCenter ? "text-white/85" : "text-ink-muted"
                  }`}
                >
                  {card.caption}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
