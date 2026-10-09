// Generates the scenario JSON files from a handful of operating assumptions
// per audience. Every company, location and person here is fictional.
//
//   npm run anim:data                 # rewrite all scenarios
//   npm run anim:data -- qsr home     # just these
//
// The scenes only read the JSON, so you can hand-edit a scenario file for a
// one-off tweak. Re-running this script overwrites hand edits — for changes you
// want to keep, edit PROFILES below.
//
// The data mirrors the DishBooks Home dashboard ("Last 12 months" view):
// KPI cards, P&L summary vs. last year, monthly sales vs. last year, cost
// breakdown, prime cost by location, and the location performance table.
//
// Benchmarks the numbers are tuned to (US, % of sales):
//   food 24–32 · beverage 2–9 (bars: pour cost ~20) · labor 25–38
//   prime cost 55–65 (bars ~45–50, fine dining / hotel F&B to ~68)
//   operating expenses 20–30 · EBITDA 8–16 · net profit 4–12

import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

const MONTHS = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];

// Relative monthly sales, Oct → Sep.
const SEASON = {
  casual: [1.0, 0.97, 1.08, 0.86, 0.88, 0.99, 1.0, 1.05, 1.06, 1.08, 1.05, 0.98],
  qsr: [1.0, 0.98, 1.02, 0.93, 0.92, 0.99, 1.0, 1.04, 1.05, 1.06, 1.04, 0.99],
  fine: [1.02, 1.04, 1.22, 0.82, 0.92, 0.95, 0.97, 1.03, 1.0, 0.96, 0.94, 1.03],
  coffee: [1.02, 1.0, 1.04, 0.98, 0.97, 1.0, 1.0, 0.99, 0.95, 0.93, 0.94, 1.03],
  pizza: [1.02, 1.04, 1.06, 1.01, 1.05, 0.98, 0.96, 0.97, 0.95, 0.96, 0.97, 1.0],
  bar: [0.98, 0.96, 1.18, 0.84, 0.86, 1.02, 0.98, 1.04, 1.07, 1.1, 1.06, 0.96],
  hotel: [1.03, 0.95, 1.02, 0.84, 0.88, 0.98, 1.02, 1.07, 1.1, 1.12, 1.08, 1.02],
};

