// Feature page: Fiscal Calendar Accounting, desktop (the 1280 × 720 window, rendered at 1.5×).
// The story is ../../features/fiscal-calendar-accounting.js; the window, spotlight, camera and
// pointer are ../../features/kit.js.

import { makeFeature, DESKTOP } from '../../features/kit.js';
import { STORY } from '../../features/fiscal-calendar-accounting.js';

const S = makeFeature(DESKTOP, STORY);

export const meta = S.meta;
export const build = S.build;
export const frame = S.frame;
