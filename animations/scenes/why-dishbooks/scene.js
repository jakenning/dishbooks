// Why DishBooks, desktop layout: one 1280 × 720 app window (16:9) that sits
// across the hero and the section below it on /why-dishbooks, at about
// 1060–1200px wide. The story and timings live in app.js; this file is only the
// geometry. Rendered at 1.5× (1920 × 1080).

import { makeScene } from './app.js';

const S = makeScene({
  meta: { width: 1280, height: 720, duration: 12, fps: 30, posterTime: 0, scale: 1.5 },
  startAt: 2.3, // the loop starts here: Home loaded, the pointer heading for Banking
  compact: false,
  txRows: 8,
  sales: { W: 612, H: 320 },
  cashChart: { W: 288, H: 260, x0: 46, every: 3 },
  dexRoom: 332, // Dex panel (320) + gap: the page narrows to make room
  donut: 176,
  rest: { x: 760, y: 470 }, // where the pointer waits while Home loads
  dexRest: { x: 470, y: 686 }, // and while Dex answers (clear of the panel)
});

export const meta = S.meta;
export const build = S.build;
export const frame = S.frame;
