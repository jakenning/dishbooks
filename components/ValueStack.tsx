import Link from "next/link";

type ValueItem = {
  title: string;
  description: string;
  links?: { label: string; href: string }[];
};

export function ValueStack({
  title,
  items,
  tone = "default",
}: {
  title?: string;
  items: ValueItem[];
  tone?: "default" | "muted";
}) {
  return (
    <section className={`section-y ${tone === "muted" ? "bg-surface-2" : ""}`}>
      <div className="container-page">
        {title && <h2 className="h2 max-w-2xl">{title}</h2>}
        <div className={`${title ? "mt-10" : ""} divide-y divide-border`}>
          {items.map((item, i) => (
            <div key={i} className="grid gap-2 py-7 first:pt-0 last:pb-0 md:grid-cols-[1fr_1.4fr] md:gap-10">
              <h3 className="flex items-start gap-2.5 h3">
                <span
                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-brand"
                  aria-hidden="true"
                />
                {item.title}
              </h3>
              <div>
                <p className="body-base">{item.description}</p>
                {item.links && item.links.length > 0 && (
                  <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                    {item.links.map((link, li) => (
                      <span key={link.href} className="flex items-center gap-2">
                        <Link
                          href={link.href}
                          className="font-medium text-primary-600 hover:text-primary-700"
                        >
                          {link.label} →
                        </Link>
                        {li < item.links!.length - 1 && (
                          <span className="text-ink-soft">·</span>
                        )}
                      </span>
                    ))}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
