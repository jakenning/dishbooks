// Why DishBooks — "Restaurant accounting, simplified by AI."
//
// The whole app in one fixed window (no camera moves): the cursor walks the
// sidebar and each page loads in place.
//
//   Home      KPI cards count up, sales chart and cost breakdown draw
//   Banking   cash across accounts; "Accept 6 matches" reconciles the feed
//   Reports → Prime Cost P&L by location; COGS opens into the company's own
//             categories and the location that's off gets flagged
//   Ask Dex   the question about that location, answer streams in
//   → back to Home (seamless 12s loop: t = 12 is the empty page t = 0 starts on)
//
// This file is the story, shared by both layouts: scenes/why-dishbooks
// (1280 × 720 desktop window) and scenes/why-dishbooks-mobile (400 × 720, the
// app's phone layout with a drawer menu). Timings are in CUES; company, people
// and every number come from the scenario JSON.

import { seg, ease, lerp, clamp, riseIn, countUp } from '../../lib/timeline.js';
import { icon } from '../../shared/icons.js';
import { CATS } from '../../shared/categories.js';

// Seconds. [start, duration] pairs unless noted. `go*` are the clicks that
// change page; the page swap and the nav highlight follow each one.
export const CUES = {
  homeIn: 0, // Home loads (t = 0 is an empty page, like t = 12)
  kpis: 0.05,
  kpiStagger: 0.07,
  countDur: 1.3,
  chartDraw: [0.35, 1.1],
  toRest: [0.25, 0.7], // cursor eases off the nav into the page
  toBank: [2.0, 0.5],
  goBank: 2.6,
  toAccept: [3.05, 0.45],
  accept: 3.6,
  matched: [3.7, 0.1], // rows flip to Reconciled (start, stagger)
  toReports: [4.55, 0.45],
  goReports: 5.1,
  toCogs: [5.5, 0.45],
  cogs: 6.05,
  cats: [6.1, 0.55], // COGS opens into the categories
  flag: 6.75, // the location that's off lights up
  toDex: [7.0, 0.5],
  goDex: 7.6,
  dexIn: [7.65, 0.35],
  typeAsk: [7.95, 0.5],
  send: 8.55,
  thinking: [8.6, 0.3],
  answer: [8.9, 1.3],
  dexRest: [8.0, 0.6], // cursor steps out of the panel while Dex answers
  toHome: [10.7, 0.55],
  goHome: 11.35, // Dex closes, the page clears; t = 12 → t = 0
  // Phone only: the menu button is tapped this long before each nav tap.
  menuLead: 0.55,
};

const NAV = [
  ['house-simple', 'Home', false],
  ['cash-register', 'Sales', true],
  ['invoice', 'Expenses', true],
  ['money', 'Transactions', false],
  ['bank', 'Banking', false],
  ['building-office', 'Reports', true],
  ['chart-line-up', 'Budgeting & Forecasting', true],
  ['cog', 'Settings', false], // drawn by COG below
];
// Page per nav click: [click time, nav index, page index]. Page 0 Home, 1 Banking, 2 P&L.
const PAGES = [
  ['Home', ''],
  ['Banking', ''],
  ['Prime Cost P&amp;L', 'Reports'],
];
const STOPS = [
  [CUES.goBank, 4, 1],
  [CUES.goReports, 5, 2],
  [CUES.goHome, 0, 0],
];

// Chart colours, from the app's Chart.js config.
const COL = { indigo: '#4f39f6', indigo300: '#a3b3ff', green: '#00a63e', red: '#e7000b', blue: '#326cff' };
const DOUGHNUT = ['#4f39f6', '#f6339a', '#fe9a00', 'rgba(11,12,13,.6)'];

