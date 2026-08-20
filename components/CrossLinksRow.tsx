import Link from "next/link";

export function CrossLinksRow({
  links,
}: {
  links: { label: string; href: string }[];
}) {
  return (
    <section className="relative rail border-t border-border">
      <div className="container-page flex flex-wrap items-center gap-x-2 gap-y-3 py-8 text-[15px]">
        <span className="text-ink-soft">See how this connects to:</span>
        {links.map((link, i) => (
          <span key={link.href} className="flex items-center gap-2">
            <Link
              href={link.href}
              className="font-medium text-primary-600 hover:text-primary-700"
            >
              {link.label}
            </Link>
            {i < links.length - 1 && <span className="text-ink-soft">·</span>}
          </span>
        ))}
      </div>
    </section>
  );
}
