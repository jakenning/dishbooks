// Multi-Location Reporting — Reports → Location Performance.
//
// One card per location (sales counting up, prime cost against the group),
// prime cost by location as COGS + labor bars, and the performance table with
// the group total. The spotlight walks it: every location side by side, prime
// cost compared, the location that's off and why, and the rolled-up total.

import { seg, ease, riseIn, countUp } from '../lib/timeline.js';
import { icon } from '../shared/icons.js';
import { esc, kMoney, pct } from '../scenes/why-dishbooks/app.js';

const FLAG_AT = 5.7;

/** Per location and for the group: sales, COGS %, labor %, prime %, EBITDA, net margin. */
function mlNumbers(D) {
  const rows = D.locations.map((l) => ({ name: l.name, sales: l.sales, cogs: l.food + l.bev, labor: l.labor, prime: l.prime, ebitda: l.ebitda, net: l.netPct }));
  const S = rows.reduce((a, r) => a + r.sales, 0);
  const w = (k) => rows.reduce((a, r) => a + r.sales * r[k], 0) / S;
  const total = {
    name: 'All locations',
    sales: S,
    cogs: w('cogs'),
    labor: w('labor'),
    prime: w('prime'),
    ebitda: rows.reduce((a, r) => a + r.ebitda, 0),
    net: (D.locations.reduce((a, l) => a + l.netProfit, 0) / S) * 100,
  };
  const fr = D.flag?.row ?? -1;
  const others = rows.filter((_, i) => i !== fr);
  const othersLabor = others.reduce((a, r) => a + r.sales * r.labor, 0) / others.reduce((a, r) => a + r.sales, 0);
  return { rows, total, fr, othersLabor };
}

function mlView(D, L) {
  const M = mlNumbers(D);
  const lo = 0;
  const hi = Math.ceil(Math.max(...M.rows.map((r) => r.prime)) / 10) * 10 + 5; // bar scale, % of sales
  const x = (v) => `${((v - lo) / (hi - lo)) * 100}%`;
  const cols = L.compact ? ['Prime %', 'Labor %', 'Net'] : ['Sales', 'COGS %', 'Labor %', 'Prime Cost %', 'EBITDA', 'Net Margin'];
  const cells = (r, i) =>
    (L.compact
      ? [pct(r.prime), pct(r.labor), pct(r.net)]
      : [kMoney(r.sales), pct(r.cogs), pct(r.labor), pct(r.prime), kMoney(r.ebitda), pct(r.net)]
    )
      .map((v, c) => `<span class="${i === M.fr && (cols[c] === 'Labor %' || cols[c] === 'Prime Cost %' || cols[c] === 'Prime %') ? 'fl' : ''}">${v}</span>`)
      .join('');
  return `<section class="view mlv">
    <div class="lcs">${M.rows
      .map(
        (r, i) => `<div class="card lc${i === M.fr ? ' off' : ''}">
        <div class="lc-h"><span class="ib">${icon('map-pin')}</span><b>${esc(r.name)}</b><span class="lc-f">Needs attention</span></div>
        <div class="lc-v" data-v="${r.sales}"></div><div class="lc-s">Sales · ${esc(D.period.toLowerCase())}</div>
        <div class="lc-m"><span>Prime cost</span><b>${pct(r.prime)}</b></div>
        <div class="lc-bar"><i style="width:${x(r.prime)}"></i><em style="left:${x(M.total.prime)}"></em></div>
      </div>`,
      )
      .join('')}</div>
    <div class="card pbl">
      <div class="ch"><div class="ct">Prime cost by location <span class="sub">(% of sales)</span></div><div class="lgd"><span><i class="sw c"></i>COGS</span><span><i class="sw l"></i>Labor</span><span><i class="sw g"></i>Group ${pct(M.total.prime)}</span></div></div>
      <div class="pbs2">${M.rows
        .map(
          (r, i) => `<div class="pbr${i === M.fr ? ' off' : ''}"><span class="pn2">${esc(r.name)}</span><div class="trk"><i class="c" style="width:${x(r.cogs)}"></i><i class="l" style="left:${x(r.cogs)};width:${x(r.labor)}"></i><em style="left:${x(M.total.prime)}"></em></div><b>${pct(r.prime)}</b></div>`,
        )
        .join('')}</div>
    </div>
    <div class="card ltb">
      <div class="ch"><div class="ct">Location performance</div><span class="sel">${esc(D.period)}${icon('caret-down', 'car')}</span></div>
      <div class="pt" style="--n:${cols.length}">
        <div class="tr th"><span class="lb">Location</span>${cols.map((c) => `<span>${c}</span>`).join('')}</div>
        ${M.rows.map((r, i) => `<div class="tr${i === M.fr ? ' flag' : ''}"><span class="lb">${esc(r.name)}</span>${cells(r, i)}</div>`).join('')}
        <div class="tr pp trt"><span class="lb">${M.total.name}</span>${cells(M.total, -1)}</div>
      </div>
    </div>
  </section>`;
}

