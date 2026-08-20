export function ChecklistBlock({
  title,
  subhead,
  items,
  tone = "default",
}: {
  title: string;
  subhead: string;
  items: string[];
  tone?: "default" | "muted";
}) {
  return (
    <section className={`section-y ${tone === "muted" ? "bg-surface-2" : ""}`}>
      <div className="container-page">
        <div className="max-w-2xl">
          <h2 className="h2">{title}</h2>
          <p className="body-lg mt-3">{subhead}</p>
        </div>

        <ul className="mt-8 grid gap-3 md:grid-cols-2">
          {items.map((item, i) => (
            <li
              key={i}
              className="flex items-start gap-3 rounded-xl border border-border bg-surface-4 p-5"
            >
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success-soft text-success">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M3 8.5L6.2 11.5L13 4.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="text-[15px] leading-relaxed text-ink">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
