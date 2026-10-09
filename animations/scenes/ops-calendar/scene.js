// Ops Calendar, desktop layout (880 × 616, the homepage slot). The story and
// timings live in opscal.js; this file is only the geometry.

import { makeScene } from './opscal.js';

const S = makeScene({
  meta: { width: 880, height: 616, duration: 10, fps: 30, posterTime: 8.6, videoStart: 8.6 },
  compact: false,
  tl: { w: 766, x0: 156, x1: 766, fy: 6, oy: 66, bh: 26, lbl: 16, qy: 24, H: 142, five: 14 },
  ch: { w: 766, h: 150, x0: 52, x1: 758, y0: 12, y1: 124 },
  legendFive: 'Month with 5 weekends',
  f1: 'Month totals swing with 28–31 days and 4–5 weekends',
  f2: 'Every period: 28 days, 4 weekends — compare like for like',
  cursor: { start: { x: 640, y: 360 }, away: { x: 700, y: 300 }, rest: { x: 760, y: 560 } },
});

export const meta = S.meta;
export const build = S.build;
export const frame = S.frame;
