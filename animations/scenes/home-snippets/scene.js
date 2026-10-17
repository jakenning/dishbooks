// Homepage hero snippets, desktop: the 1280 × 720 app window filmed close in a
// 560 × 660 frame (the hero's right column, the same shape as the
// home-components video it replaces), rendered at 2×. The story is
// ../../features/home-snippets.js; the camera, spotlight and pointer are
// ../../features/kit.js.

import { makeFeature, DESKTOP } from '../../features/kit.js';
import { STORY } from '../../features/home-snippets.js';

const S = makeFeature(
  { ...DESKTOP, meta: { width: 560, height: 660, fps: 30, posterTime: 0, scale: 2 }, cam: { pad: 18, maxZoom: 1.7 }, rest: { x: 420, y: 560 } },
  STORY,
);

export const meta = S.meta;
export const build = S.build;
export const frame = S.frame;
