// Feature page: Prime Cost & COGS, desktop (the 1280 × 720 window, rendered at 1.5×).
// The story is ../../features/prime-cost-cogs.js; the window, spotlight, camera and
// pointer are ../../features/kit.js.

import { makeFeature, DESKTOP } from '../../features/kit.js';
import { STORY } from '../../features/prime-cost-cogs.js';

const S = makeFeature(DESKTOP, STORY);

export const meta = S.meta;
export const build = S.build;
export const frame = S.frame;
