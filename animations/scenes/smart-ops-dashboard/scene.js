// Smart Ops Dashboard — "Every number that matters, the moment you log in."
//
// The DishBooks Home dashboard, rebuilt from the real app's layout and design
// tokens (staging, Oct 2026) and filmed with a virtual camera:
//
//   sign in → wide shot as the dashboard loads → push in along the KPI cards →
//   hover the latest month in Sales Performance → pull back and scroll to
//   Location Performance, one cell flags → click Ask Dex → Dex explains →
//   back to the sign-in card (seamless 10s loop).
//
// The app is laid out at a real browser size (VW × VH) inside `.w`; the camera
// scales and pans that world inside the 880 × 616 stage. All timings live in
// CUES; all copy and numbers come from the scenario JSON.

import { seg, ease, lerp, clamp, riseIn, countUp } from '../../lib/timeline.js';
import { icon } from '../../shared/icons.js';

export const meta = { width: 880, height: 616, duration: 10, fps: 30, posterTime: 9.2 };

const VW = 1440; // virtual browser viewport the app is laid out in
const VH = 1008;
const END_YEAR = 2026; // year of the last month in the scenario

// Seconds. [start, duration] pairs unless noted.
export const CUES = {
  // Sign in
  cursorIn: [0.05, 0.2],
  cursorToSignIn: [0.15, 0.45],
  signInClick: 0.62,
  loginOut: [0.8, 0.3],
  // Dashboard loads (wide shot)
  appIn: [0.85, 0.35],
  nav: 0.9,
  header: 1.0,
  kpis: 1.1,
  kpiStagger: 0.07,
  countDur: 1.3,
  row2: 1.35,
  pnlStagger: 0.05,
  chartDraw: [1.65, 1.1],
  row3: 1.6,
  table: 1.8,
  // Camera moves (see the keyframes in measure() for where each one goes)
  pushKpi: [2.3, 0.65],
  panKpi: [2.95, 0.8],
  toSales: [3.75, 0.6],
  cursorBack: [4.0, 0.2],
  hover: [4.2, 0.5], // cursor travels to the latest month
  tooltip: 4.6,
  pullBack: [5.2, 0.8], // also scrolls down to Location Performance
  flag: 5.85,
  cursorToDex: [5.95, 0.5],
  dexClick: 6.5,
  cursorOut: [6.75, 0.3],
  dexIn: [6.55, 0.35],
  toDex: [6.55, 0.7],
  typeAsk: [6.95, 0.45],
  send: 7.45,
  thinking: [7.5, 0.3],
  answer: [7.8, 1.2],
  outro: [9.45, 0.3], // dashboard fades to the sign-in background
  outroCard: [9.65, 0.35], // then the sign-in card returns
};

const MARK = `<svg class="mark" viewBox="0 0 68 48" aria-hidden="true"><defs><linearGradient id="__ID__m" x1="0" y1="24" x2="85" y2="24" gradientUnits="userSpaceOnUse"><stop offset=".1" stop-color="#2EB2FF"/><stop offset="1" stop-color="#326CFF"/></linearGradient></defs><path d="M46.19 24C46.19 10.97 34.49.33 19.96 0H2.01C.9 0 0 .88 0 1.97v44.07C0 47.12.9 48 2.01 48h17.95C34.49 47.67 46.19 37.03 46.19 24Z" fill="url(#__ID__m)"/><path d="M57.11 24c0-11.23-8.69-20.69-20.39-23.29-.83-.19-1.3.9-.59 1.34 7.76 4.81 12.85 12.86 12.85 21.95s-5.09 17.14-12.85 21.95c-.71.44-.24 1.52.59 1.34C48.41 44.69 57.11 35.23 57.11 24Z" fill="#326CFF"/><path d="M47.5.63c-.82-.19-1.3.9-.58 1.34C54.74 6.78 59.89 14.86 59.89 24c0 9.15-5.15 17.23-12.98 22.04-.72.44-.24 1.53.6 1.34 4.62-1.04 8.75-3.3 12-6.4 4.54-4.35 7.35-10.35 7.35-16.97C66.85 12.63 58.59 3.1 47.5.63Z" fill="#5542FF"/></svg>`;
const CURSOR = `<svg viewBox="0 0 22 22"><path d="M4 2.5v15.2l4.1-3.9 2.7 6.1 2.6-1.1-2.7-6h5.7L4 2.5Z" fill="#0b0c0d" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/></svg>`;

