// Prime Cost & COGS — the Prime Cost P&L, by location.
//
// The P&L loads and counts up. The spotlight walks it: COGS and labor as a
// share of sales, prime cost, COGS opening into the company's own categories,
// and the location whose numbers are off.

import { seg, ease, riseIn } from '../lib/timeline.js';
import { plView } from '../scenes/why-dishbooks/app.js';
import { plRefs, plFrame } from './pages.js';

const COGS_CLICK = 5.9;

export const STORY = {
  id: 'prime-cost-cogs',
  duration: 10,
  startAt: { d: 1.4 },
  nav: 5,
  crumb: 'Reports',
  title: 'Prime Cost P&amp;L',
  // A taller desktop window also shows prime cost by month under the P&L.
  view: (D, L, N) => (!L.tall ? plView(D, L, N) : plView(D, L, N).replace(/<\/section>$/, `${trendCard(D)}</section>`)),
  refs: (q, qa, L, D) => ({ ...plRefs(q, qa, L, D), ptc: q('.ptc'), pbars: qa('.ptc .pb2') }),
  blocks: () => ['.tile', '.plc .ch', '.pt > .tr', '.cats', '.ptc'],
  spots: () => [
    { at: 1.5, dur: 1.9, sel: (R) => R.tiles.slice(0, 2), label: 'COGS and labor, as a share of sales' },
    { at: 3.5, dur: 1.9, sel: (R) => [R.tiles[2]], label: 'Prime cost: COGS + labor, every day' },
    { at: 5.5, dur: 2.1, sel: ['.tr.cogs', '.cats'], label: 'COGS in your own categories' },
    { at: 7.7, dur: 1.75, sel: ['.pt .fl'], focus: ['.pt .th', '.pt > .tr[data-row="labor"]', '.pt > .tr[data-row="pp"]'], label: 'The location that’s off, flagged' },
  ],
  taps: (L) => [{ at: COGS_CLICK, el: (R) => R.cogs, fx: L.compact ? 0.12 : 0.08 }],
  frame(t, R, L, D, N) {
    plFrame(t, R, L, N, { p0: 0.1, cats: [COGS_CLICK + 0.05, 0.55], flag: 7.75 });
    if (!R.ptc) return;
    riseIn(R.ptc, t, 0.3, { dy: 12 });
    R.pbars.forEach((b, i) => (b.style.transform = `scaleY(${ease.outCubic(seg(t, 0.45 + i * 0.04, 0.6)).toFixed(3)})`));
  },
};

/** Prime cost % for each of the last 12 months (the Prime Cost % KPI's history). */
function trendCard(D) {
  const k = D.kpis.find((x) => x.key === 'prime');
  const lo = Math.floor(Math.min(...k.spark)) - 1;
  const hi = Math.ceil(Math.max(...k.spark));
  return `<div class="card ptc"><div class="ch"><div class="ct">Prime Cost % <span class="sub">· last 12 months</span></div></div>
    <div class="pbs">${k.spark
      .map((v, i) => `<div class="pcol${i === k.spark.length - 1 ? ' now' : ''}"><b>${v.toFixed(1)}%</b><i class="pb2" style="height:${(((v - lo) / (hi - lo)) * 100).toFixed(1)}%"></i><span>${D.months[i]}</span></div>`)
      .join('')}</div></div>`;
}
