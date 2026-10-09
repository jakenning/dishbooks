// Custom Reports, phone layout (400 × 720, rendered at 2.5× so text stays sharp
// on retina phones). Same story and timings as the desktop version — see
// ../custom-reports/reports.js — with the cards stacked: the report fills the
// top, and the recipients and schedule cards take turns in the slot below it.

import { makeScene } from '../custom-reports/reports.js';

const S = makeScene({
  meta: { width: 400, height: 720, duration: 10, fps: 30, posterTime: 8.6, scale: 2.5 },
  compact: true,
  touch: true, // phones have no pointer: fingertip taps instead
  swapWho: true, // one slot under the report: recipients, then schedule
  cursor: { start: { x: 300, y: 600 }, rest: { x: 330, y: 680 } },
});

export const meta = S.meta;
export const build = S.build;
export const frame = S.frame;
