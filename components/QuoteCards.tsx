export function QuoteCards({
  eyebrow,
  title,
  quotes,
}: {
  eyebrow?: string;
  title: string;
  quotes: string[];
}) {
  return (
    <section className="section-y">
      <div className="container-page">
        {eyebrow && <p className="kicker mb-3">{eyebrow}</p>}
        <h2 className="h2 max-w-2xl">{title}</h2>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {quotes.map((quote, i) => (
            <div
              key={i}
              className="relative overflow-hidden rounded-lg border border-border bg-surface-2 p-7 transition-shadow hover:shadow-lg hover:shadow-primary-500/5"
            >
              <span
                className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-brand text-white"
                aria-hidden="true"
              >
                <svg width="18" height="13" viewBox="0 0 28 20" fill="none">
                  <path
                    d="M0 20V11.5C0 5.1 4.3 0.8 11.5 0V4.3C7.9 5.1 6 7.5 6 11H11.5V20H0ZM16.5 20V11.5C16.5 5.1 20.8 0.8 28 0V4.3C24.4 5.1 22.5 7.5 22.5 11H28V20H16.5Z"
                    fill="currentColor"
                  />
                </svg>
              </span>
              <p className="text-[17px] leading-relaxed text-ink">“{quote}”</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
