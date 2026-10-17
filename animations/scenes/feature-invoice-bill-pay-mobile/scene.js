// Feature page: Invoice Approval & Bill Pay, phone (the 400 × 720 phone layout, rendered at 2.5×).
// The story is ../../features/invoice-bill-pay.js; the window, spotlight, camera and
// pointer are ../../features/kit.js.

import { makeFeature, PHONE } from '../../features/kit.js';
import { STORY } from '../../features/invoice-bill-pay.js';

const S = makeFeature(PHONE, STORY);

export const meta = S.meta;
export const build = S.build;
export const frame = S.frame;
