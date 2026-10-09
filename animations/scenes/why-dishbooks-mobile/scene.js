// Why DishBooks, phone layout (400 × 720, rendered at 2.5× so text stays sharp
// on retina phones). Same story and timings as the desktop window — see
// ../why-dishbooks/app.js — in the app's narrow layout: a top bar with a menu
// button, the sidebar as a drawer, cards stacked, the P&L showing the flagged
// location next to the total, and Dex as a sheet. A fingertip taps the menu,
// then each item, instead of a cursor.

import { makeScene } from '../why-dishbooks/app.js';

const S = makeScene({
  meta: { width: 400, height: 720, duration: 12, fps: 30, posterTime: 0, scale: 2.5 },
  startAt: 1.8, // the loop starts here: Home loaded; by 2.3 the menu drawer is already opening
  compact: true,
  touch: true,
  txRows: 5,
  sales: { W: 352, H: 168, x0: 44, every: 3 },
  donut: 112,
});

export const meta = S.meta;
export const build = S.build;
export const frame = S.frame;
