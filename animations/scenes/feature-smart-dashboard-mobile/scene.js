// Feature page: Smart Dashboard, phone (the 400-wide phone layout in a 400 × 500 frame, rendered at 2.5×).
// The story is ../../features/smart-dashboard.js; the window, spotlight, camera and
// pointer are ../../features/kit.js.

import { makeFeature, PHONE } from '../../features/kit.js';
import { STORY } from '../../features/smart-dashboard.js';

const S = makeFeature(PHONE, STORY);

export const meta = S.meta;
export const build = S.build;
export const frame = S.frame;
