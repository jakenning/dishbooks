// Homepage hero components, desktop layout (560 × 660), for the hero's empty
// right column, beside the headline: about 400–560px wide across desktop
// widths (520px at 1440). The story and timings live in hc.js; this file is
// only the geometry. Rendered at 2× (1120 × 1320) so the UI text stays sharp.

import { makeHomeComponents } from './hc.js';

const S = makeHomeComponents({
  meta: { width: 560, height: 660, duration: 11, fps: 30, posterTime: 0, scale: 2 },
  startAt: 7.2, // the loop starts here: everything loaded and Dex's answer in
  compact: false,
  // The pointer appears in the gap right of the KPI tiles and goes back to the
  // gap under the location card (clear of everything) while Dex answers.
  cursor: { start: { x: 520, y: 219 }, rest: { x: 536, y: 441 } },
});

export const meta = S.meta;
export const build = S.build;
export const frame = S.frame;
