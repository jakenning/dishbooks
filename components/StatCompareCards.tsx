type LineItem = { label: string; value: string };

export function StatCompareCards({
  id,
  title,
  leftLabel,
  leftValue,
  leftCaption,
  rightLabel,
  rightItems,
  caption,
}: {
  id?: string;
  title: string;
  leftLabel: string;
  leftValue: string;
  leftCaption: string;
  rightLabel: string;
  rightItems: LineItem[];
  caption?: string;
}) {
  return (
    <section id={id} className="section-y scroll-mt-24 bg-surface-2">
      <div className="container-page">
        <h2 className="h2 max-w-2xl">{title}</h2>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-border bg-surface-4 p-8">
            <p className="text-sm font-semibold text-ink-soft">{leftLabel}</p>
            <p className="mt-4 text-5xl font-semibold tracking-tight text-ink-soft">
              {leftValue}
            </p>
            <p className="mt-3 text-[15px] text-ink-muted">{leftCaption}</p>
          </div>

          <div className="relative overflow-hidden rounded-xl bg-gradient-brand p-8 text-white shadow-glow-violet">
            <div
              className="pointer-events-none absolute -right-10 -top-10 z-0 h-40 w-40 rounded-full bg-white/10 blur-2xl"
              aria-hidden="true"
            />
            <p className="relative z-10 text-sm font-semibold text-white/80">{rightLabel}</p>
            <ul className="relative z-10 mt-4 space-y-3">
              {rightItems.map((item) => (
                <li
                  key={item.label}
                  className="flex items-center justify-between border-b border-white/15 pb-3 last:border-0 last:pb-0"
                >
                  <span className="text-[15px] text-white/90">{item.label}</span>
                  <span className="text-lg font-semibold">{item.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        {caption && <p className="mt-4 text-sm text-ink-soft">{caption}</p>}
      </div>
    </section>
  );
}
