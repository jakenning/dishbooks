// Homepage hero components, phone layout (400 × 572, rendered at 2.5× so text
// stays sharp on retina phones). On phones the hero is one column, so this
// sits under the headline and buttons at full width (about 327–360px). Same
// story and timings as the desktop stage (../home-components/hc.js), with the
// KPI tiles side by side and the feed and Dex taking turns in the bottom slot.
// A fingertip taps each control instead of a pointer.

import { makeHomeComponents } from '../home-components/hc.js';

const S = makeHomeComponents({
  meta: { width: 400, height: 572, duration: 11, fps: 30, posterTime: 0, scale: 2.5 },
  startAt: 7.2, // the loop starts here: everything loaded and Dex's answer in
  compact: true,
  touch: true,
  swap: true, // the feed and Dex share the bottom slot
});

export const meta = S.meta;
export const build = S.build;
export const frame = S.frame;
