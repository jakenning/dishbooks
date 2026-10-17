// Feature page: Bank Reconciliation, phone (the 400 × 720 phone layout, rendered at 2.5×).
// The story is ../../features/bank-reconciliation.js; the window, spotlight, camera and
// pointer are ../../features/kit.js.

import { makeFeature, PHONE } from '../../features/kit.js';
import { STORY } from '../../features/bank-reconciliation.js';

const S = makeFeature(PHONE, STORY);

export const meta = S.meta;
export const build = S.build;
export const frame = S.frame;
