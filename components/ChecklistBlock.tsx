import type { ReactNode } from "react";
import Image from "next/image";
import { CheckMark } from "./icons";

export function ChecklistBlock({
  title,
  subhead,
  items,
  image,
  tone = "default",
}: {
  title: ReactNode;
  subhead: string;
  items: string[];
  /** Design pairs the copy with a product shot on the opposite column. */
  image?: { src: string; alt: string; width: number; height: number };
  tone?: "default" | "muted";
}) {
  return (
    <section className={`section-y ${tone === "muted" ? "bg-surface-2" : ""}`}>
      <div className="container-page">
        <div
          className={
            image
              ? "grid gap-10 md:grid-cols-2 md:items-center md:gap-16"
              : "max-w-2xl"
          }
        >
          {image && (
            <Image
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              sizes="(min-width: 768px) 50vw, 100vw"
              className="h-auto w-full rounded-2xl object-cover"
            />
          )}
          <div>
            <h2 className="h2-lg">{title}</h2>
            <p className="body-lg mt-4">{subhead}</p>
          </div>
        </div>

        <ul className="mt-12 grid gap-4 md:grid-cols-2">
          {items.map((item, i) => (
            <li
              key={i}
              className="flex items-center gap-3 rounded-xl border border-border bg-surface-4 px-8 py-6"
            >
              <span className="flex shrink-0 items-center justify-center rounded-full bg-primary-100 p-2 text-primary-500">
                <CheckMark />
              </span>
              <span className="font-medium leading-relaxed text-ink">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