export const STORY = {
  id: 'multi-location',
  duration: 10,
  startAt: { d: 1.35 },
  nav: 5,
  crumb: 'Reports',
  title: 'Location Performance',
  app: { m: { h: 900 } },
  view: (D, L) => mlView(D, L),
  refs: (q, qa) => ({
    lcs: qa('.lc'),
    lcv: qa('.lc-v'),
    lcf: qa('.lc.off .lc-f'),
    lcbars: qa('.lc-bar i'),
    pbl: q('.pbl'),
    segs: qa('.trk i'),
    ltb: q('.ltb'),
    rows: qa('.ltb .tr'),
    fls: qa('.ltb .fl'),
  }),
  blocks: () => ['.lc', '.pbl', '.ltb .ch', '.ltb .tr'],
  spots: (L) => [
      { at: 1.45, dur: 1.9, sel: ['.lcs'], label: 'Every location, side by side', zoom: L.compact ? 1 : 1.2 },
      { at: 3.45, dur: 2.0, sel: ['.pbl'], label: 'Prime cost by location, against the group' },
      {
        at: 5.55,
        dur: 2.0,
        sel: ['.ltb .tr.flag'],
        focus: ['.ltb .th', '.ltb .tr.flag'],
        label: (D) => {
          const M = mlNumbers(D);
          const r = M.rows[M.fr];
          return `${r.name}: labor at ${pct(r.labor)}, vs. about ${Math.round(M.othersLabor)}% elsewhere`;
        },
      },
      { at: 7.65, dur: 1.75, sel: ['.ltb .trt'], focus: ['.ltb .th', '.ltb .trt'], label: 'The group total, rolled up for you' },
  ],
  frame(t, R) {
    R.lcs.forEach((el, i) => riseIn(el, t, 0.05 + i * 0.07, { dy: 12, dur: 0.5 }));
    R.lcv.forEach((el, i) => (el.textContent = kMoney(countUp(t, 0.1 + i * 0.07, 1.0, Number(el.dataset.v)))));
    R.lcbars.forEach((b, i) => (b.style.transform = `scaleX(${ease.outCubic(seg(t, 0.35 + i * 0.07, 0.8)).toFixed(3)})`));
    riseIn(R.pbl, t, 0.3, { dy: 12 });
    R.segs.forEach((b, i) => (b.style.transform = `scaleX(${ease.outCubic(seg(t, 0.5 + Math.floor(i / 2) * 0.08 + (i % 2) * 0.25, 0.6)).toFixed(3)})`));
    riseIn(R.ltb, t, 0.4, { dy: 12 });
    R.rows.forEach((r, i) => riseIn(r, t, 0.5 + i * 0.05, { dy: 4, dur: 0.3 }));
    const fl = ease.outCubic(seg(t, FLAG_AT, 0.35));
    R.fls.forEach((c) => {
      c.style.setProperty('--fl', fl);
      c.classList.toggle('on', fl > 0.5);
    });
    R.lcf.forEach((c) => (c.style.opacity = fl));
  },
};