// One profile per scenario.
//   locations: [name, annual sales, food %, beverage %, labor %, opex %]
//   flag: the cell the story calls out — { row, col: 'food'|'bev'|'labor'|'prime' }
//   growth: sales vs. last year · ly: last year's ratio offsets (pts)
//   dex.answer: paragraphs; **bold** is supported
const PROFILES = {
  home: {
    audience: 'Homepage — multi-unit casual dining',
    company: 'Fernhollow Hospitality',
    user: ['Maya', 'Ortiz', 'Owner'],
    season: 'casual',
    growth: 0.064,
    avgCheck: 38.6,
    cashWeeks: 2.3,
    ly: { food: 0.9, bev: 0.1, labor: -0.2, opex: 0.6 },
    locations: [
      ['Downtown', 3_480_000, 24.1, 6.6, 28.9, 26.4],
      ['Northgate', 2_960_000, 23.6, 6.2, 29.1, 27.2],
      ['Eastside', 2_310_000, 24.8, 5.9, 33.4, 27.9],
      ['Riverside', 2_050_000, 24.4, 6.1, 29.6, 28.1],
    ],
    flag: { row: 2, col: 'labor' },
    dex: {
      ask: 'Why is Eastside’s prime cost so high?',
      answer: [
        'Labor is the driver. Eastside ran **33.4% labor** vs. about 29% at your other locations — roughly **$100k** over the last 12 months.',
        'Most of it is overtime on Friday and Saturday closes since March. Food and beverage are in line with the group.',
      ],
    },
  },

  'independent-restaurants': {
    audience: 'Independent Restaurants',
    company: 'Little Wren Bistro',
    user: ['Daniel', 'Reyes', 'Chef-Owner'],
    season: 'casual',
    growth: 0.048,
    avgCheck: 46.2,
    cashWeeks: 3.1,
    ly: { food: -1.2, bev: 0.2, labor: 0.5, opex: 0.4 },
    locations: [['Little Wren Bistro', 2_180_000, 27.4, 5.3, 30.2, 25.6]],
    flag: { row: 0, col: 'food' },
    dex: {
      ask: 'Why did food cost go up this year?',
      answer: [
        'Food cost is **27.4%**, up **1.2 pts** on last year — about **$26k**.',
        'Produce from your main distributor is up 14% since spring, and the short rib special now plates at a 38% food cost.',
      ],
    },
  },

  'multi-unit-groups': {
    audience: 'Multi-Unit Groups',
    company: 'Brasswick Restaurant Group',
    user: ['Hannah', 'Cole', 'COO'],
    scopeLabel: '7 Locations',
    season: 'casual',
    growth: 0.052,
    avgCheck: 34.8,
    cashWeeks: 2.1,
    ly: { food: 0.6, bev: 0.1, labor: -0.4, opex: 0.5 },
    locations: [
      ['Brasswick Tavern · Old Town', 3_620_000, 24.9, 7.1, 28.4, 26.1],
      ['Brasswick Tavern · Harbor', 3_240_000, 25.2, 7.0, 28.9, 26.6],
      ['Mosswood Noodle · Midtown', 2_410_000, 26.8, 3.2, 27.1, 27.4],
      ['Cinderhollow BBQ · Westfield', 2_690_000, 31.6, 4.4, 28.2, 25.9],
    ],
    flag: { row: 3, col: 'food' },
    dex: {
      ask: 'Which location needs attention?',
      answer: [
        '**Cinderhollow BBQ · Westfield.** Food cost is **31.6%**, about 6 pts above your other concepts.',
        'Brisket invoices are up 9% since June and menu prices haven’t moved. Repricing the platters recovers about **$70k** a year.',
      ],
    },
  },

  'accounting-firms': {
    audience: 'Accounting Firms',
    company: 'Tallis & Penn CPAs',
    user: ['Priya', 'Raman', 'Partner'],
    scopeLabel: '4 Clients',
    rowLabel: 'Client',
    season: 'casual',
    growth: 0.041,
    avgCheck: 31.4,
    cashWeeks: 2.6,
    ly: { food: 0.3, bev: 0, labor: -0.6, opex: 0.3 },
    locations: [
      ['Marigold Cantina', 2_840_000, 25.6, 7.4, 29.8, 26.9],
      ['Bluefin Poke Co.', 1_920_000, 28.9, 2.1, 26.1, 27.8],
      ['Haverly’s Diner', 1_460_000, 29.4, 1.6, 35.1, 25.3],
      ['Sunbridge Bakery', 1_130_000, 27.1, 2.8, 30.2, 28.4],
    ],
    flag: { row: 2, col: 'labor' },
    dex: {
      ask: 'Which client should I call this week?',
      answer: [
        '**Haverly’s Diner.** Labor is **35.1%** and prime cost is **66.1%**, the highest in your portfolio.',
        'They also have 6 vendor bills waiting on approval. Every other client is closed through last period.',
      ],
    },
  },

  qsr: {
    audience: 'QSR',
    company: 'Bolt & Bun Burgers',
    user: ['Marcus', 'Bell', 'Franchise Owner'],
    scopeLabel: '12 Locations',
    season: 'qsr',
    growth: 0.043,
    avgCheck: 12.9,
    cashWeeks: 1.8,
    ly: { food: 0.5, bev: 0, labor: -0.3, opex: 0.4 },
    locations: [
      ['#104 · Route 9', 1_620_000, 28.4, 1.9, 25.8, 29.6],
      ['#107 · Airport Blvd', 1_570_000, 28.9, 1.8, 26.1, 29.2],
      ['#112 · Canal St', 1_310_000, 28.6, 1.8, 30.4, 29.9],
      ['#115 · Mill Creek', 1_390_000, 29.1, 1.9, 25.6, 30.1],
    ],
    flag: { row: 2, col: 'labor' },
    dex: {
      ask: 'Why is #112’s labor above the rest?',
      answer: [
        '#112 is running **30.4% labor**, about 4.5 pts above your other stores.',
        'The overnight shift is still staffed at 4 while drive-thru sales after 11pm are down 18%. Moving to 3 saves about **$38k** a year.',
      ],
    },
  },

  'fast-casual': {
    audience: 'Fast Casual',
    company: 'Field & Fold',
    user: ['Jordan', 'Kim', 'Founder'],
    scopeLabel: '5 Locations',
    season: 'qsr',
    growth: 0.071,
    avgCheck: 16.4,
    cashWeeks: 2.2,
    ly: { food: 0.8, bev: 0, labor: -0.2, opex: 0.5 },
    locations: [
      ['Union Square', 1_840_000, 29.1, 1.6, 26.9, 27.3],
      ['University', 1_620_000, 29.6, 1.5, 27.4, 27.9],
      ['Tech Park', 1_280_000, 29.8, 1.4, 31.2, 28.6],
      ['Riverside', 1_410_000, 29.3, 1.5, 27.8, 27.6],
    ],
    flag: { row: 2, col: 'labor' },
    dex: {
      ask: 'What’s happening at Tech Park?',
      answer: [
        'Sales at Tech Park are down 11% on Mondays and Fridays since the office hybrid schedule changed, but labor hasn’t moved with it.',
        'Trimming one opener on those days brings labor from **31.2%** back to about **28%**.',
      ],
    },
  },

  'casual-dining': {
    audience: 'Casual Dining',
    company: 'Hollis Street Grill',
    user: ['Tom', 'Alvarez', 'Owner'],
    season: 'casual',
    growth: 0.037,
    avgCheck: 41.2,
    cashWeeks: 2.4,
    ly: { food: 0.4, bev: 0.2, labor: -0.5, opex: 0.3 },
    locations: [
      ['Main St', 3_310_000, 24.6, 6.8, 29.9, 26.1],
      ['Brookside', 2_870_000, 24.2, 6.5, 30.2, 26.8],
      ['Airport', 2_540_000, 25.1, 7.2, 33.6, 25.4],
    ],
    flag: { row: 2, col: 'labor' },
    dex: {
      ask: 'Why is labor so high at Airport?',
      answer: [
        'Overtime at Airport is **41 hours a period**, all in the kitchen. Two line cooks are covering an open position; the other locations have none.',
        'Filling it brings labor from **33.6%** to about **30.5%**.',
      ],
    },
  },

  'fine-dining': {
    audience: 'Fine Dining',
    company: 'Maison Verrault',
    user: ['Elena', 'Moreau', 'Proprietor'],
    season: 'fine',
    growth: 0.052,
    avgCheck: 142.5,
    cashWeeks: 3.4,
    ly: { food: -1.1, bev: 0.3, labor: 0.4, opex: 0.2 },
    locations: [['Maison Verrault', 5_120_000, 23.9, 8.4, 35.1, 22.8]],
    flag: { row: 0, col: 'food' },
    dex: {
      ask: 'Why is food cost up on last year?',
      answer: [
        'Food cost is **23.9%**, up **1.1 pts** — about **$56k** over 12 months.',
        'Seafood drove most of it: langoustine and turbot invoices are up 12%, and the tasting menu price hasn’t changed since spring.',
      ],
    },
  },

  'coffee-shops': {
    audience: 'Coffee Shops',
    company: 'Lanternfish Coffee',
    user: ['Sam', 'Whitaker', 'Owner'],
    scopeLabel: '3 Cafés',
    rowLabel: 'Café',
    season: 'coffee',
    growth: 0.058,
    avgCheck: 9.8,
    cashWeeks: 2.8,
    ly: { food: 0.4, bev: 0.2, labor: -0.6, opex: 0.3 },
    locations: [
      ['Harbor St', 890_000, 9.6, 17.4, 31.8, 27.9],
      ['Old Mill', 780_000, 9.9, 17.8, 32.4, 28.1],
      ['Station Sq', 640_000, 13.8, 17.6, 32.9, 28.6],
    ],
    flag: { row: 2, col: 'food' },
    dex: {
      ask: 'Why is food cost higher at Station Sq?',
      answer: [
        'Pastry waste at Station Sq is **2× the other cafés**. Afternoon bake counts haven’t dropped since commuter traffic thinned after 2pm.',
        'Matching Old Mill’s bake schedule saves about **$24k** a year.',
      ],
    },
  },

  pizzerias: {
    audience: 'Pizzerias',
    company: 'Forno Ottavio',
    user: ['Gina', 'Russo', 'Owner'],
    season: 'pizza',
    growth: 0.046,
    avgCheck: 27.3,
    cashWeeks: 2.5,
    ly: { food: -0.9, bev: 0.1, labor: 0.3, opex: 0.4 },
    locations: [
      ['North End', 1_540_000, 25.4, 4.1, 28.2, 27.1],
      ['Lakeview', 1_210_000, 29.6, 3.8, 27.9, 27.6],
    ],
    flag: { row: 1, col: 'food' },
    dex: {
      ask: 'Why is Lakeview’s food cost higher?',
      answer: [
        'Cheese is **34%** of Lakeview’s food spend vs. 29% at North End, so portioning on large pies is running heavy.',
        'Bringing it in line saves about **$41k** a year. Delivery fees are flat.',
      ],
    },
  },

  'bars-nightclubs': {
    audience: 'Bars & Nightclubs',
    company: 'The Velvet Ledger',
    user: ['Andre', 'Lewis', 'Managing Partner'],
    scopeLabel: '2 Venues',
    rowLabel: 'Venue',
    season: 'bar',
    growth: 0.069,
    avgCheck: 31.5,
    cashWeeks: 3.0,
    ly: { food: 0.1, bev: -0.8, labor: 0.2, opex: 0.5 },
    locations: [
      ['The Velvet Ledger', 2_210_000, 3.8, 18.9, 23.6, 34.2],
      ['Afterglow Room', 1_640_000, 3.1, 22.7, 24.9, 35.1],
    ],
    flag: { row: 1, col: 'bev' },
    dex: {
      ask: 'Why is pour cost up at Afterglow?',
      answer: [
        'Tequila usage at Afterglow is **11% higher** than POS sales account for, which points to over-pours or comps on Fridays and Saturdays.',
        'Beer and wine are in line. Closing the gap is worth about **$46k** a year.',
      ],
    },
  },

  'hotel-restaurants-bars': {
    audience: 'Hotel Restaurants & Bars',
    company: 'The Ashcombe Hotel',
    user: ['Claire', 'Donovan', 'Director of F&B'],
    scopeLabel: '4 Outlets',
    rowLabel: 'Outlet',
    season: 'hotel',
    growth: 0.039,
    avgCheck: 48.7,
    cashWeeks: 2.0,
    ly: { food: 0.3, bev: 0.2, labor: -0.7, opex: 0.3 },
    locations: [
      ['Ashcombe Grill', 3_260_000, 25.8, 7.6, 33.4, 21.8],
      ['Lobby Bar', 1_640_000, 4.2, 19.8, 27.1, 24.6],
      ['Rooftop Terrace', 1_480_000, 18.9, 13.6, 30.6, 23.4],
      ['In-Room Dining', 1_120_000, 27.4, 4.1, 46.8, 18.2],
    ],
    flag: { row: 3, col: 'labor' },
    dex: {
      ask: 'Why is In-Room Dining labor so high?',
      answer: [
        'In-Room Dining is staffed for 92% occupancy but averaged **71%** this year, putting labor at **46.8%** of its sales.',
        'Moving one overnight server to on-call saves about **$58k** a year.',
      ],
    },
  },
};

