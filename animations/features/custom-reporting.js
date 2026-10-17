// Custom Reporting — a saved report, who gets it, and when.
//
// The Weekly Prime Cost report (last week, every location) loads beside its
// sharing settings. The spotlight walks it: the report, its recipients (a GM
// is added, scoped to their own location), and the schedule (Weekly, Monday,
// 7:00 AM → Schedule report). Numbers are one week of the scenario's year, as
// in ../scenes/custom-reports.

import { seg, ease, riseIn, countUp } from '../lib/timeline.js';
import { icon } from '../shared/icons.js';
import { esc, pct } from '../scenes/why-dishbooks/app.js';

const WEEK = 'Oct 5–11'; // the Monday 7:00 AM send on Oct 12, 2026 covers last week
const NEXT = 'Next: Mon, Oct 12 · 7:00 AM';
const ADD = 3.9; // + Add recipient
const WEEKLY = 5.85;
const MONDAY = 6.35;
const SCHEDULE = 6.95;
// Fictional GMs, as in ../scenes/custom-reports/reports.js.
const CR_GMS = {
  home: ['Luis Park', 'GM'],
  'independent-restaurants': ['Tessa Lin', 'GM'],
  'multi-unit-groups': ['Owen Price', 'GM'],
  'casual-dining': ['Dana Whitfield', 'GM'],
};
const dollars = (v) => `$${Math.round(v).toLocaleString('en-US')}`;
const initials = (n) => n.split(' ').map((w) => w[0]).join('');

function crView(D, L) {
  const rows = D.locations.map((l) => ({ name: l.name, sales: l.sales / 52, cogs: l.food + l.bev, labor: l.labor, prime: l.prime }));
  const S = rows.reduce((a, r) => a + r.sales, 0);
  const w = (k) => rows.reduce((a, r) => a + r.sales * r[k], 0) / S;
  const tot = { name: 'Total', sales: S, cogs: w('cogs'), labor: w('labor'), prime: w('prime') };
  const flag = D.locations[Math.max(0, D.flag?.row ?? 0)].name;
  const [gm, gmRole] = CR_GMS[D.id] ?? ['Luis Park', 'GM'];
  const u = D.user;
  const tile = (label, v, sub) => `<div class="card tile"><div class="lbl">${label}</div><div class="tv" data-v="${v}" data-f="${sub ? 'pct' : 'usd'}"></div>${sub ? `<div class="ts">${sub}</div>` : '<div class="ts">last week</div>'}</div>`;
  const cols = L.compact ? ['Sales', 'Prime %'] : ['Sales', 'COGS %', 'Labor %', 'Prime %'];
  const cells = (r) => (L.compact ? [dollars(r.sales), pct(r.prime)] : [dollars(r.sales), pct(r.cogs), pct(r.labor), pct(r.prime)]).map((v) => `<span>${v}</span>`).join('');
  const recip = (name, role, scope, cls) =>
    `<div class="rr ${cls}"><span class="av">${esc(initials(name))}</span><div class="rn"><b>${esc(name)}</b><span>${esc(role)}</span></div><span class="rs2">${icon('map-pin')}${esc(scope)}</span></div>`;
  return `<section class="view crv">
    <div class="card rpt">
      <div class="ch"><div><div class="ct">Weekly Prime Cost</div><div class="rsub">${WEEK} · ${esc(D.company.scopeLabel)}</div></div><span class="sel">Template: Prime Cost P&amp;L${icon('caret-down', 'car')}</span></div>
      <div class="tiles">${tile('Sales', S)}${tile('COGS', tot.cogs, 'of sales')}${tile('Labor', tot.labor, 'of sales')}${tile('Prime Cost', tot.prime, 'of sales')}</div>
      <div class="pt" style="--n:${cols.length}">
        <div class="tr th"><span class="lb">Location</span>${cols.map((c) => `<span>${c}</span>`).join('')}</div>
        ${rows.map((r) => `<div class="tr"><span class="lb">${esc(r.name)}</span>${cells(r)}</div>`).join('')}
        <div class="tr pp"><span class="lb">Total</span>${cells(tot)}</div>
      </div>
      ${
        L.compact
          ? ''
          : `<div class="rbs"><div class="lbl">Prime cost by location</div>${rows
              .map((r) => `<div class="rb"><span>${esc(r.name)}</span><div class="rtk"><i style="width:${((r.prime / 70) * 100).toFixed(1)}%"></i></div><b>${pct(r.prime)}</b></div>`)
              .join('')}</div>`
      }
    </div>
    <div class="crs">
      <div class="card rcp">
        <div class="ct">Recipients</div>
        ${recip(`${u.firstName} ${u.lastName}`, u.role, 'All locations', 'own')}
        <div class="gmw">${recip(gm, `${gmRole} · ${flag}`, flag, 'gm')}</div>
        <div class="radd">${icon('arrow-right', 'pl2')}Add recipient</div>
      </div>
      <div class="card sch">
        <div class="ct">Schedule</div>
        <div class="fr"><span class="fl2">Repeats</span><div class="seg2"><span class="d">Daily</span><span class="w">Weekly</span><span>Monthly</span></div></div>
        <div class="fr"><span class="fl2">On</span><div class="dys">${['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => `<span class="${i === 0 ? 'mon' : ''}">${d}</span>`).join('')}</div></div>
        <div class="fr"><span class="fl2">At</span><span class="sel">7:00 AM${icon('caret-down', 'car')}</span></div>
        <div class="fr"><span class="fl2">Send as</span><span class="sv">Email · PDF attached</span></div>
        <div class="sbtn"><span class="b1">${icon('paper-plane-right')}Schedule report</span><span class="b2">${icon('check')}${NEXT}</span></div>
      </div>
      ${
        !L.tall
          ? ''
          : `<div class="card hist"><div class="ct">Recent sends</div>${['Mon, Oct 5', 'Mon, Sep 28', 'Mon, Sep 21']
              .map((d) => `<div class="hr"><span class="hk">${icon('check')}</span><div class="rn"><b>${d} · 7:00 AM</b><span>Delivered to ${esc(u.firstName)} ${esc(u.lastName)}</span></div><span class="hp">PDF</span></div>`)
              .join('')}</div>`
      }
    </div>
  </section>`;
}