const NAV = [
  ['house-simple', 'Home', false],
  ['cash-register', 'Sales', true],
  ['invoice', 'Expenses', true],
  ['money', 'Transactions', false],
  ['bank', 'Banking', false],
  ['building-office', 'Reports', true],
  ['chart-line-up', 'Budgeting & Forecasting', true],
  ['gear', 'Settings', false],
];

// Chart colours, from the app's Chart.js config.
const COL = {
  indigo: '#4f39f6',
  indigo300: '#a3b3ff',
  purple: '#9810fa',
  teal: '#00bba7',
  green: '#00a63e',
  red: '#e7000b',
  pink: '#f6339a',
  amber: '#fe9a00',
  muted: 'rgba(11,12,13,.6)',
};
const DOUGHNUT = [COL.indigo, COL.pink, COL.amber, COL.muted];

let D; // scenario data
let R; // element refs + geometry
let root;

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const n1 = (v) => v.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
/** The app's money format: thousands with one decimal, e.g. $2,862.4k. */
const money = (v) => `${v < 0 ? '-' : ''}$${n1(Math.abs(v) / 1000)}k`;
const signedMoney = (v) => `${v >= 0 ? '+' : '-'}$${n1(Math.abs(v) / 1000)}k`;
const pct = (v) => `${v.toFixed(1)}%`;
const usd = (v) => `$${Math.round(v).toLocaleString('en-US')}`;
const f1 = (v) => v.toFixed(1);
const axisMoney = (v) => (v >= 1e6 ? `$${+(v / 1e6).toFixed(2)}M` : `$${Math.round(v / 1e3)}K`);
const kpiText = (k, v) => (k.format === 'pct' ? pct(v) : money(v));

// ---- Chart geometry (mirrors Chart.js curve modes) ---------------------------

