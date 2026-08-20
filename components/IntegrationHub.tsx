import { LogoIcon } from "./Logo";

const nodes = [
  { label: "POS", sub: "Toast & more", x: 50, y: 8 },
  { label: "Bank", sub: "Every account", x: 92, y: 50 },
  { label: "Payroll", sub: "Synced weekly", x: 50, y: 92 },
  { label: "Vendors", sub: "US Foods, Sysco…", x: 8, y: 50 },
];

export function IntegrationHub() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[420px]">
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        {nodes.map((n) => (
          <line
            key={n.label}
            x1="50"
            y1="50"
            x2={n.x}
            y2={n.y}
            stroke="var(--color-border)"
            strokeWidth="0.5"
            strokeDasharray="2 2"
          />
        ))}
      </svg>

      {/* Center node */}
      <div className="absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-gradient-brand shadow-glow-violet">
        <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-surface-4">
          <LogoIcon className="h-8 w-auto" />
        </div>
      </div>

      {nodes.map((n) => (
        <div
          key={n.label}
          className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5 rounded-lg border border-border bg-surface-4 px-3.5 py-2.5 text-center shadow-md shadow-ink/5"
          style={{ left: `${n.x}%`, top: `${n.y}%` }}
        >
          <span className="text-xs font-semibold text-ink">{n.label}</span>
          <span className="text-[10px] text-ink-soft">{n.sub}</span>
        </div>
      ))}
    </div>
  );
}
