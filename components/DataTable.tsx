type Row = (string | { text: string; included?: boolean })[];

function Cell({
  value,
  highlighted,
}: {
  value: string | { text: string; included?: boolean };
  highlighted?: boolean;
}) {
  const text = typeof value === "string" ? value : value.text;
  const included = typeof value === "object" ? value.included : undefined;

  return (
    <td
      className={`px-5 py-4 text-[15px] align-top ${
        highlighted ? "bg-primary-500/5 font-medium text-ink" : "text-ink-muted"
      }`}
    >
      <span className="flex items-center gap-2">
        {included === true && (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 text-success">
            <path d="M3 8.5L6.2 11.5L13 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        {included === false && (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 text-ink-soft">
            <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        )}
        {text}
      </span>
    </td>
  );
}

export function DataTable({
  columns,
  rows,
  highlightColumn,
}: {
  columns: string[];
  rows: Row[];
  highlightColumn?: number;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[640px] border-collapse text-left">
        <thead>
          <tr className="border-b border-border bg-surface-2">
            {columns.map((col, i) => (
              <th
                key={col}
                className={`px-5 py-4 text-sm font-semibold ${
                  i === highlightColumn ? "bg-primary-500/5 text-primary-700" : "text-ink"
                }`}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className="border-b border-border last:border-0">
              {row.map((cell, ci) => (
                <Cell key={ci} value={cell} highlighted={ci === highlightColumn} />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
