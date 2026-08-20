export type FAQItem = { question: string; answer: string };

export function FAQAccordion({
  title = "Frequently asked questions",
  items,
  tone = "default",
}: {
  title?: string;
  items: FAQItem[];
  tone?: "default" | "muted";
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <section className={`section-y ${tone === "muted" ? "bg-surface-2" : ""}`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container-page max-w-3xl">
        <h2 className="h2">{title}</h2>
        <div className="mt-8 divide-y divide-border border-t border-border">
          {items.map((item) => (
            <details key={item.question} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[17px] font-medium text-ink marker:content-none transition-colors group-hover:text-primary-600">
                {item.question}
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  className="shrink-0 text-ink-soft transition-all group-open:rotate-45 group-open:text-primary-600 group-hover:text-primary-500"
                  aria-hidden="true"
                >
                  <path
                    d="M9 3V15M3 9H15"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </summary>
              <p className="body-base mt-3 max-w-2xl">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
