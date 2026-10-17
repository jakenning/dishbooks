// Feature page: Fiscal Calendar Accounting, phone (the 400-wide phone layout in a 400 × 500 frame, rendered at 2.5×).
// The story is ../../features/fiscal-calendar-accounting.js; the window, spotlight, camera and
// pointer are ../../features/kit.js.

import { makeFeature, PHONE } from '../../features/kit.js';
import { STORY } from '../../features/fiscal-calendar-accounting.js';

const S = makeFeature(PHONE, STORY);

export const meta = S.meta;
export const build = S.build;
export const frame = S.frame;