/** Chart.js `tension` spline through points. */
function splinePath(pts, tension) {
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

/** Chart.js `cubicInterpolationMode: 'monotone'` (Fritsch–Carlson). */
function monotonePath(pts) {
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

/** Ellipsise a 12px label to roughly `px` wide (SVG text can't do it in CSS). */
function fitLabel(text, px) {
  const max = Math.floor(px / 6.4);
  return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`;
}

function niceTicks(lo, hi, count = 4) {
  const raw = (hi - lo) / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((k) => k * mag).find((s) => s >= raw);
  const min = Math.floor(lo / step) * step;
  const max = Math.ceil(hi / step) * step;
  const ticks = [];
  for (let v = min; v <= max + step / 2; v += step) ticks.push(v);
  return { min, max, ticks };
}

// ---- Markup -------------------------------------------------------------------

function sparkline(k, id) {
  const W = 212;
  const H = 64;
  // Pad the range so small month-to-month moves don't read as wild swings.
  const pad = (Math.max(...k.spark) - Math.min(...k.spark)) * 0.3;
  const lo = Math.min(...k.spark) - pad;
  const hi = Math.max(...k.spark) + pad;
  const pts = k.spark.map((v, i) => [(i / (k.spark.length - 1)) * W, H - 6 - ((v - lo) / (hi - lo || 1)) * (H - 18)]);
  const line = splinePath(pts, 0.3);
  const c = k.trend === 'declining' ? COL.red : COL.green;
  return `<svg class="spark" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
    <clipPath id="${id}"><rect class="reveal" width="0" height="${H}"/></clipPath>
    <g clip-path="url(#${id})">
      <path d="${line}L${W} ${H}L0 ${H}Z" fill="color-mix(in srgb, ${c} 12%, transparent)"/>
      <path d="${line}" fill="none" stroke="${c}" stroke-width="2" vector-effect="non-scaling-stroke"/>
    </g></svg>`;
}

function salesChart(s, id) {
  const W = 526;
  const H = 192;
  const P = { x0: 52, x1: W - 8, y0: 32, y1: H - 24 };
  const all = [...s.thisPeriod, ...s.lastYear];
  const { min, max, ticks } = niceTicks(Math.min(...all), Math.max(...all));
  const x = (i) => P.x0 + (i / (s.thisPeriod.length - 1)) * (P.x1 - P.x0);
  const y = (v) => P.y1 - ((v - min) / (max - min)) * (P.y1 - P.y0);
  const now = s.thisPeriod.map((v, i) => [x(i), y(v)]);
  const ly = s.lastYear.map((v, i) => [x(i), y(v)]);
  const nowD = monotonePath(now);
  const last = now[now.length - 1];
  return {
    hover: { x: last[0], y: last[1] },
    svg: `<svg class="sales-svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
      <defs>
        <pattern id="${id}p" width="6" height="2" patternUnits="userSpaceOnUse"><rect width="2" height="2" fill="${COL.indigo300}"/></pattern>
        <clipPath id="${id}c"><rect class="reveal" x="0" y="0" width="0" height="${H}"/></clipPath>
      </defs>
      <g class="grid">${ticks
        .map((v) => `<line x1="${P.x0}" x2="${P.x1}" y1="${f1(y(v))}" y2="${f1(y(v))}"/><text x="${P.x0 - 8}" y="${f1(y(v) + 4)}" text-anchor="end">${axisMoney(v)}</text>`)
        .join('')}</g>
      <g class="xl">${D.months.map((m, i) => (i % 2 ? '' : `<text x="${f1(x(i))}" y="${H - 4}" text-anchor="middle">${m}</text>`)).join('')}</g>
      <g clip-path="url(#${id}c)">
        <path d="${nowD}L${P.x1} ${P.y1}L${P.x0} ${P.y1}Z" fill="url(#${id}p)"/>
        <path d="${monotonePath(ly)}" fill="none" stroke="${COL.indigo}" stroke-width="2" stroke-dasharray="5 5"/>
        <path d="${nowD}" fill="none" stroke="${COL.indigo}" stroke-width="3" stroke-linejoin="round"/>
      </g>
      <g class="hover-pt">
        <line x1="${f1(last[0])}" x2="${f1(last[0])}" y1="${f1(last[1])}" y2="${P.y1}" stroke="${COL.indigo}" stroke-width="1"/>
        <circle cx="${f1(last[0])}" cy="${f1(last[1])}" r="6" fill="#f2f4f7" stroke="${COL.indigo}" stroke-width="3"/>
      </g>
    </svg>`,
  };
}

function doughnut(items) {
  const S = 208;
  const r = 87; // outer 104, cutout 70% → ring 31px
  const total = items.reduce((a, b) => a + b.pct, 0);
  return `<svg class="donut" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">
    <g transform="rotate(-90 ${S / 2} ${S / 2})">${items
      .map((it, i) => `<circle class="slice" cx="${S / 2}" cy="${S / 2}" r="${r}" fill="none" stroke="${DOUGHNUT[i % 4]}" stroke-width="31" data-f="${it.pct / total}"/>`)
      .join('')}</g></svg>`;
}

function primeBars(locs) {
  const W = 526;
  const H = 250;
  const P = { x0: 40, x1: W - 8, y0: 20, y1: H - 26 };
  const top = Math.max(80, Math.ceil((Math.max(...locs.map((l) => l.prime)) + 6) / 20) * 20); // headroom for the total labels
  const y = (v) => P.y1 - (v / top) * (P.y1 - P.y0);
  const slot = (P.x1 - P.x0) / locs.length;
  const bw = Math.min(64, slot * 0.5);
  const ticks = [];
  for (let v = 0; v <= top; v += 20) ticks.push(v);
  return {
    unit: (P.y1 - P.y0) / top,
    y1: P.y1,
    svg: `<svg class="prime-svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
      <g class="grid">${ticks.map((v) => `<line x1="${P.x0}" x2="${P.x1}" y1="${f1(y(v))}" y2="${f1(y(v))}"/><text x="${P.x0 - 8}" y="${f1(y(v) + 4)}" text-anchor="end">${v}%</text>`).join('')}</g>
      ${locs
        .map((l, i) => {
          const cx = P.x0 + slot * (i + 0.5);
          return `<g class="pbar">
            ${[l.food, l.bev, l.labor].map((v, j) => `<rect x="${f1(cx - bw / 2)}" width="${f1(bw)}" y="${P.y1}" height="0" fill="${[COL.indigo, COL.purple, COL.teal][j]}" data-v="${v}"/>`).join('')}
            <text class="ptotal" x="${f1(cx)}" y="${f1(y(l.prime) - 8)}" text-anchor="middle">${pct(l.prime)}</text>
            <text class="pname" x="${f1(cx)}" y="${H - 6}" text-anchor="middle">${esc(fitLabel(l.name, slot - 10))}</text>
          </g>`;
        })
        .join('')}
    </svg>`,
  };
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

export function build(el, data) {
  root = el;
  D = data;
  el.classList.add('db-anim', 'sod');
  window.__sodN = (window.__sodN ?? 0) + 1;
  const id = `sod${window.__sodN}`;
  const u = data.user;
  const L = data.locations;
  const flagRow = data.flag ? data.flag.row : -1;
  const flagCol = data.flag?.col;
  const sales = salesChart(data.sales, id);
  const bars = primeBars(L);
  const totalCost = data.costBreakdown.reduce((a, b) => a + b.pct, 0);
  const monthIdx = data.months.length - 1;
  const tableCols = [
    ['sales', (l) => money(l.sales)],
    ['food', (l) => pct(l.food)],
    ['bev', (l) => pct(l.bev)],
    ['labor', (l) => pct(l.labor)],
    ['prime', (l) => pct(l.prime)],
    ['ebitda', (l) => money(l.ebitda)],
    ['netProfit', (l) => money(l.netProfit)],
    ['netPct', (l) => pct(l.netPct)],
  ];
  const isFlag = (i, k) => i === flagRow && k === flagCol;

  el.innerHTML = `
  <div class="cam"><div class="w">
    <nav class="side">
      <div class="logo">${MARK.replaceAll('__ID__', id)}<span>DishBooks</span></div>
      <div class="org">
        <div class="org-row"><span class="ib">${icon('buildings')}</span><span class="org-name">${esc(data.company.name)}</span>${icon('caret-down', 'car')}</div>
        <div class="org-row"><span class="ib">${icon('map-pin')}</span><span class="org-name">${esc(data.company.scopeLabel)}</span>${icon('caret-down', 'car')}</div>
      </div>
      <div class="items">${NAV.map(([ic, label, more], i) => `<div class="ni${i === 0 ? ' on' : ''}"><span class="ib">${icon(ic)}</span><span class="nl">${esc(label)}</span>${more ? icon('caret-down', 'car') : ''}</div>`).join('')}</div>
      <div class="grow"></div>
      <div class="setup"><div><b>Setup</b><span>3/4</span></div><i><i></i></i></div>
      <div class="dex-btn"><div class="dex-btn-in"><span>Ask Dex</span><span class="ai">AI</span></div></div>
      <div class="me"><span class="av">${esc(u.initials)}</span><span class="me-name">${esc(u.firstName)} ${esc(u.lastName)}</span><span class="mode">${icon('sun')}</span></div>
    </nav>
    <div class="main"><div class="scroll">
      <h5 class="title">Home</h5>
      <div class="filters">
        <span class="pill">${icon('calendar')}${esc(data.period)}${icon('caret-down', 'car')}</span>
        <span class="chip">${esc(data.company.scopeLabel)}${icon('x')}</span>
        <span class="pill">${icon('funnel')}Filter (2)${icon('caret-down', 'car')}</span>
      </div>
      <section class="kpis">${data.kpis
        .map((k, i) => `<div class="card kpi"><div class="lbl">${esc(k.label)}</div><div class="kv">${kpiText(k, k.value)}</div>${sparkline(k, `${id}s${i}`)}</div>`)
        .join('')}</section>
      <section class="row2">
        <div class="card pnl">
          <div class="ct">P&amp;L Summary</div>
          <div class="tbl">
            <div class="tr th"><span>Metric</span><span>Actual</span><span>Last Year</span><span>Variance ($)</span><span>Variance (%)</span></div>
            ${data.pnl
              .map((r) => {
                const dv = r.actual - r.lastYear;
                const cls = dv === 0 ? '' : dv > 0 === r.goodWhenUp ? 'up' : 'down';
                return `<div class="tr"><span class="m">${esc(r.metric)}</span><span>${money(r.actual)}</span><span class="ly">${money(r.lastYear)}</span><span class="${cls}">${signedMoney(dv)}</span><span class="${cls}">${dv >= 0 ? '+' : '-'}${pct(Math.abs((dv / r.lastYear) * 100))}</span></div>`;
              })
              .join('')}
          </div>
          <div class="link">View full Profit &amp; Loss report ${icon('arrow-right')}</div>
        </div>
        <div class="card salesp">
          <div class="ch"><div class="ct">Sales Performance</div><span class="sel">Monthly${icon('caret-down', 'car')}</span></div>
          <div class="stats">
            <div><span>Guests</span><b>${data.sales.guests.toLocaleString('en-US')}</b></div>
            <div><span>Average Check</span><b>$${data.sales.avgCheck.toFixed(2)}</b></div>
          </div>
          <div class="legend"><span><i class="solid"></i>This Period</span><span><i class="dash"></i>Last Year</span></div>
          <div class="chart">${sales.svg}
            <div class="tip" style="left:${f1(sales.hover.x)}px;top:${f1(sales.hover.y)}px"><span>${data.months[monthIdx]} ${END_YEAR}</span><b>${usd(data.sales.thisPeriod[monthIdx])}</b><span>Previous: ${usd(data.sales.lastYear[monthIdx])}</span></div>
          </div>
          <div class="link">View full sales report ${icon('arrow-right')}</div>
        </div>
      </section>
      <section class="row3">
        <div class="card cost">
          <div class="ct">Cost Breakdown <span class="sub">(as % of Sales)</span></div>
          <div class="cost-body">
            <div class="donut-wrap">${doughnut(data.costBreakdown)}<div class="donut-c"><span>Total Cost<br>(as % of Sales)</span><b>${pct(totalCost)}</b></div></div>
            <ul class="cl">${data.costBreakdown.map((c, i) => `<li><i style="background:${DOUGHNUT[i % 4]}"></i><span>${esc(c.label)}</span><b>${pct(c.pct)}</b></li>`).join('')}</ul>
          </div>
        </div>
        <div class="card prime">
          <div class="ct">Prime Cost Breakdown <span class="sub">(as % of Sales)</span></div>
          <div class="legend caps"><span><i class="sq" style="background:${COL.indigo}"></i>Food</span><span><i class="sq" style="background:${COL.purple}"></i>Beverage</span><span><i class="sq" style="background:${COL.teal}"></i>Labor</span></div>
          ${bars.svg}
        </div>
      </section>
      <section class="card locs">
        <div class="ct">${esc(data.rowLabel)} Performance</div>
        <div class="tbl">
          <div class="tr th"><span>${esc(data.rowLabel)}</span><span>Sales</span><span>Food</span><span>Beverage</span><span>Labor</span><span>Prime Cost</span><span>EBITDA</span><span>Net Profit ($)</span><span>Net Profit (%)</span></div>
          ${L.map(
            (l, i) =>
              `<div class="tr${i === flagRow ? ' flagged' : ''}"><span class="m">${esc(l.name)}</span>${tableCols
                .map(([k, f]) => (isFlag(i, k) ? `<span class="flag"><i class="hl"></i><em>${f(l)}</em></span>` : `<span>${f(l)}</span>`))
                .join('')}</div>`,
          ).join('')}
        </div>
        <div class="link">View all ${esc(data.rowLabel.toLowerCase())}s ${icon('arrow-right')}</div>
      </section>
    </div></div>
    <aside class="dex">
      <header><span class="orb"></span><b>Dex</b><span class="ai">AI</span><span class="grow"></span>${icon('x')}</header>
      <div class="dex-body">
        <div class="msg"><span class="orb sm"></span><div class="dex-message"><p>Hi ${esc(u.firstName)}, ask me anything about your numbers.</p></div></div>
        <div class="bubble">${esc(data.dex.ask)}</div>
        <div class="msg ans"><span class="orb sm"></span><div class="dex-message">${answerHtml(data.dex.answer)}<div class="dots"><i></i><i></i><i></i></div></div></div>
      </div>
      <footer><div class="input"><span class="typed"></span><span class="caret"></span><span class="ph">Ask Dex about your numbers…</span><span class="send">${icon('paper-plane-right')}</span></div></footer>
    </aside>
  </div></div>
  <div class="login">
    <div class="login-card">
      <div class="logo">${MARK.replaceAll('__ID__', `${id}l`)}<span>DishBooks</span></div>
      <h5>Welcome back</h5>
      <p>Sign in to continue to your dashboard.</p>
      <div class="account"><span class="av">${esc(u.initials)}</span><div><b>${esc(u.firstName)} ${esc(u.lastName)}</b><span>${esc(u.role)} · ${esc(data.company.name)}</span></div></div>
      <div class="pw"><span>Password</span><div>${'•'.repeat(12)}</div></div>
      <div class="btn-primary"><span class="spinner"></span><span class="btn-label">Sign in</span></div>
    </div>
  </div>
  <div class="cursor"><div class="ripple"></div>${CURSOR}</div>`;

  const q = (s) => el.querySelector(s);
  const qa = (s) => [...el.querySelectorAll(s)];
  R = {
    cam: q('.cam'),
    world: q('.w'),
    scroll: q('.scroll'),
    navItems: qa('.side > *'),
    dexBtnIn: q('.dex-btn-in'),
    dexBtn: q('.dex-btn'),
    title: q('.title'),
    filters: q('.filters'),
    kpiRow: q('.kpis'),
    kpis: qa('.kpi'),
    kv: qa('.kv'),
    sparkReveal: qa('.spark .reveal'),
    pnl: q('.pnl'),
    pnlRows: qa('.pnl .tr'),
    salesp: q('.salesp'),
    salesSvg: q('.sales-svg'),
    salesReveal: q('.sales-svg .reveal'),
    hoverPt: q('.hover-pt'),
    hoverGeo: sales.hover,
    tip: q('.tip'),
    cost: q('.cost'),
    slices: qa('.slice'),
    circ: 2 * Math.PI * 87,
    donutC: q('.donut-c'),
    costItems: qa('.cl li'),
    prime: q('.prime'),
    pbars: qa('.pbar').map((g) => ({ rects: [...g.querySelectorAll('rect')], total: g.querySelector('.ptotal') })),
    barUnit: bars.unit,
    barY1: bars.y1,
    locs: q('.locs'),
    locRows: qa('.locs .tr'),
    flag: q('.flag'),
    flagHl: q('.flag .hl'),
    flagged: q('.tr.flagged'),
    dex: q('.dex'),
    bubble: q('.bubble'),
    ans: q('.msg.ans'),
    dots: q('.dots'),
    words: qa('.ans .wd'),
    typed: q('.typed'),
    caret: q('.caret'),
    ph: q('.ph'),
    login: q('.login'),
    card: q('.login-card'),
    btn: q('.btn-primary'),
    spinner: q('.spinner'),
    btnLabel: q('.btn-label'),
    cursor: q('.cursor'),
    ripple: q('.ripple'),
    geo: null,
  };
}

// Layout offsets (unaffected by transforms) relative to an ancestor.
function offset(el, stop) {
  let x = 0;
  let y = 0;
  for (let n = el; n && n !== stop; n = n.offsetParent) {
    x += n.offsetLeft;
    y += n.offsetTop;
  }
  return { x, y, w: el.offsetWidth, h: el.offsetHeight };
}

function measure() {
  const w = R.world;
  const kpis = offset(R.kpiRow, w);
  const salesCard = offset(R.salesp, w);
  const svg = offset(R.salesSvg.parentElement, w); // SVG has no offsets; it sits at 0,0 in .chart
  const locs = offset(R.locs, w);
  const ask = offset(R.dexBtn, w);
  const btn = offset(R.btn, root);
  const content = R.scroll.offsetHeight;

  // Scroll so Location Performance sits in the lower half of the viewport.
  const scrollTo = clamp(locs.y - 540, 0, Math.max(0, content - VH));

  // Camera keyframes: [time, scale, centre x, centre y] in viewport px.
  // Centres are clamped to the viewport edges, so 0 / VW / VH mean "hug that edge".
  const half = meta.width / 2;
  const wide = [meta.width / VW, VW / 2, VH / 2];
  const zk = 1.25;
  const kpiY = kpis.y + kpis.h / 2 - 10;
  const kpiL = [zk, kpis.x + half / zk - 12, kpiY];
  const kpiR = [zk, kpis.x + kpis.w - half / zk + 12, kpiY];
  const salesK = [1.15, salesCard.x + salesCard.w / 2, salesCard.y + salesCard.h / 2];
  const table = [0.75, 0, VH];
  const dex = [1.04, VW, VH];
  const C = CUES;
  const end = ([a, d]) => a + d;
  const cam = [
    [0, ...wide],
    [C.pushKpi[0], ...wide],
    [end(C.pushKpi), ...kpiL],
    [end(C.panKpi), ...kpiR],
    [end(C.toSales), ...salesK],
    [C.pullBack[0], ...salesK],
    [end(C.pullBack), ...table],
    [C.toDex[0], ...table],
    [end(C.toDex), ...dex],
    [meta.duration, ...dex],
  ];

  return {
    cam,
    scrollTo,
    start: { x: 640, y: 520 },
    signIn: { x: btn.x + btn.w * 0.62, y: btn.y + btn.h * 0.55 },
    // Viewport (world) coordinates from here on.
    salesEntry: { x: salesCard.x + salesCard.w * 0.45, y: salesCard.y + salesCard.h * 0.62 },
    hover: { x: svg.x + R.hoverGeo.x + 1, y: svg.y + R.hoverGeo.y + 2 },
    ask: { x: ask.x + ask.w * 0.42, y: ask.y + ask.h * 0.6 },
  };
}

/** Camera pose at t: eased moves between keyframes, kept inside the viewport. */
function camera(t, keys) {
  let i = keys.findIndex((k) => k[0] > t);
  if (i < 0) i = keys.length - 1;
  const a = keys[Math.max(0, i - 1)];
  const b = keys[i];
  const p = ease.inOutCubic(b[0] > a[0] ? clamp((t - a[0]) / (b[0] - a[0])) : 1);
  const s = Math.exp(lerp(Math.log(a[1]), Math.log(b[1]), p));
  const fit = (v, s0, half, size) => {
    const h = half / s0;
    return clamp(v, Math.min(h, size / 2), Math.max(size - h, size / 2));
  };
  // Clamp each end before blending, so edge-hugging keys don't lurch.
  const cx = lerp(fit(a[2], a[1], meta.width / 2, VW), fit(b[2], b[1], meta.width / 2, VW), p);
  const cy = lerp(fit(a[3], a[1], meta.height / 2, VH), fit(b[3], b[1], meta.height / 2, VH), p);
  const x = fit(cx, s, meta.width / 2, VW);
  const y = fit(cy, s, meta.height / 2, VH);
  return { s, x: meta.width / 2 - x * s, y: meta.height / 2 - y * s };
}

const mix = (a, b, p) => ({ x: lerp(a.x, b.x, p), y: lerp(a.y, b.y, p) });
const pulse = (t, at) => seg(t, at - 0.06, 0.06) - seg(t, at + 0.04, 0.12);
const show = (el, v) => {
  el.style.opacity = v;
  el.style.visibility = v <= 0.001 ? 'hidden' : 'visible';
};

export function frame(t) {
  // Layout is only measurable once the stage is rendered (an embed can start
  // out hidden, e.g. in an inactive Webflow tab).
  const G = R.geo ?? measure();
  if (root.offsetWidth) R.geo = G;
  const C = CUES;
  const outro = ease.inOutCubic(seg(t, ...C.outro));
  const outroCard = ease.outCubic(seg(t, ...C.outroCard));

  // ---- Sign in → app, and back again in the outro so the loop is seamless ----
  const out = ease.inOutCubic(seg(t, ...C.loginOut));
  const bgShow = t < C.outro[0] ? 1 - ease.inOutCubic(seg(t, C.loginOut[0] + 0.1, 0.35)) : outro;
  show(R.login, clamp(bgShow));
  R.card.style.opacity = t < C.outro[0] ? 1 - out : outroCard;
  R.card.style.transform = t < C.outro[0] ? `scale(${lerp(1, 1.04, out)})` : `translateY(${lerp(10, 0, outroCard)}px) scale(${lerp(0.97, 1, outroCard)})`;
  R.btn.style.transform = `scale(${1 - pulse(t, C.signInClick) * 0.035})`;
  const loading = t >= C.signInClick + 0.05 && t < C.outro[0];
  R.spinner.style.display = loading ? 'block' : 'none';
  R.spinner.style.transform = `rotate(${t * 720}deg)`;
  R.btnLabel.textContent = loading ? 'Signing in…' : 'Sign in';

  // ---- Camera + scroll --------------------------------------------------------
  const cam = camera(t, G.cam);
  show(R.cam, ease.outCubic(seg(t, ...C.appIn)) * (1 - outro));
  R.world.style.transform = `translate(${cam.x.toFixed(2)}px, ${cam.y.toFixed(2)}px) scale(${cam.s.toFixed(4)})`;
  const scrollY = G.scrollTo * ease.inOutCubic(seg(t, ...C.pullBack));
  R.scroll.style.transform = `translateY(${(-scrollY).toFixed(2)}px)`;

  // ---- Dashboard loads --------------------------------------------------------
  R.navItems.forEach((el, i) => riseIn(el, t, C.nav + i * 0.03, { dy: 6, dur: 0.45 }));
  // The Ask Dex button's gradient drifts, like the app's animated canvas.
  R.dexBtnIn.style.backgroundPosition = `${(t * 20) % 200}% 50%`;
  R.dexBtn.style.scale = 1 - pulse(t, C.dexClick) * 0.05;
  riseIn(R.title, t, C.header, { dy: 6 });
  riseIn(R.filters, t, C.header + 0.08, { dy: 6 });

  D.kpis.forEach((k, i) => {
    const s = C.kpis + i * C.kpiStagger;
    riseIn(R.kpis[i], t, s, { dy: 14, dur: 0.5 });
    R.kv[i].textContent = kpiText(k, countUp(t, s + 0.05, C.countDur, k.value));
    R.sparkReveal[i].setAttribute('width', (212 * ease.inOutCubic(seg(t, s + 0.2, 1.0))).toFixed(1));
  });

  riseIn(R.pnl, t, C.row2, { dy: 14 });
  R.pnlRows.forEach((r, i) => riseIn(r, t, C.row2 + 0.1 + i * C.pnlStagger, { dy: 4, dur: 0.35 }));
  riseIn(R.salesp, t, C.row2 + 0.08, { dy: 14 });
  R.salesReveal.setAttribute('width', (526 * ease.inOutCubic(seg(t, ...C.chartDraw))).toFixed(1));

  riseIn(R.cost, t, C.row3, { dy: 14 });
  const sweep = ease.outQuart(seg(t, C.row3 + 0.15, 1.1));
  let cum = 0;
  R.slices.forEach((el) => {
    const f = Number(el.dataset.f);
    el.setAttribute('stroke-dasharray', `${Math.max(0, f * R.circ * sweep - 2).toFixed(2)} ${R.circ.toFixed(2)}`);
    el.setAttribute('stroke-dashoffset', (-cum * R.circ * sweep).toFixed(2));
    cum += f;
  });
  R.donutC.style.opacity = seg(t, C.row3 + 0.4, 0.4);
  R.costItems.forEach((li, i) => riseIn(li, t, C.row3 + 0.3 + i * 0.06, { dy: 4, dur: 0.35 }));
  riseIn(R.prime, t, C.row3 + 0.08, { dy: 14 });
  R.pbars.forEach((b, i) => {
    const p = ease.outQuart(seg(t, C.row3 + 0.25 + i * 0.08, 0.8));
    let y = R.barY1;
    b.rects.forEach((r) => {
      const h = Number(r.dataset.v) * R.barUnit * p;
      y -= h;
      r.setAttribute('y', y.toFixed(2));
      r.setAttribute('height', Math.max(0, h - 1).toFixed(2)); // 1px gap, like the app's bar borders
    });
    b.total.style.opacity = seg(t, C.row3 + 0.8 + i * 0.08, 0.3);
  });

  riseIn(R.locs, t, C.table, { dy: 14 });
  R.locRows.forEach((r, i) => riseIn(r, t, C.table + 0.1 + i * 0.06, { dy: 4, dur: 0.35 }));

  // ---- Sales hover ------------------------------------------------------------
  const tip = ease.outCubic(seg(t, C.tooltip, 0.2)) * (1 - seg(t, C.pullBack[0], 0.15));
  show(R.tip, tip);
  R.tip.style.transform = `translate(-100%, -50%) translateX(${lerp(-6, -16, tip).toFixed(2)}px)`;
  R.hoverPt.style.opacity = tip;

  // ---- Flag + Dex -------------------------------------------------------------
  if (R.flag) {
    const fl = ease.outCubic(seg(t, C.flag, 0.35));
    R.flagHl.style.opacity = fl;
    R.flagHl.style.transform = `scale(${lerp(1.3, 1, fl)})`;
    R.flag.classList.toggle('on', fl > 0.5);
    R.flagged.style.setProperty('--row', fl);
  }

  const dex = ease.outCubic(seg(t, ...C.dexIn));
  show(R.dex, dex);
  R.dex.style.transform = `translateX(${lerp(40, 0, dex).toFixed(2)}px)`;
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

  // ---- Cursor -----------------------------------------------------------------
  // Sign-in beats use stage coordinates; later beats use viewport coordinates
  // mapped through the camera.
  let pos;
  let vis;
  if (t < C.cursorBack[0]) {
    pos = mix(G.start, G.signIn, ease.inOutCubic(seg(t, ...C.cursorToSignIn)));
    vis = seg(t, ...C.cursorIn) * (1 - seg(t, C.loginOut[0], 0.25));
  } else {
    let v = mix(G.salesEntry, G.hover, ease.inOutCubic(seg(t, ...C.hover)));
    v = mix(v, G.ask, ease.inOutCubic(seg(t, ...C.cursorToDex)));
    pos = { x: cam.x + v.x * cam.s, y: cam.y + v.y * cam.s };
    vis = seg(t, ...C.cursorBack) * (1 - seg(t, ...C.cursorOut));
  }
  R.cursor.style.opacity = vis;
  const click = Math.max(pulse(t, C.signInClick), pulse(t, C.dexClick));
  R.cursor.style.transform = `translate(${(pos.x - 4).toFixed(1)}px, ${(pos.y - 2.5).toFixed(1)}px) scale(${1 - click * 0.12})`;
  const ripAt = t < C.cursorBack[0] ? C.signInClick : C.dexClick;
  const rip = t >= ripAt && t < ripAt + 0.45 ? seg(t, ripAt, 0.45) : 0;
  R.ripple.style.opacity = rip > 0 && rip < 1 ? 1 - rip : 0;
  R.ripple.style.transform = `translate(4px, 2.5px) scale(${lerp(0.3, 1.4, rip)})`;
}
