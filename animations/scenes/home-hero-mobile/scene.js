// Homepage hero, phone layout (400 × 720, rendered at 2.5× so text stays sharp
// on retina phones). Same story and timings as the desktop window — see
// ../home-hero/hero.js — in the app's narrow layout: a top bar with a menu
// button, the sidebar as a drawer, cards stacked, the calendar's labels above
// its bars, the P&L showing the flagged location next to the total, and Dex as
// a sheet. A fingertip taps the menu, then each item, instead of a cursor.

import { makeHero } from '../home-hero/hero.js';

const S = makeHero({
  meta: { width: 400, height: 720, duration: 14, fps: 30, posterTime: 0, scale: 2.5 },
  startAt: 1.8, // the loop starts here: Home loaded; by 2.05 the menu is tapped
  compact: true,
  touch: true,
  sales: { W: 352, H: 168, x0: 44, every: 3 },
  donut: 112,
  tl: { w: 350, x0: 0, x1: 350, fy: 18, oy: 86, bh: 24, lbl: 14, qy: 22, H: 156, five: 12, stacked: true },
  ch: { w: 350, h: 150, x0: 40, x1: 350, y0: 10, y1: 126 },
});

export const meta = S.meta;
export const build = S.build;
export const frame = S.frame;
