// Dex AI — ask about your numbers in plain English.
//
// The Prime Cost P&L is open; Dex opens beside it (a sheet on phones). The
// question types out and sends, the answer streams in, and the spotlight
// follows: the question box, the answer, then the answer next to the numbers
// it's about — the location the P&L flags.

import { plView } from '../scenes/why-dishbooks/app.js';
import { plRefs, plFrame, dexPanel, dexRefs, dexFrame } from './pages.js';

const DEX = { dexIn: [0.5, 0.35], typeAsk: [1.65, 0.9], send: 2.7, thinking: [2.75, 0.4], answer: [3.2, 1.5] };
// Phones: the sheet goes back down for the last beat, showing the P&L it was about.
const DEX_M = { ...DEX, dexOut: 6.0 };

export const STORY = {
  id: 'dex-ai',
  duration: 10,
  startAt: { d: 1.3, m: 1.3 }, // the P&L loaded, Dex open and waiting
  nav: 5,
  crumb: 'Reports',
  title: 'Prime Cost P&amp;L',
  view: (D, L, N) => plView(D, L, N),
  extra: (D) => dexPanel(D),
  refs: (q, qa, L, D) => ({ ...plRefs(q, qa, L, D), ...dexRefs(q, qa) }),
  blocks: () => ['.tile', '.plc', '.dex header', '.dex .msg:not(.ans)', '.dex footer', '.bubble', '.msg.ans'],
  spots: (L) => [
    { at: 1.4, dur: 1.75, sel: ['.dex footer'], label: 'Ask about your numbers in plain English', zoom: L.compact ? 1 : 1.05 },
    { at: 3.2, dur: 2.7, sel: ['.bubble', '.msg.ans'], label: 'Answers from your own books, in seconds', zoom: L.compact ? 1 : 1.3 },
    L.compact
      ? { at: 6.3, dur: 3.1, sel: ['.pt .fl'], focus: ['.pt .th', '.pt > .tr[data-row="labor"]', '.pt > .tr[data-row="pp"]'], label: 'The numbers behind the answer, flagged' }
      : { at: 6.0, dur: 3.4, sel: ['.msg.ans', '.pt .fl'], label: 'Dex points to the numbers behind the answer', zoom: 1 },
  ],
  frame(t, R, L, D, N) {
    plFrame(t, R, L, N, { p0: 0.05, flag: 1.0 });
    dexFrame(t, R, L, D, L.compact ? DEX_M : DEX);
  },
};
