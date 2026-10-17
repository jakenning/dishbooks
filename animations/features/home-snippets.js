// Homepage hero — snippets of the app, never the whole dashboard.
//
// The camera starts close on Home's Total Sales card (counting up) and pans
// across the KPI row: Prime Cost %, EBITDA, Net Profit, Cash Balance. Then the
// pointer clicks Ask Dex (phones: the menu, then Ask Dex in the drawer), the
// question types out and the answer streams in. The loop starts and ends on
// the first card (noWide); each video starts on Dex's answer. Dex is asked the
// Why DishBooks story's question, about cash (cashAsk), not prime cost.

import { seg, ease } from '../lib/timeline.js';
import { homeView, model, cashAsk } from '../scenes/why-dishbooks/app.js';
import { homeRefs, homeLoad, dexPanel, dexRefs, dexFrame } from './pages.js';

const MENU_TAP = 5.6; // phones
const DEX_TAP = 6.25;
const DEX = { dexIn: [6.35, 0.35], typeAsk: [6.8, 1.0], send: 7.9, thinking: [7.95, 0.4], answer: [8.4, 1.6], dexOut: 11.2 };
const byKey = (R, key) => R.kpis.filter((k) => k.d.key === key).map((k) => k.el);

export const STORY = {
  id: 'home-snippets',
  duration: 12,
  startAt: { d: 10.6, m: 10.6 }, // Dex's answer on screen
  nav: 0,
  title: 'Home',
  noWide: true,
  drawer: true,
  data: (D) => ({ ...D, dex: cashAsk(D, model(D)) }),
  view: (D, L, N, id) => homeView(D, L, id),
  extra: (D) => dexPanel(D),
  refs: (q, qa, L, D) => ({ ...homeRefs(q, qa, L, D), ...dexRefs(q, qa), menu: q('.menu'), dexBtn: q('.dex-btn') }),
  blocks: () => ['.kpi', '.salesp', '.cost', '.dex header', '.dex .msg:not(.ans)', '.dex footer', '.bubble', '.msg.ans'],
  spots: (L) => [
    { at: 0, dur: 1.55, sel: (R) => byKey(R, 'sales'), label: 'Every number that matters, the moment you log in' },
    { at: 1.55, dur: 1.0, sel: (R) => byKey(R, 'prime') },
    { at: 2.55, dur: 1.0, sel: (R) => byKey(R, 'ebitda') }, // desktop only (phones show four KPIs)
    { at: L.compact ? 2.55 : 3.55, dur: L.compact ? 1.5 : 1.0, sel: (R) => byKey(R, 'net') },
    { at: 4.55, dur: 1.05, sel: (R) => byKey(R, 'cash') },
    { at: 5.6, dur: 0.95, sel: ['.dex-btn'], label: 'Ask Dex', zoom: L.compact ? 1 : 1.5 },
    { at: 6.55, dur: 1.4, sel: ['.dex footer'], label: 'Ask in plain English', zoom: L.compact ? 1 : 1.45 },
    { at: 7.95, dur: 3.25, sel: ['.bubble', '.msg.ans'], focus: ['.dex header', '.bubble', '.msg.ans'], label: 'Answers from your own books, in seconds', zoom: L.compact ? 1 : 1.3 },
  ],
  taps: (L) => [...(L.compact ? [{ at: MENU_TAP, el: (R) => R.menu, fx: 0.5, fy: 0.5 }] : []), { at: DEX_TAP, el: (R) => R.dexBtn, fx: 0.42, fy: 0.6 }],
  frame(t, R, L, D) {
    homeLoad(t, R, L, D, 0.05);
    dexFrame(t, R, L, D, DEX);
    R.dexBtn.style.scale = 1 - (seg(t, DEX_TAP - 0.06, 0.06) - seg(t, DEX_TAP + 0.04, 0.12)) * 0.05;
    if (L.compact) {
      // The drawer opens on the menu tap and closes after Ask Dex.
      const open = ease.inOutCubic(seg(t, MENU_TAP + 0.05, 0.25)) * (1 - ease.inOutCubic(seg(t, DEX_TAP + 0.08, 0.25)));
      R.side.style.transform = `translateX(${(-104 * (1 - open)).toFixed(2)}%)`;
      R.side.style.visibility = open > 0.001 ? 'visible' : 'hidden';
      R.scrim.style.opacity = open;
      R.scrim.style.visibility = open > 0.001 ? 'visible' : 'hidden';
    }
  },
};
