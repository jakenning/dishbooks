// Feature page: Smart Dashboard, desktop (the 1280 × 720 window, rendered at 1.5×).
// The story is ../../features/smart-dashboard.js; the window, spotlight, camera and
// pointer are ../../features/kit.js.

import { makeFeature, DESKTOP } from '../../features/kit.js';
import { STORY } from '../../features/smart-dashboard.js';

const S = makeFeature(DESKTOP, STORY);

export const meta = S.meta;
export const build = S.build;
export const frame = S.frame;