// Interest, depreciation, amortisation, taxes — the gap between EBITDA and net.
const BELOW_EBITDA = 3.1;

function rng(seed) {
  let s = [...seed].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
  return () => (s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32;
}
const round = (v, dp = 0) => Math.round(v * 10 ** dp) / 10 ** dp;
const sum = (a) => a.reduce((x, y) => x + y, 0);

function build(id, p) {
  const r = rng(id);
  const noise = (amt) => 1 + (r() - 0.5) * 2 * amt;

  const locs = p.locations.map(([name, sales, food, bev, labor, opex]) => {
    const ebitdaPct = 100 - food - bev - labor - opex;
    const netPct = ebitdaPct - BELOW_EBITDA;
    return {
      name,
      sales,
      food,
      bev,
      labor,
      prime: round(food + bev + labor, 1),
      opex,
      ebitda: round((sales * ebitdaPct) / 100),
      netProfit: round((sales * netPct) / 100),
      netPct: round(netPct, 1),
    };
  });

  const totalSales = sum(locs.map((l) => l.sales));
  const w = (k) => sum(locs.map((l) => l.sales * l[k])) / totalSales;
  const pct = { food: w('food'), bev: w('bev'), labor: w('labor'), opex: w('opex') };
  const lyPct = Object.fromEntries(Object.entries(pct).map(([k, v]) => [k, v + (p.ly[k] ?? 0)]));
  const lySales = totalSales / (1 + p.growth);

  const pnlFor = (sales, q) => {
    const cogs = (sales * (q.food + q.bev)) / 100;
    const labor = (sales * q.labor) / 100;
    const opex = (sales * q.opex) / 100;
    const ebitda = sales - cogs - labor - opex;
    return { sales, cogs, labor, prime: cogs + labor, opex, ebitda, net: ebitda - (sales * BELOW_EBITDA) / 100 };
  };
  const now = pnlFor(totalSales, pct);
  const then = pnlFor(lySales, lyPct);

  // Monthly sales, this year and last. This year sums exactly to the total.
  const season = SEASON[p.season];
  const sw = sum(season);
  const monthly = season.map((s) => ((totalSales * s) / sw) * noise(0.025));
  const k = totalSales / sum(monthly);
  const thisYear = monthly.map((m) => round(m * k));
  const lastYear = season.map((s) => round(((lySales * s) / sw) * noise(0.03)));

  // KPI sparklines: 12 monthly points drifting from last year's level to this year's.
  const at = (i, a, b) => a + ((b - a) * i) / 11;
  const primeNow = (now.prime / now.sales) * 100;
  const primeLY = (then.prime / then.sales) * 100;
  const primeSpark = thisYear.map((_, i) => round(at(i, primeLY, primeNow) + (r() - 0.5) * 0.8, 1));
  primeSpark[11] = round(primeNow, 1);
  const ebitdaSpark = thisYear.map((m, i) => round(m * at(i, then.ebitda / then.sales, now.ebitda / now.sales) * noise(0.06)));
  const netSpark = ebitdaSpark.map((e, i) => round(e - (thisYear[i] * BELOW_EBITDA) / 100));
  const cash = round((totalSales / 52) * p.cashWeeks, -2);
  const cashSpark = thisYear.map((_, i) => round(cash * at(i, 0.8, 1) * noise(0.03), -2));
  cashSpark[11] = cash;
  // Trend colour follows the year-over-year change, as the app's cards do.
  const trend = (nowV, thenV, goodWhenUp = true) => ((nowV > thenV) === goodWhenUp ? 'improving' : 'declining');

  return {
    $comment: 'Fictional data for marketing animations. Generated by generate.mjs — see animations/README.md.',
    id,
    audience: p.audience,
    company: { name: p.company, scopeLabel: p.scopeLabel ?? `${locs.length} Location${locs.length > 1 ? 's' : ''}` },
    user: { firstName: p.user[0], lastName: p.user[1], role: p.user[2], initials: p.user[0][0] + p.user[1][0] },
    period: 'Last 12 months',
    months: MONTHS,
    kpis: [
      { key: 'sales', label: 'Total Sales', value: round(now.sales), format: 'k', spark: thisYear, trend: trend(now.sales, then.sales) },
      { key: 'prime', label: 'Prime Cost %', value: round(primeNow, 1), format: 'pct', spark: primeSpark, trend: trend(primeNow, primeLY, false) },
      { key: 'ebitda', label: 'EBITDA', value: round(now.ebitda), format: 'k', spark: ebitdaSpark, trend: trend(now.ebitda, then.ebitda) },
      { key: 'net', label: 'Net Profit', value: round(now.net), format: 'k', spark: netSpark, trend: trend(now.net, then.net) },
      { key: 'cash', label: 'Cash Balance', value: cash, format: 'k', spark: cashSpark, trend: trend(cashSpark[11], cashSpark[0]) },
    ],
    pnl: [
      ['Total Sales', 'sales', true],
      ['COGS', 'cogs', false],
      ['Labor', 'labor', false],
      ['Prime Cost', 'prime', false],
      ['Operating Expenses', 'opex', false],
      ['EBITDA', 'ebitda', true],
      ['Net Profit', 'net', true],
    ].map(([metric, key, goodWhenUp]) => ({ metric, actual: round(now[key]), lastYear: round(then[key]), goodWhenUp })),
    sales: { guests: round(totalSales / p.avgCheck), avgCheck: p.avgCheck, thisPeriod: thisYear, lastYear },
    costBreakdown: [
      { label: 'COGS', pct: round(pct.food + pct.bev, 1) },
      { label: 'Labor', pct: round(pct.labor, 1) },
      { label: 'Operating Expenses', pct: round(pct.opex, 1) },
      { label: 'Other', pct: BELOW_EBITDA },
    ],
    rowLabel: p.rowLabel ?? 'Location',
    locations: locs.map(({ opex, ...l }) => l),
    flag: p.flag,
    dex: { ask: p.dex.ask, answer: p.dex.answer },
  };
}

const only = process.argv.slice(2);
for (const [id, p] of Object.entries(PROFILES)) {
  if (only.length && !only.includes(id)) continue;
  const out = build(id, p);
  writeFileSync(join(here, `${id}.json`), JSON.stringify(out, null, 2) + '\n');
  const k = Object.fromEntries(out.kpis.map((x) => [x.key, x.value]));
  const pc = (v) => ((v / k.sales) * 100).toFixed(1);
  console.log(`${id.padEnd(24)} sales $${(k.sales / 1e6).toFixed(2)}M  prime ${k.prime}%  EBITDA ${pc(k.ebitda)}%  net ${pc(k.net)}%  cash $${Math.round(k.cash / 1e3)}k`);
}
