"use client";

import { useEffect, useRef, useState } from "react";
import type { AnimationItem } from "lottie-web";

/**
 * Lottie version of the integration hub.
 *
 * Two builds of the same animation ship: the wide one is laid out for a
 * desktop half-column, and the compact one pulls the canvas in and scales the
 * type up so the labels stay legible when the graphic is only ~340px across.
 * The breakpoint below must stay in step with the `md:` aspect utility on the
 * container -- Tailwind's `md` is 768px.
 *
 * The player is imported inside the effect so it stays out of the initial
 * client bundle, and playback follows visibility: the section sits well below
 * the fold, and a looping SVG repainting off-screen is pure waste.
 */
const WIDE = "/animations/dishbooks-sync.json";
const COMPACT = "/animations/dishbooks-sync-compact.json";
const WIDE_FROM = "(min-width: 768px)";

export function IntegrationHubLottie({ className = "" }: { className?: string }) {
  const host = useRef<HTMLDivElement>(null);
  const [path, setPath] = useState<string | null>(null);

  useEffect(() => {
    const mq = window.matchMedia(WIDE_FROM);
    const pick = () => setPath(mq.matches ? WIDE : COMPACT);
    pick();
    mq.addEventListener("change", pick);
    return () => mq.removeEventListener("change", pick);
  }, []);

  useEffect(() => {
    const node = host.current;
    if (!path || !node) return;

    let anim: AnimationItem | null = null;
    let observer: IntersectionObserver | null = null;
    let cancelled = false;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    import("lottie-web/build/player/lottie_light").then(({ default: lottie }) => {
      if (cancelled) return;

      anim = lottie.loadAnimation({
        container: node,
        renderer: "svg",
        loop: true,
        autoplay: false,
        path,
      });

      if (reduced) {
        // Hold a frame with a pulse mid-flight rather than an inert diagram.
        anim.addEventListener("DOMLoaded", () => anim?.goToAndStop(30, true));
        return;
      }

      observer = new IntersectionObserver(
        ([entry]) => (entry.isIntersecting ? anim?.play() : anim?.pause()),
        { rootMargin: "120px" },
      );
      observer.observe(node);
    });

    return () => {
      cancelled = true;
      observer?.disconnect();
      anim?.destroy();
      node.replaceChildren();
    };
  }, [path]);

  return (
    <div
      ref={host}
      role="img"
      aria-label="DishBooks sits at the centre of a hub, syncing data from your POS, bank accounts, payroll, and vendors."
      className={`mx-auto aspect-[1000/800] w-full md:aspect-[1188/800] ${className}`}
    />
  );
}
