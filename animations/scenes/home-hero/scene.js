// Homepage hero, desktop layout: one 1280 × 720 app window (16:9) that sits
// across the hero and the section below it on the homepage, at about
// 1060–1280px wide. The story and timings live in hero.js; this file is only
// the geometry. Rendered at 1.5× (1920 × 1080).

import { makeHero } from './hero.js';

const S = makeHero({
  meta: { width: 1280, height: 720, duration: 14, fps: 30, posterTime: 0, scale: 1.5 },
  startAt: 1.9, // the loop starts here: Home loaded, the pointer about to head for Settings
  compact: false,
  sales: { W: 612, H: 320 },
  donut: 176,
  tl: { w: 982, x0: 170, x1: 982, fy: 6, oy: 74, bh: 32, lbl: 17, qy: 27, H: 158, five: 14 },
  ch: { w: 982, h: 206, x0: 52, x1: 976, y0: 14, y1: 180 },
  dexRoom: 332, // Dex panel (320) + gap: the page narrows to make room
  rest: { x: 760, y: 470 }, // where the pointer waits while Home loads
  calRest: { x: 1090, y: 448 }, // off the grid and the timeline while the calendar re-cuts
  dexRest: { x: 470, y: 686 }, // and while Dex answers (clear of the panel)
});

export const meta = S.meta;
export const build = S.build;
export const frame = S.frame;