export const STORY = {
  id: 'custom-reporting',
  duration: 10,
  startAt: { d: 1.25 },
  nav: 5,
  crumb: 'Reports',
  title: 'Custom Reports',
  app: { m: { h: 1180 } },
  view: (D, L) => crView(D, L),
  refs: (q, qa) => ({
    rpt: q('.rpt'),
    tvs: qa('.rpt .tv'),
    rows: qa('.rpt .pt .tr'),
    rbs: qa('.rtk i'),
    hist: q('.hist'),
    rcp: q('.rcp'),
    gmw: q('.gmw'),
    gm: q('.rr.gm'),
    add: q('.radd'),
    sch: q('.sch'),
    daily: q('.seg2 .d'),
    weekly: q('.seg2 .w'),
    mon: q('.dys .mon'),
    sbtn: q('.sbtn'),
  }),
  blocks: () => ['.rpt', '.rcp', '.sch', '.hist'],
  spots: () => [
    { at: 1.3, dur: 1.9, sel: ['.rpt'], label: 'Build the report once: prime cost by location' },
    { at: 3.3, dur: 2.1, sel: ['.rcp'], label: 'Each person gets only their own locations' },
    { at: 5.5, dur: 2.9, sel: ['.sch'], label: 'Every Monday at 7 AM, in their inbox' },
  ],
  taps: () => [
    { at: ADD, el: (R) => R.add, fx: 0.25 },
    { at: WEEKLY, el: (R) => R.weekly },
    { at: MONDAY, el: (R) => R.mon },
    { at: SCHEDULE, el: (R) => R.sbtn },
  ],
  frame(t, R) {
    riseIn(R.rpt, t, 0.05, { dy: 12 });
    R.tvs.forEach((el, i) => {
      const v = countUp(t, 0.1 + i * 0.06, 0.85, Number(el.dataset.v));
      el.textContent = el.dataset.f === 'pct' ? pct(v) : dollars(v);
    });
    R.rows.forEach((r, i) => riseIn(r, t, 0.25 + i * 0.05, { dy: 4, dur: 0.3 }));
    riseIn(R.rcp, t, 0.15, { dy: 12 });
    riseIn(R.sch, t, 0.25, { dy: 12 });
    if (R.hist) riseIn(R.hist, t, 0.35, { dy: 12 });
    R.rbs.forEach((b, i) => (b.style.transform = `scaleX(${ease.outCubic(seg(t, 0.45 + i * 0.07, 0.7)).toFixed(3)})`));
    // The GM's row opens under the owner's.
    const g = ease.inOutCubic(seg(t, ADD + 0.05, 0.4));
    R.gmw.style.height = `${(R.gm.offsetHeight * g).toFixed(1)}px`;
    R.gm.style.opacity = seg(t, ADD + 0.2, 0.3);
    R.daily.classList.toggle('on', t < WEEKLY);
    R.weekly.classList.toggle('on', t >= WEEKLY);
    R.mon.classList.toggle('on', t >= MONDAY);
    R.sbtn.classList.toggle('done', t >= SCHEDULE + 0.08);
    const press = (a) => seg(t, a - 0.06, 0.06) - seg(t, a + 0.04, 0.12);
    R.sbtn.style.scale = 1 - press(SCHEDULE) * 0.05;
    R.add.style.scale = 1 - press(ADD) * 0.05;
  },
};