const MARK = `<svg class="mark" viewBox="0 0 68 48" aria-hidden="true"><defs><linearGradient id="__ID__m" x1="0" y1="24" x2="85" y2="24" gradientUnits="userSpaceOnUse"><stop offset=".1" stop-color="#2EB2FF"/><stop offset="1" stop-color="#326CFF"/></linearGradient></defs><path d="M46.19 24C46.19 10.97 34.49.33 19.96 0H2.01C.9 0 0 .88 0 1.97v44.07C0 47.12.9 48 2.01 48h17.95C34.49 47.67 46.19 37.03 46.19 24Z" fill="url(#__ID__m)"/><path d="M57.11 24c0-11.23-8.69-20.69-20.39-23.29-.83-.19-1.3.9-.59 1.34 7.76 4.81 12.85 12.86 12.85 21.95s-5.09 17.14-12.85 21.95c-.71.44-.24 1.52.59 1.34C48.41 44.69 57.11 35.23 57.11 24Z" fill="#326CFF"/><path d="M47.5.63c-.82-.19-1.3.9-.58 1.34C54.74 6.78 59.89 14.86 59.89 24c0 9.15-5.15 17.23-12.98 22.04-.72.44-.24 1.53.6 1.34 4.62-1.04 8.75-3.3 12-6.4 4.54-4.35 7.35-10.35 7.35-16.97C66.85 12.63 58.59 3.1 47.5.63Z" fill="#5542FF"/></svg>`;
const CURSOR = `<svg viewBox="0 0 22 22"><path d="M4 2.5v15.2l4.1-3.9 2.7 6.1 2.6-1.1-2.7-6h5.7L4 2.5Z" fill="#0b0c0d" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/></svg>`;
// Light stand-ins for Phosphor's gear and sun (1.7k and 0.6k of path): a
// dashed ring draws the teeth or rays.
const COG = `<svg class="pi" viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true"><circle cx="8" cy="8" r="5.9" stroke-width="2.2" stroke-dasharray="2.32 2.32"/><circle cx="8" cy="8" r="4.4" stroke-width="1.5"/><circle cx="8" cy="8" r="1.9" stroke-width="1.4"/></svg>`;
const SUN = `<svg class="pi" viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true"><circle cx="8" cy="8" r="3" stroke-width="1.5"/><circle cx="8" cy="8" r="6.3" stroke-width="2.2" stroke-dasharray="1.2 3.75"/></svg>`;
const MENU = `<svg class="pi" viewBox="0 0 256 256" fill="none" stroke="currentColor" stroke-width="16" stroke-linecap="round" aria-hidden="true"><path d="M40 64h176M40 128h176M40 192h176"/></svg>`;

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const n1 = (v) => v.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
/** The app's money format: thousands with one decimal, e.g. $2,862.4k. */
const kMoney = (v) => `${v < 0 ? '-' : ''}$${n1(Math.abs(v) / 1000)}k`;
const pct = (v) => `${v.toFixed(1)}%`;
const f1 = (v) => v.toFixed(1);
/** Bank amounts: cents → +$1,234.56 / -$1,234.56. */
const cents = (c, sign = true) =>
  `${sign ? (c < 0 ? '-' : '+') : ''}$${(Math.abs(c) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const axisMoney = (v) => (v >= 1e6 ? `$${+(v / 1e6).toFixed(2)}M` : `$${Math.round(v / 1e3)}K`);

// ---- Chart geometry (mirrors Chart.js curve modes, as in smart-ops-dashboard) --

function splineD(pts, tension) {
  const cp = pts.map((p, i) => {
    const a = pts[i - 1] ?? p;
    const b = pts[i + 1] ?? p;
    const d01 = Math.hypot(p[0] - a[0], p[1] - a[1]);
    const d12 = Math.hypot(b[0] - p[0], b[1] - p[1]);
    const s01 = d01 + d12 ? d01 / (d01 + d12) : 0;
    const s12 = d01 + d12 ? d12 / (d01 + d12) : 0;
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    return { in: [p[0] - tension * s01 * dx, p[1] - tension * s01 * dy], out: [p[0] + tension * s12 * dx, p[1] + tension * s12 * dy] };
  });
  let d = `M${f1(pts[0][0])} ${f1(pts[0][1])}`;
  for (let i = 1; i < pts.length; i++) d += `C${cp[i - 1].out.map(f1)} ${cp[i].in.map(f1)} ${pts[i].map(f1)}`;
  return d;
}

function monoD(pts) {
  const n = pts.length;
  const m = [];
  for (let i = 0; i < n - 1; i++) m.push((pts[i + 1][1] - pts[i][1]) / (pts[i + 1][0] - pts[i][0]));
  const tg = pts.map((_, i) => (i === 0 ? m[0] : i === n - 1 ? m[n - 2] : m[i - 1] * m[i] <= 0 ? 0 : (m[i - 1] + m[i]) / 2));
  for (let i = 0; i < n - 1; i++) {
    if (m[i] === 0) {
      tg[i] = tg[i + 1] = 0;
      continue;
    }
    const a = tg[i] / m[i];
    const b = tg[i + 1] / m[i];
    const h = a * a + b * b;
    if (h > 9) {
      const k = 3 / Math.sqrt(h);
      tg[i] = k * a * m[i];
      tg[i + 1] = k * b * m[i];
    }
  }
  let d = `M${f1(pts[0][0])} ${f1(pts[0][1])}`;
  for (let i = 0; i < n - 1; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[i + 1];
    const h = (x1 - x0) / 3;
    d += `C${f1(x0 + h)},${f1(y0 + tg[i] * h)} ${f1(x1 - h)},${f1(y1 - tg[i + 1] * h)} ${f1(x1)},${f1(y1)}`;
  }
  return d;
}

function ticks4(lo, hi, count = 4) {
  const raw = (hi - lo) / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((k) => k * mag).find((s) => s >= raw);
  const min = Math.floor(lo / step) * step;
  const max = Math.ceil(hi / step) * step;
  const out = [];
  for (let v = min; v <= max + step / 2; v += step) out.push(v);
  return { min, max, ticks: out };
}

// ---- Fictional numbers ------------------------------------------------------------

function model(D) {
  const cats = CATS[D.id] ?? CATS.default;
  const P = Object.fromEntries(D.pnl.map((r) => [r.metric, r.actual]));
  const locs = D.locations;
  const n = locs.length;

  // Prime Cost P&L, one column per location. Worked in hundreds of dollars so
  // every $k figure (one decimal) foots: categories → COGS, COGS + labor →
  // prime cost, locations → total.
  const col = (name, sales, food, bev, labor) => {
    const s = Math.round(sales / 100);
    const side = { f: Math.round((s * food) / 100), b: Math.round((s * bev) / 100) };
    const cat = cats.map(([, k, share]) => Math.round(side[k] * share));
    for (const k of ['f', 'b']) {
      const idx = cats.flatMap((c, i) => (c[1] === k ? [i] : []));
      if (!idx.length) continue;
      const big = idx.reduce((a, i) => (cat[i] > cat[a] ? i : a), idx[0]);
      cat[big] += side[k] - idx.reduce((a, i) => a + cat[i], 0);
    }
    const cogs = cat.reduce((a, b) => a + b, 0);
    const lab = Math.round((s * labor) / 100);
    return { name, sales: s, cat, cogs, labor: lab, prime: cogs + lab };
  };
  const cols = locs.map((l) => col(l.name, l.sales, l.food, l.bev, l.labor));
  const sum = (k) => cols.reduce((a, c) => a + c[k], 0);
  const total = { name: 'Total', sales: sum('sales'), cat: cats.map((_, i) => cols.reduce((a, c) => a + c.cat[i], 0)), cogs: sum('cogs'), labor: sum('labor'), prime: sum('prime') };
  const flagRow = D.flag ? D.flag.row : -1;

  // Bank feed: amounts in cents, sized from the scenario's annual P&L.
  const salesTot = locs.reduce((a, l) => a + l.sales, 0);
  const foodShare = locs.reduce((a, l) => a + l.sales * l.food, 0) / locs.reduce((a, l) => a + l.sales * (l.food + l.bev), 0);
  const opex = P['Operating Expenses'];
  const at = (i) => locs[i % n].name;
  const card = (i) => (n > 1 ? `Card deposits · ${at(i)}` : 'Card deposits');
  const c = (v) => Math.round(v * 100);
  const tx = [
    ['Oct 8', card(0), 'Sales', c((locs[0].sales / 364) * 1.06)],
    ['Oct 8', 'Larkfield Provisions', 'COGS · Food', -c(((P.COGS * foodShare) / 52) * 0.31)],
    ['Oct 8', card(1), 'Sales', c((locs[1 % n].sales / 364) * 0.97)],
    ['Oct 7', 'Payroll · direct deposit', 'Payroll', -c((P.Labor / 26) * 0.74)],
    ['Oct 7', 'Copperleaf Beverage Co.', 'COGS · Beverage', -c(((P.COGS * (1 - foodShare)) / 52) * 0.42)],
    ['Oct 7', card(2), 'Sales', c((locs[2 % n].sales / 364) * 1.13)],
    ['Oct 6', `Rent · ${at(0)}`, 'Occupancy', -c(((opex / 12) * 0.3) / n)],
    ['Oct 6', 'Valecrest Power & Light', 'Utilities', -c(((opex / 12) * 0.05) / n)],
  ];
  const cashK = D.kpis.find((k) => k.key === 'cash');
  const cash = Math.round(cashK.value * 100);
  const op = Math.round(cash * 0.8194);

  return {
    cats,
    cols: n > 1 ? [...cols, total] : cols,
    total: n > 1 ? total : cols[0],
    flagRow,
    flagLine: D.flag?.col === 'labor' ? 'labor' : 'cogs',
    salesTot,
    tx,
    cash,
    // Money in / out over the last week: 1/52 of sales, and of everything paid out.
    week: { in: c(P['Total Sales'] / 52), out: -c((P.COGS + P.Labor + opex) / 52) },
    cashSpark: cashK.spark,
    accounts: [
      ['Operating', '4821', op],
      ['Payroll', '2210', cash - op],
    ],
  };
}

// ---- Markup -------------------------------------------------------------------------

function spark(k, id) {
  const W = 212;
  const H = 56;
  const pad = (Math.max(...k.spark) - Math.min(...k.spark)) * 0.3;
  const lo = Math.min(...k.spark) - pad;
  const hi = Math.max(...k.spark) + pad;
  const pts = k.spark.map((v, i) => [(i / (k.spark.length - 1)) * W, H - 6 - ((v - lo) / (hi - lo || 1)) * (H - 16)]);
  const d = splineD(pts, 0.3);
  const cl = k.trend === 'declining' ? COL.red : COL.green;
  return `<svg class="spark" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
    <clipPath id="${id}"><rect class="rv" width="0" height="${H}"/></clipPath>
    <g clip-path="url(#${id})"><path d="${d}L${W} ${H}L0 ${H}Z" fill="color-mix(in srgb, ${cl} 12%, transparent)"/><path d="${d}" fill="none" stroke="${cl}" stroke-width="2" vector-effect="non-scaling-stroke"/></g></svg>`;
}

/** Line chart with x labels: this period (solid, hatched fill) and an optional dashed comparison. */
function lineChart(D, now, prev, { W, H, id, x0 = 48, every = 2, cls }) {
  const P = { x0, x1: W - 6, y0: 12, y1: H - 22 };
  const all = [...now, ...(prev ?? [])];
  const { min, max, ticks } = ticks4(Math.min(...all), Math.max(...all), H < 160 ? 3 : 4);
  const x = (i) => P.x0 + (i / (now.length - 1)) * (P.x1 - P.x0);
  const y = (v) => P.y1 - ((v - min) / (max - min)) * (P.y1 - P.y0);
  const nowD = monoD(now.map((v, i) => [x(i), y(v)]));
  return `<svg class="${cls}" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <defs><pattern id="${id}p" width="6" height="2" patternUnits="userSpaceOnUse"><rect width="2" height="2" fill="${COL.indigo300}"/></pattern>
    <clipPath id="${id}c"><rect class="rv" width="0" height="${H}"/></clipPath></defs>
    <g class="grid">${ticks.map((v) => `<line x1="${P.x0}" x2="${P.x1}" y1="${f1(y(v))}" y2="${f1(y(v))}"/><text x="${P.x0 - 8}" y="${f1(y(v) + 4)}" text-anchor="end">${axisMoney(v)}</text>`).join('')}</g>
    <g>${D.months.map((m, i) => (i % every ? '' : `<text x="${f1(x(i))}" y="${H - 4}" text-anchor="middle">${m}</text>`)).join('')}</g>
    <g clip-path="url(#${id}c)">
      <path d="${nowD}L${P.x1} ${P.y1}L${P.x0} ${P.y1}Z" fill="url(#${id}p)"/>
      ${prev ? `<path d="${monoD(prev.map((v, i) => [x(i), y(v)]))}" fill="none" stroke="${COL.indigo}" stroke-width="2" stroke-dasharray="5 5"/>` : ''}
      <path d="${nowD}" fill="none" stroke="${COL.indigo}" stroke-width="${prev ? 3 : 2.5}" stroke-linejoin="round"/>
    </g></svg>`;
}

function donut(items, S) {
  const r = S * 0.418;
  const total = items.reduce((a, b) => a + b.pct, 0);
  return `<svg class="donut" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}"><g transform="rotate(-90 ${S / 2} ${S / 2})">${items
    .map((it, i) => `<circle class="slice" cx="${S / 2}" cy="${S / 2}" r="${f1(r)}" fill="none" stroke="${DOUGHNUT[i % 4]}" stroke-width="${f1(S * 0.15)}" data-f="${it.pct / total}"/>`)
    .join('')}</g></svg>`;
}

/** Dex answer → paragraphs of word spans, with **bold** kept. */
function answerHtml(paragraphs) {
  return paragraphs
    .map(
      (p) =>
        `<p>${p
          .split(/(\*\*[^*]+\*\*)/)
          .filter(Boolean)
          .map((part) => {
            const bold = part.startsWith('**');
            return part
              .replace(/\*\*/g, '')
              .split(/(\s+)/)
              .map((w) => (w.trim() ? `<span class="wd">${bold ? `<b>${esc(w)}</b>` : esc(w)}</span>` : w))
              .join('');
          })
          .join('')}</p>`,
    )
    .join('');
}

function homeView(D, L, id) {
  const kpis = L.compact ? D.kpis.filter((k) => k.key !== 'ebitda') : D.kpis;
  const total = D.costBreakdown.reduce((a, b) => a + b.pct, 0);
  return `<section class="view home">
    <div class="kpis">${kpis.map((k, i) => `<div class="card kpi" data-k="${i}"><div class="lbl">${esc(k.label)}</div><div class="kv"></div>${spark(k, `${id}s${i}`)}</div>`).join('')}</div>
    <div class="hrow">
      <div class="card salesp">
        <div class="ch"><div class="ct">Sales Performance</div>${L.compact ? '' : `<span class="sel">Monthly${icon('caret-down', 'car')}</span>`}</div>
        ${L.compact ? '' : `<div class="stats"><div><span>Guests</span><b>${D.sales.guests.toLocaleString('en-US')}</b></div><div><span>Average Check</span><b>$${D.sales.avgCheck.toFixed(2)}</b></div></div>`}
        <div class="legend"><span><i class="solid"></i>This Period</span><span><i class="dash"></i>Last Year</span></div>
        ${lineChart(D, D.sales.thisPeriod, D.sales.lastYear, { ...L.sales, id: `${id}a`, cls: 'chart sales' })}
      </div>
      <div class="card cost">
        <div class="ct">Cost Breakdown <span class="sub">(as % of Sales)</span></div>
        <div class="cost-b">
          <div class="dw">${donut(D.costBreakdown, L.donut)}<div class="dc"><span>Total Cost</span><b>${pct(total)}</b></div></div>
          <ul class="cl">${D.costBreakdown.map((c, i) => `<li><i style="background:${DOUGHNUT[i % 4]}"></i><span>${esc(c.label)}</span><b>${pct(c.pct)}</b></li>`).join('')}</ul>
        </div>
      </div>
    </div>
  </section>`;
}

function bankView(D, L, N, id) {
  const rows = N.tx.slice(0, L.txRows);
  const nMatch = L.txRows - 2;
  const status = `<span class="st"><span class="s1">Match found</span><span class="s2">${icon('check')}Reconciled</span></span>`;
  return `<section class="view bank">
    <div class="card cashc">
      <div class="lbl">Cash Balance</div>
      <div class="big"></div>
      <div class="cs">Across ${N.accounts.length} accounts · synced 6:02 AM</div>
      ${L.compact ? '' : `<div class="stats"><div><span>In · 7 days</span><b class="in">${cents(N.week.in)}</b></div><div><span>Out · 7 days</span><b>${cents(N.week.out)}</b></div></div>`}
      <ul class="acc">${N.accounts.map(([nm, last4, v]) => `<li>${icon('bank', 'ai2')}<span>${nm} <em>••${last4}</em></span><b>${cents(v, false)}</b></li>`).join('')}</ul>
      ${L.compact ? '' : `<div class="trend"><div class="lbl sm">Last 12 months</div>${lineChart(D, N.cashSpark, null, { ...L.cashChart, id: `${id}b`, cls: 'chart cashx' })}</div>`}
    </div>
    <div class="card txc">
      <div class="txh">
        <div><div class="ct">Bank Transactions</div><div class="prog"><span class="pn"></span> of 24 reconciled<i><i></i></i></div></div>
        <span class="btn"><span class="b1">${icon('check')}Accept ${nMatch} matches</span><span class="b2">${icon('check')}All reconciled</span></span>
      </div>
      <div class="tx">
        ${L.compact ? '' : '<div class="tr th"><span>Date</span><span>Description</span><span>Category</span><span>Amount</span><span>Status</span></div>'}
        ${rows
          .map(
            ([date, desc, cat, amt], i) =>
              `<div class="tr${i < nMatch ? ' m' : ' ok'}">${
                L.compact
                  ? `<span class="d2"><b>${esc(desc)}</b><em>${date} · ${cat}</em></span><span class="am${amt > 0 ? ' in' : ''}">${cents(amt)}</span>${status}`
                  : `<span class="dt">${date}</span><span class="ds">${esc(desc)}</span><span class="cg">${cat}</span><span class="am${amt > 0 ? ' in' : ''}">${cents(amt)}</span>${status}`
              }</div>`,
          )
          .join('')}
      </div>
    </div>
  </section>`;
}

function plView(D, L, N) {
  const fr = N.flagRow;
  // Phone: the flagged location next to the total.
  const shown = L.compact ? (N.cols.length > 1 ? [N.cols[Math.max(0, fr)], N.cols[N.cols.length - 1]] : N.cols) : N.cols;
  const isFlag = (c) => fr >= 0 && c === N.cols[fr] && N.cols.length > 1;
  // Line-item values are filled in (counting up) by frame().
  const cells = (k) => shown.map((c) => `<span class="${isFlag(c) && k === N.flagLine ? 'fl' : ''}${c.name === 'Total' ? ' tot' : ''}"></span>`).join('');
  const row = (k, label, cls = '') => `<div class="tr ${cls}" data-row="${k}"><span class="lb">${label}</span>${cells(k)}</div>`;
  const tile = (label, v) => `<div class="card tile"><div class="lbl">${label}</div><div class="tv">${pct(v)}</div><div class="ts">of sales${N.cols.length > 1 && !L.compact ? ' · all locations' : ''}</div></div>`;
  // Tiles use the P&L itself, so they match the KPI cards and cost breakdown on Home.
  const P = Object.fromEntries(D.pnl.map((r) => [r.metric, r.actual]));
  const of = (k) => (P[k] / P['Total Sales']) * 100;
  return `<section class="view pl">
    <div class="tiles">${tile('COGS', of('COGS'))}${tile('Labor', of('Labor'))}${tile('Prime Cost', of('Prime Cost'))}</div>
    <div class="card plc">
      <div class="ch"><div class="ct">By ${esc(D.rowLabel.toLowerCase())}</div><span class="sel">Columns: ${esc(D.rowLabel)}${icon('caret-down', 'car')}</span></div>
      <div class="pt" style="--n:${shown.length}">
        <div class="tr th"><span class="lb"></span>${shown.map((c) => `<span class="${c.name === 'Total' ? 'tot' : ''}">${esc(c.name)}</span>`).join('')}</div>
        ${row('sales', 'Total Sales')}
        ${row('cogs', `${icon('caret-right', 'tw')}COGS`, 'cogs')}
        <div class="cats"><div class="cin">${N.cats.map(([name], i) => `<div class="tr cr" data-cat="${i}"><span class="lb">${esc(name)}</span>${shown.map((c) => `<span${c.name === 'Total' ? ' class="tot"' : ''}>${kMoney(c.cat[i] * 100)}</span>`).join('')}</div>`).join('')}</div></div>
        ${row('labor', 'Labor')}
        ${row('prime', 'Prime Cost', 'pr')}
        <div class="tr pp" data-row="pp"><span class="lb">Prime Cost %</span>${shown.map((c) => `<span class="${isFlag(c) ? 'fl' : ''}${c.name === 'Total' ? ' tot' : ''}">${pct((c.prime / c.sales) * 100)}</span>`).join('')}</div>
      </div>
    </div>
  </section>`;
}

// ---- Scene ----------------------------------------------------------------------------
// L: { meta, startAt, compact, touch, txRows, sales, cashChart, donut, rest }
//   startAt: where in the story t = 0 falls (s). The loop is seamless, so the
//            timeline is just rotated: the video's first frame, which Webflow
//            uses as the poster, shows the dashboard loaded. CUES stay in story
//            time.
//   compact: the app's phone layout (top bar + drawer instead of a sidebar)
//   touch:   a fingertip at each tap instead of a gliding mouse pointer

export function makeScene(L) {
  let R;
  let root;
  let D;
  let N;
  let colsShown;

  function build(el, data) {
    root = el;
    D = data;
    N = model(data);
    el.classList.add('db-anim', 'wdb');
    if (L.compact) el.classList.add('m');
    window.__wdN = (window.__wdN ?? 0) + 1;
    const id = `wd${window.__wdN}`;
    const u = data.user;

    el.innerHTML = `
    ${L.compact ? `<div class="mbar"><span class="menu">${MENU}</span><div class="logo">${MARK.replaceAll('__ID__', `${id}t`)}<span>DishBooks</span></div><span class="av">${esc(u.initials)}</span></div>` : '<div class="chrome"><i></i><i></i><i></i></div>'}
    <div class="main">
      <header class="top">
        <div class="tt"><span class="crumb"></span><h5 class="ttl"></h5></div>
        ${L.compact ? '' : `<span class="pill">${icon('calendar')}${esc(data.period)}${icon('caret-down', 'car')}</span><span class="chip">${icon('map-pin')}${esc(data.company.scopeLabel)}</span>`}
      </header>
      <div class="views">${homeView(data, L, id)}${bankView(data, L, N, id)}${plView(data, L, N)}</div>
    </div>
    ${L.compact ? '<div class="scrim"></div>' : ''}
    <nav class="side">
      <div class="logo">${MARK.replaceAll('__ID__', id)}<span>DishBooks</span></div>
      <div class="org">
        <div class="org-row"><span class="ib">${icon('buildings')}</span><span class="org-name">${esc(data.company.name)}</span>${icon('caret-down', 'car')}</div>
        <div class="org-row"><span class="ib">${icon('map-pin')}</span><span class="org-name">${esc(data.company.scopeLabel)}</span>${icon('caret-down', 'car')}</div>
      </div>
      <div class="items"><i class="nhl"></i>${NAV.map(([ic, label, more]) => `<div class="ni"><span class="ib">${ic === 'cog' ? COG : icon(ic)}</span><span class="nl">${esc(label)}</span>${more ? icon('caret-down', 'car') : ''}</div>`).join('')}</div>
      <div class="grow"></div>
      <div class="setup"><div><b>Setup</b><span>3/4</span></div><i><i></i></i></div>
      <div class="dex-btn"><div class="dex-btn-in"><span>Ask Dex</span><span class="ai">AI</span></div></div>
      <div class="me"><span class="av">${esc(u.initials)}</span><span class="me-name">${esc(u.firstName)} ${esc(u.lastName)}</span><span class="mode">${SUN}</span></div>
    </nav>
    <aside class="dex">
      <header><span class="orb"></span><b>Dex</b><span class="ai">AI</span><span class="grow"></span>${icon('x')}</header>
      <div class="dex-body">
        <div class="msg"><span class="orb sm"></span><div class="dex-message"><p>Hi ${esc(u.firstName)}, ask me anything about your numbers.</p></div></div>
        <div class="bubble">${esc(data.dex.ask)}</div>
        <div class="msg ans"><span class="orb sm"></span><div class="dex-message">${answerHtml(data.dex.answer)}<div class="dots"><i></i><i></i><i></i></div></div></div>
      </div>
      <footer><div class="input"><span class="typed"></span><span class="caret"></span><span class="ph">Ask Dex about your numbers…</span><span class="send">${icon('paper-plane-right')}</span></div></footer>
    </aside>
    <div class="cursor${L.touch ? ' touch' : ''}"><div class="ripple"></div>${L.touch ? '<div class="tip"></div>' : CURSOR}</div>`;

    const q = (s) => el.querySelector(s);
    const qa = (s) => [...el.querySelectorAll(s)];
    const kpis = L.compact ? data.kpis.filter((k) => k.key !== 'ebitda') : data.kpis;
    colsShown = qa('.pl .th > span:not(.lb)').length;
    R = {
      viewsEl: q('.views'),
      views: qa('.view'),
      ttl: q('.ttl'),
      crumb: q('.crumb'),
      tt: q('.tt'),
      side: q('.side'),
      scrim: q('.scrim'),
      menu: q('.menu'),
      nis: qa('.ni'),
      nhl: q('.nhl'),
      dexBtn: q('.dex-btn'),
      dexBtnIn: q('.dex-btn-in'),
      // Home
      kpis: qa('.kpi').map((k, i) => ({ el: k, kv: k.querySelector('.kv'), rv: k.querySelector('.rv'), d: kpis[i] })),
      salesp: q('.salesp'),
      salesRv: q('.sales .rv'),
      cost: q('.cost'),
      slices: qa('.slice'),
      dc: q('.dc'),
      costItems: qa('.cl li'),
      // Banking
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
      // P&L
      tiles: qa('.tile'),
      plc: q('.plc'),
      plRows: qa('.pt > .tr:not(.th)'),
      cogs: q('.tr.cogs'),
      tw: q('.tw'),
      cats: q('.cats'),
      cin: q('.cin'),
      crs: qa('.cr'),
      fls: qa('.pt .fl'),
      // Dex
      dex: q('.dex'),
      bubble: q('.bubble'),
      ans: q('.msg.ans'),
      dots: q('.dots'),
      words: qa('.ans .wd'),
      typed: q('.typed'),
      caret: q('.caret'),
      ph: q('.ph'),
      cursor: q('.cursor'),
      ripple: q('.ripple'),
      geo: null,
    };
    // Category $ values are static text; the line items count up in frame().
    R.plVals = R.plRows.map((r) => ({
      k: r.dataset.row,
      cells: [...r.children].slice(1),
    }));
    R.colData = (L.compact ? (N.cols.length > 1 ? [N.cols[Math.max(0, N.flagRow)], N.cols[N.cols.length - 1]] : N.cols) : N.cols).slice(0, colsShown);
  }

  function offset(el) {
    let x = 0;
    let y = 0;
    for (let n = el; n && n !== root; n = n.offsetParent) {
      x += n.offsetLeft;
      y += n.offsetTop;
    }
    return { x, y, w: el.offsetWidth, h: el.offsetHeight };
  }

  function measure() {
    const at = (el, fx = 0.5, fy = 0.55) => {
      const o = offset(el);
      return { x: o.x + o.w * fx, y: o.y + o.h * fy };
    };
    const nav = (i) => at(R.nis[i], L.compact ? 0.3 : 0.32);
    return {
      navY: R.nis.map((n) => n.offsetTop),
      navH: R.nis[0].offsetHeight,
      cats: R.cin.offsetHeight,
      home: nav(0),
      bank: nav(4),
      reports: nav(5),
      accept: at(R.btn, 0.45),
      cogs: at(R.cogs, L.compact ? 0.12 : 0.08),
      dex: at(R.dexBtn, 0.42, 0.6),
      menu: R.menu ? at(R.menu, 0.5, 0.5) : null,
      rest: L.rest,
      dexRest: L.dexRest,
    };
  }

  const mix = (a, b, p) => ({ x: lerp(a.x, b.x, p), y: lerp(a.y, b.y, p) });
  const pulse = (t, at) => seg(t, at - 0.06, 0.06) - seg(t, at + 0.04, 0.12);
  const show = (el, v) => {
    el.style.opacity = v;
    el.style.visibility = v <= 0.001 ? 'hidden' : 'visible';
  };

  function frame(t) {
    const dur = L.meta.duration;
    t = ((((t + (L.startAt ?? 0)) % dur) + dur) % dur); // video time → story time
    // Layout is only measurable once the stage is rendered (an embed can start
    // out hidden, e.g. the desktop version on a phone breakpoint).
    const G = R.geo ?? measure();
    if (root.offsetWidth) R.geo = G;
    const C = CUES;

    // ---- Which page: the one whose nav click came last (Home before the first) ----
    const stop = [...STOPS].reverse().find((s) => t >= s[0] + 0.15);
    const page = stop ? stop[2] : 0;
    R.ttl.innerHTML = PAGES[page][0];
    R.crumb.textContent = PAGES[page][1];
    R.tt.style.opacity = Math.min(1, ...STOPS.map((s) => clamp(Math.abs(t - (s[0] + 0.15)) / 0.15)));

    // Pages fade/slide in after their click and out at the next one.
    const pageIn = [C.homeIn, C.goBank + 0.15, C.goReports + 0.15];
    const pageOut = [C.goBank, C.goReports, C.goHome];
    R.views.forEach((v, i) => {
      const pin = ease.outCubic(seg(t, pageIn[i], 0.45));
      const pout = ease.inOutCubic(seg(t, pageOut[i], 0.3));
      show(v, pin * (1 - pout));
      v.style.transform = `translateY(${(lerp(10, 0, pin) - 6 * pout).toFixed(2)}px)`;
    });

    // ---- Nav: the highlight slides to the clicked item ---------------------------
    let ny = G.navY[0];
    let navOn = 0;
    for (const [at, ni] of STOPS) {
      ny = lerp(ny, G.navY[ni], ease.inOutCubic(seg(t, at, 0.3)));
      if (t >= at + 0.1) navOn = ni;
    }
    R.nhl.style.transform = `translateY(${ny.toFixed(2)}px)`;
    R.nhl.style.height = `${G.navH}px`;
    R.nis.forEach((n, i) => n.classList.toggle('on', i === navOn));
    R.dexBtnIn.style.backgroundPosition = `${((t / L.meta.duration) * 200) % 200}% 50%`; // one sweep per loop
    R.dexBtn.style.scale = 1 - pulse(t, C.goDex) * 0.05;

    // Phone: the drawer opens on the menu tap and closes after the item tap.
    const navTaps = [C.goBank, C.goReports, C.goDex, C.goHome];
    if (L.compact) {
      const open = Math.max(...navTaps.map((at) => ease.inOutCubic(seg(t, at - C.menuLead + 0.05, 0.25)) * (1 - ease.inOutCubic(seg(t, at + 0.08, 0.25)))));
      R.side.style.transform = `translateX(${(-104 * (1 - open)).toFixed(2)}%)`;
      R.side.style.visibility = open > 0.001 ? 'visible' : 'hidden';
      show(R.scrim, open);
    }

    // ---- 1. Home: KPIs count up, charts draw ------------------------------------------
    R.kpis.forEach(({ el, kv, rv, d }, i) => {
      const s = C.kpis + i * C.kpiStagger;
      riseIn(el, t, s, { dy: 12, dur: 0.5 });
      const v = countUp(t, s + 0.05, C.countDur, d.value);
      kv.textContent = d.format === 'pct' ? pct(v) : kMoney(v);
      rv.setAttribute('width', (212 * ease.inOutCubic(seg(t, s + 0.2, 1.0))).toFixed(1));
    });
    riseIn(R.salesp, t, C.kpis + 0.25, { dy: 12 });
    R.salesRv.setAttribute('width', (L.sales.W * ease.inOutCubic(seg(t, ...C.chartDraw))).toFixed(1));
    riseIn(R.cost, t, C.kpis + 0.33, { dy: 12 });
    const sweep = ease.outQuart(seg(t, C.kpis + 0.45, 1.1));
    const circ = 2 * Math.PI * L.donut * 0.418;
    let cum = 0;
    R.slices.forEach((s) => {
      const f = Number(s.dataset.f);
      s.setAttribute('stroke-dasharray', `${Math.max(0, f * circ * sweep - 2).toFixed(2)} ${circ.toFixed(2)}`);
      s.setAttribute('stroke-dashoffset', (-cum * circ * sweep).toFixed(2));
      cum += f;
    });
    R.dc.style.opacity = seg(t, C.kpis + 0.7, 0.4);
    R.costItems.forEach((li, i) => riseIn(li, t, C.kpis + 0.6 + i * 0.06, { dy: 4, dur: 0.35 }));

    // ---- 2. Banking: cash counts up, the feed reconciles ---------------------------------
    const b0 = C.goBank + 0.15;
    riseIn(R.cashc, t, b0, { dy: 12 });
    R.big.textContent = cents(countUp(t, b0 + 0.05, 1.0, N.cash), false);
    R.acc.forEach((li, i) => riseIn(li, t, b0 + 0.25 + i * 0.07, { dy: 4, dur: 0.35 }));
    if (R.cashRv) R.cashRv.setAttribute('width', (L.cashChart.W * ease.inOutCubic(seg(t, b0 + 0.3, 0.9))).toFixed(1));
    riseIn(R.txc, t, b0 + 0.08, { dy: 12 });
    R.txRows.forEach((r, i) => riseIn(r, t, b0 + 0.2 + i * 0.04, { dy: 4, dur: 0.3 }));
    let done = 24 - R.txM.length;
    R.txM.forEach((r, i) => {
      const at = C.matched[0] + i * C.matched[1];
      const on = t >= at;
      if (on) done++;
      r.classList.toggle('done', on);
      r.style.setProperty('--hl', on ? 1 - seg(t, at + 0.1, 0.6) : 0);
    });
    R.pn.textContent = done;
    R.bar.style.width = `${((done / 24) * 100).toFixed(1)}%`;
    R.btn.classList.toggle('done', t >= C.matched[0] + R.txM.length * C.matched[1]);
    R.btn.style.scale = 1 - pulse(t, C.accept) * 0.05;

    // ---- 3. Prime Cost P&L: rows count up, COGS opens, the outlier flags ------------------
    const p0 = C.goReports + 0.15;
    R.tiles.forEach((el, i) => riseIn(el, t, p0 + i * 0.06, { dy: 10, dur: 0.45 }));
    riseIn(R.plc, t, p0 + 0.1, { dy: 12 });
    const grow = ease.outExpo(seg(t, p0 + 0.2, 0.9));
    R.plVals.forEach(({ k, cells }, ri) => {
      riseIn(R.plRows[ri], t, p0 + 0.18 + ri * 0.05, { dy: 4, dur: 0.3 });
      if (k === 'pp') return;
      cells.forEach((cell, ci) => {
        cell.textContent = kMoney(R.colData[ci][k] * 100 * grow);
      });
    });
    const open = ease.inOutCubic(seg(t, ...C.cats));
    R.cats.style.height = `${(G.cats * open).toFixed(1)}px`;
    R.tw.style.transform = `rotate(${90 * open}deg)`;
    R.crs.forEach((r, i) => {
      const p = ease.outCubic(seg(t, C.cats[0] + 0.08 + i * 0.05, 0.35));
      r.style.opacity = p;
      r.style.transform = `translateY(${lerp(5, 0, p).toFixed(2)}px)`;
    });
    const fl = ease.outCubic(seg(t, C.flag, 0.35));
    R.fls.forEach((c) => {
      c.style.setProperty('--fl', fl);
      c.classList.toggle('on', fl > 0.5);
    });

    // ---- 4. Dex: question typed and sent, answer streams in ------------------------------
    const dexIn = ease.outCubic(seg(t, ...C.dexIn)) * (1 - ease.inOutCubic(seg(t, C.goHome, 0.35)));
    show(R.dex, dexIn);
    // Desktop: the page makes room for the panel, so the flagged column stays in view.
    if (!L.compact) R.viewsEl.style.right = `${(L.dexRoom * dexIn).toFixed(1)}px`;
    R.dex.style.transform = L.compact ? `translateY(${lerp(60, 0, dexIn).toFixed(2)}px)` : `translateX(${lerp(40, 0, dexIn).toFixed(2)}px)`;
    const ask = D.dex.ask;
    const sent = t >= C.send;
    const nChars = Math.round(ask.length * seg(t, ...C.typeAsk));
    R.typed.textContent = sent ? '' : ask.slice(0, nChars);
    R.ph.style.display = nChars === 0 || sent ? '' : 'none';
    const blinkOn = nChars < ask.length || Math.floor(t * 3) % 2 === 0;
    R.caret.style.opacity = !sent && t >= C.dexIn[0] + 0.25 && blinkOn ? 1 : 0;
    const bub = ease.outCubic(seg(t, C.send, 0.3));
    show(R.bubble, bub);
    R.bubble.style.transform = `translateY(${lerp(10, 0, bub).toFixed(2)}px)`;
    show(R.ans, seg(t, C.thinking[0], 0.15));
    R.dots.style.opacity = t < C.answer[0] ? 1 : 0;
    [...R.dots.children].forEach((d, i) => {
      d.style.transform = `translateY(${(Math.sin(t * 9 - i * 0.9) * -2.5).toFixed(2)}px)`;
    });
    const shown = R.words.length * seg(t, ...C.answer);
    R.words.forEach((w, i) => (w.style.opacity = clamp(shown - i)));

    // ---- Pointer ---------------------------------------------------------------------
    const clicks = [C.goBank, C.accept, C.goReports, C.cogs, C.goDex, C.goHome];
    if (L.touch) {
      // A fingertip lands just before each tap and lifts after; nav taps are
      // preceded by a tap on the menu button.
      const taps = [
        ...navTaps.map((at) => [at - C.menuLead, G.menu]),
        [C.goBank, G.bank],
        [C.accept, G.accept],
        [C.goReports, G.reports],
        [C.cogs, G.cogs],
        [C.goDex, G.dex],
        [C.goHome, G.home],
      ];
      const [at, pos] = taps.reduce((b, x) => (Math.abs(t - x[0]) < Math.abs(t - b[0]) ? x : b));
      const press = pulse(t, at);
      R.cursor.style.opacity = seg(t, at - 0.28, 0.14) * (1 - seg(t, at + 0.12, 0.2));
      R.cursor.style.transform = `translate(${pos.x.toFixed(1)}px, ${pos.y.toFixed(1)}px) scale(${1 - press * 0.18})`;
      const rip = t >= at && t < at + 0.4 ? seg(t, at, 0.4) : 0;
      R.ripple.style.opacity = rip > 0 && rip < 1 ? 1 - rip : 0;
      R.ripple.style.transform = `scale(${lerp(0.5, 1.6, rip)})`;
      return;
    }
    // The pointer rests on Home at the loop point, so t = 12 meets t = 0.
    const path = [
      [C.toRest, G.rest],
      [C.toBank, G.bank],
      [C.toAccept, G.accept],
      [C.toReports, G.reports],
      [C.toCogs, G.cogs],
      [C.toDex, G.dex],
      [C.dexRest, G.dexRest],
      [C.toHome, G.home],
    ];
    const pos = path.reduce((p, [[s, d], to]) => mix(p, to, ease.inOutCubic(seg(t, s, d))), G.home);
    const click = Math.max(...clicks.map((c) => pulse(t, c)));
    R.cursor.style.opacity = 1;
    R.cursor.style.transform = `translate(${(pos.x - 4).toFixed(1)}px, ${(pos.y - 2.5).toFixed(1)}px) scale(${1 - click * 0.12})`;
    const last = [...clicks].reverse().find((c) => t >= c);
    const rip = last != null && t < last + 0.45 ? seg(t, last, 0.45) : 0;
    R.ripple.style.opacity = rip > 0 && rip < 1 ? 1 - rip : 0;
    R.ripple.style.transform = `translate(4px, 2.5px) scale(${lerp(0.3, 1.4, rip)})`;
  }

  return { meta: L.meta, build, frame };
}
