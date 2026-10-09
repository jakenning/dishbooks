// Custom Reports, desktop layout (640 × 506, the homepage slot's shape at 1440
// wide: 579 × 458). The story and timings live in reports.js; this file is only
// the geometry. Rendered at 2× so the video stays sharp on retina screens.

import { makeScene } from './reports.js';

const S = makeScene({
  meta: { width: 640, height: 506, duration: 10, fps: 30, posterTime: 8.6, scale: 2 },
  compact: false,
  cursor: { start: { x: 300, y: 470 }, rest: { x: 600, y: 470 } },
});

export const meta = S.meta;
export const build = S.build;
export const frame = S.frame;
