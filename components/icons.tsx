/** Icons taken from the Figma design reference. Geometry is the exported
 *  path data; colour comes from `currentColor` so callers place it. */

export function ArrowRight({ className = "" }: { className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M2.5 10h15m0 0-5.625-6.25M17.5 10l-5.625 6.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CheckMark({ className = "" }: { className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 16.375 12"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M1 6.625L5.375 11L15.375 1"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** The bowl of the DishBooks mark, used as the list bullet throughout. */
export function BulletMark({ className = "" }: { className?: string }) {
  return (
    <svg
      width="11"
      height="12"
      viewBox="0 0 11 12"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M11 6C11 2.74309 8.21306 0.0821478 4.75352 0H0.479835C0.214746 0 0 0.219866 0 0.491275V11.5087C0 11.7802 0.214746 12 0.479835 12H4.75352C8.21306 11.9179 11 9.25854 11 6Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Brand-coloured bullet + label, the design's standard list row. */
export function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2">
          <BulletMark className="mt-1.5 shrink-0 text-primary-500" />
          <span className="font-medium leading-relaxed text-ink">{item}</span>
        </li>
      ))}
    </ul>
  );
}
