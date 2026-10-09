// Ops Calendar, phone layout (400 × 632, rendered at 2.5× so text stays sharp
// on retina phones). Same story and timings as the desktop version — see
// ../ops-calendar/opscal.js — with the cards stacked narrower: the grid row
// loses its Year/Entity/Start columns to a row header, timeline labels sit
// above the bars, and the Columns picker gets its own line.

import { makeScene } from '../ops-calendar/opscal.js';

const S = makeScene({
  meta: { width: 400, height: 632, duration: 10, fps: 30, posterTime: 8.6, scale: 2.5 },
  compact: true,
  tl: { w: 338, x0: 0, x1: 338, fy: 18, oy: 88, bh: 24, lbl: 14, qy: 22, H: 156, five: 12, stacked: true },
  ch: { w: 338, h: 132, x0: 40, x1: 338, y0: 10, y1: 108 },
  legendFive: '5 weekends',
  f1: 'Months: 28–31 days, 4–5 weekends',
  f2: 'Every period: 28 days, 4 weekends',
  cursor: { start: { x: 300, y: 300 }, away: { x: 330, y: 330 }, rest: { x: 330, y: 610 } },
});

export const meta = S.meta;
export const build = S.build;
export const frame = S.frame;
