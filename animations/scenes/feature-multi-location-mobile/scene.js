// Feature page: Multi-Location Reporting, phone (the 400 × 720 phone layout, rendered at 2.5×).
// The story is ../../features/multi-location.js; the window, spotlight, camera and
// pointer are ../../features/kit.js.

import { makeFeature, PHONE } from '../../features/kit.js';
import { STORY } from '../../features/multi-location.js';

const S = makeFeature(PHONE, STORY);

export const meta = S.meta;
export const build = S.build;
export const frame = S.frame;
