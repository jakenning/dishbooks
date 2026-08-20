const variants = {
  cyan: { a: "bg-accent-cyan/45", b: "bg-primary-400/40" },
  primary: { a: "bg-primary-400/45", b: "bg-accent-violet/35" },
  violet: { a: "bg-accent-violet/40", b: "bg-accent-cyan/35" },
};

export function MockPanel({
  variant = "primary",
  kind = "chart",
}: {
  variant?: keyof typeof variants;
  kind?: "chart" | "chat" | "table";
}) {
  const colors = variants[variant];

  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-surface-2">
      <div className="blob-field">
        <div className={`blob -left-10 -top-10 h-56 w-56 ${colors.a}`} aria-hidden="true" />
        <div className={`blob -right-10 -bottom-10 h-56 w-56 ${colors.b}`} aria-hidden="true" />
      </div>
      <div className="bg-dot-grid absolute inset-0 opacity-40" aria-hidden="true" />

      <div className="absolute inset-0 flex items-center justify-center p-6">
        {kind === "chart" && (
          <div className="w-full max-w-[280px] rounded-lg border border-border bg-surface-4/90 p-5 shadow-xl shadow-ink/10 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-ink-soft">Prime cost</span>
              <span className="rounded-full bg-success-soft px-2 py-0.5 text-[11px] font-semibold text-success-dark">
                -1.2 pts
              </span>
            </div>
            <p className="mt-1 text-2xl font-semibold text-ink">58.2%</p>
            <svg viewBox="0 0 220 60" className="mt-3 h-14 w-full" preserveAspectRatio="none">
              <polyline
                points="0,45 30,38 60,42 90,25 120,30 150,15 180,20 220,8"
                fill="none"
                stroke="url(#mockpanel-line)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <defs>
                <linearGradient id="mockpanel-line" x1="0" y1="0" x2="220" y2="0">
                  <stop offset="0%" stopColor="var(--color-accent-cyan)" />
                  <stop offset="100%" stopColor="var(--color-accent-violet)" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        )}

        {kind === "chat" && (
          <div className="w-full max-w-[280px] space-y-2">
            <div className="ml-auto w-fit rounded-lg rounded-br-sm bg-gradient-brand px-4 py-2.5 text-sm text-white shadow-lg shadow-primary-500/20">
              What&apos;s driving cost this week?
            </div>
            <div className="w-fit rounded-lg rounded-bl-sm border border-border bg-surface-4/90 px-4 py-2.5 text-sm text-ink shadow-md backdrop-blur-sm">
              Protein is up 4% at Location 1 vs last week.
            </div>
          </div>
        )}

        {kind === "table" && (
          <div className="w-full max-w-[280px] overflow-hidden rounded-lg border border-border bg-surface-4/90 shadow-xl shadow-ink/10 backdrop-blur-sm">
            <div className="grid grid-cols-3 gap-px bg-border text-[11px] font-semibold text-ink-soft">
              <div className="bg-surface-4/90 px-3 py-2">Metric</div>
              <div className="bg-surface-4/90 px-3 py-2">Loc 1</div>
              <div className="bg-surface-4/90 px-3 py-2">Loc 2</div>
            </div>
            <div className="grid grid-cols-3 gap-px bg-border text-sm text-ink">
              <div className="bg-surface-4/90 px-3 py-2">Prime cost</div>
              <div className="bg-surface-4/90 px-3 py-2 font-medium">58.2%</div>
              <div className="bg-surface-4/90 px-3 py-2 font-medium">51.4%</div>
            </div>
            <div className="grid grid-cols-3 gap-px bg-border text-sm text-ink">
              <div className="bg-surface-4/90 px-3 py-2">Labor</div>
              <div className="bg-surface-4/90 px-3 py-2 font-medium">29.4%</div>
              <div className="bg-surface-4/90 px-3 py-2 font-medium">24.1%</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
