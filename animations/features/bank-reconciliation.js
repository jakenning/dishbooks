// Bank Reconciliation — the Banking page.
//
// Cash across the accounts counts up and the bank feed cascades in, each
// transaction already matched to the books. The spotlight walks it: the cash
// balance, the matched transactions, "Accept N matches", and the feed turning
// Reconciled.

import { seg, ease, riseIn, countUp } from '../lib/timeline.js';
import { bankView, cents } from '../scenes/why-dishbooks/app.js';

const ACCEPT = 6.15; // the click on "Accept N matches"

export const STORY = {
  id: 'bank-reconciliation',
  duration: 10,
  startAt: { d: 1.4 },
  nav: 4,
  title: 'Banking',
  view: (D, L, N, id) => bankView(D, L, N, id),
  refs: (q, qa) => ({
    cashc: q('.cashc'),
    big: q('.big'),
    acc: qa('.acc li'),
    cashRv: q('.cashx .rv'),
    txc: q('.txc'),
    txRows: qa('.tx .tr:not(.th)'),
    txM: qa('.tx .tr.m'),
    pn: q('.pn'),
    bar: q('.prog i i'),
    btn: q('.btn'),
  }),
  blocks: () => ['.cashc', '.txh', '.tx .tr'],
  spots: () => [
    { at: 1.5, dur: 1.9, sel: ['.cashc'], focus: ['.cashc > .lbl', '.cashc .acc'], label: 'Every account’s balance, synced overnight' },
    { at: 3.5, dur: 1.9, sel: ['.tx .tr.m'], label: 'Each transaction matched to your books' },
    { at: 5.5, dur: 1.2, sel: ['.txh'], label: 'Reconcile the week in one click' },
    { at: 6.8, dur: 2.1, sel: ['.tx .tr.m'], label: 'Reconciled, categorized, ready to close' },
  ],
  taps: () => [{ at: ACCEPT, el: (R) => R.btn, fx: 0.45 }],
  frame(t, R, L, D, N) {
    const b0 = 0.1;
    riseIn(R.cashc, t, b0, { dy: 12 });
    R.big.textContent = cents(countUp(t, b0 + 0.05, 1.0, N.cash), false);
    R.acc.forEach((li, i) => riseIn(li, t, b0 + 0.25 + i * 0.07, { dy: 4, dur: 0.35 }));
    if (R.cashRv) R.cashRv.setAttribute('width', (L.cashChart.W * ease.inOutCubic(seg(t, b0 + 0.3, 0.9))).toFixed(1));
    riseIn(R.txc, t, b0 + 0.08, { dy: 12 });
    R.txRows.forEach((r, i) => riseIn(r, t, b0 + 0.2 + i * 0.04, { dy: 4, dur: 0.3 }));
    let done = 24 - R.txM.length;
    R.txM.forEach((r, i) => {
      const a = ACCEPT + 0.1 + i * 0.1;
      const on = t >= a;
      if (on) done++;
      r.classList.toggle('done', on);
      r.style.setProperty('--hl', on ? 1 - seg(t, a + 0.1, 0.6) : 0);
    });
    R.pn.textContent = done;
    R.bar.style.width = `${((done / 24) * 100).toFixed(1)}%`;
    R.btn.classList.toggle('done', t >= ACCEPT + 0.1 + R.txM.length * 0.1);
    R.btn.style.scale = 1 - (seg(t, ACCEPT - 0.06, 0.06) - seg(t, ACCEPT + 0.04, 0.12)) * 0.05;
  },
};
