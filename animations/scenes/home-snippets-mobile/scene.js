// Homepage hero snippets, phone: the app's phone layout (400 × 720) in a
// 400 × 572 frame (the home-components-mobile shape), rendered at 2.5×. The
// story is ../../features/home-snippets.js.

import { makeFeature, PHONE } from '../../features/kit.js';
import { STORY } from '../../features/home-snippets.js';

const S = makeFeature({ ...PHONE, meta: { width: 400, height: 572, fps: 30, posterTime: 0, scale: 2.5 } }, STORY);

export const meta = S.meta;
export const build = S.build;
export const frame = S.frame;
