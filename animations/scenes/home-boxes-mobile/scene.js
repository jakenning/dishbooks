// Homepage hero boxes, phone layout (400 × 572, rendered at 2.5× so text stays
// sharp on retina phones), under the headline and buttons at full width (the
// home-components-mobile slot). Same story and timings as the desktop stage
// (../home-boxes/boxes.js), with two KPI tiles side by side. A fingertip taps
// Ask Dex instead of a pointer.

import { makeHomeBoxes } from '../home-boxes/boxes.js';

const S = makeHomeBoxes({
  meta: { width: 400, height: 572, duration: 18, fps: 30, posterTime: 0, scale: 2.5 },
  startAt: 12, // the loop starts here: everything assembled and Dex's answer in
  compact: true,
  touch: true,
  tiles: 2,
});

export const meta = S.meta;
export const build = S.build;
export const frame = S.frame;
