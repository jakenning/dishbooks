// Homepage hero boxes, desktop layout (560 × 660), for the hero's right column
// beside the headline (the home-components slot). The story and timings live
// in boxes.js; this file is only the geometry. Rendered at 2× (1120 × 1320) so
// the UI text stays sharp.

import { makeHomeBoxes } from './boxes.js';

const S = makeHomeBoxes({
  meta: { width: 560, height: 660, duration: 18, fps: 30, posterTime: 0, scale: 2 },
  startAt: 12, // the loop starts here: everything assembled and Dex's answer in
  compact: false,
  tiles: 3,
  // The pointer comes in from the right edge, under the KPI tiles, and goes
  // back off to the right of the Dex header while Dex answers.
  cursor: { start: { x: 548, y: 128 }, rest: { x: 548, y: 324 } },
});

export const meta = S.meta;
export const build = S.build;
export const frame = S.frame;
