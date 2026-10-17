// Feature page: Bank Reconciliation, desktop (a 1280 × 1024 window in a 1000 × 800 frame, rendered at 2×).
// The story is ../../features/bank-reconciliation.js; the window, spotlight, camera and
// pointer are ../../features/kit.js.

import { makeFeature, DESKTOP } from '../../features/kit.js';
import { STORY } from '../../features/bank-reconciliation.js';

const S = makeFeature(DESKTOP, STORY);

export const meta = S.meta;
export const build = S.build;
export const frame = S.frame;
