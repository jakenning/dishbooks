// Generates the scenario JSON files from a handful of operating assumptions
// per audience. Every company, location and person here is fictional.
//
//   node animations/scenarios/generate.mjs           # rewrite all scenarios
//   node animations/scenarios/generate.mjs qsr home  # just these
//
// You can also hand-edit the JSON it writes — the scenes only read the JSON.
// Re-running this script overwrites hand edits, so for one-off tweaks edit the
// JSON; for changes you want to keep, edit the PROFILES below.
//
// Benchmarks the numbers are tuned to (US, % of net sales):
//   prime cost 55–65% (bars ~45–50%, fine dining / hotel F&B up to ~68%)
//   food/bev cost 28–32% (bars: pour cost ~20–24%)
//   labor 25–35%, net profit 3–15%

import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

// Day-of-week sales mix, Monday first. Sums to ~1.
const MIX = {
  casual: [0.1, 0.11, 0.12, 0.14, 0.19, 0.2, 0.14],
  qsr: [0.13, 0.135, 0.14, 0.145, 0.16, 0.155, 0.135],
  fastCasual: [0.14, 0.145, 0.15, 0.15, 0.16, 0.13, 0.125],
  fine: [0, 0.12, 0.14, 0.16, 0.22, 0.24, 0.12],
  coffee: [0.155, 0.155, 0.15, 0.15, 0.15, 0.135, 0.105],
  pizza: [0.11, 0.11, 0.12, 0.14, 0.2, 0.19, 0.13],
  bar: [0.04, 0.06, 0.09, 0.16, 0.3, 0.31, 0.04],
  hotel: [0.135, 0.14, 0.145, 0.15, 0.15, 0.145, 0.135],
};

// One profile per scenario. `weekly` is net sales per week for the whole
// entity shown. `food`/`labor`/`net` are period-to-date % of sales; `d*` are
// the change vs last period in points. `rows` drive the right-hand panel.
const PROFILES = {
  home: {
    audience: 'Homepage — multi-unit casual dining',
    company: 'Fernhollow Hospitality',
    scope: 'All locations',
    scopeCount: '4 locations',
    user: ['Maya', 'Ortiz', 'Owner'],
    mix: 'casual',
    weekly: 238_400,
    growth: 0.052,
    cashWeeks: 0.86,
    cashDelta: 3.8,
    food: 28.9, dFood: -0.6,
    labor: 30.1, dLabor: 0.4,
    net: 9.8, dNet: 0.7,
    panel: {
      title: 'Locations',
      subtitle: 'Prime cost · period to date',
      target: 60,
      rows: [
        ['Downtown', 0.31, 58.4],
        ['Northgate', 0.26, 57.9],
        ['Eastside', 0.23, 63.6, 'warn'],
        ['Riverside', 0.2, 59.1],
      ],
    },
    dex: {
      ask: 'Why is Eastside over target?',
      answer:
        'Labor at Eastside is up 3.1 pts vs. last period — two extra closing shifts on Tue and Wed while covers were flat. Food cost is on target.',
    },
  },

  'independent-restaurants': {
    audience: 'Independent Restaurants',
    company: 'Little Wren Bistro',
    scope: 'Single location',
    scopeCount: '1 location',
    user: ['Daniel', 'Reyes', 'Chef-Owner'],
    mix: 'casual',
    weekly: 41_800,
    growth: 0.034,
    cashWeeks: 1.4,
    cashDelta: 2.1,
    food: 30.2, dFood: 1.1,
    labor: 29.6, dLabor: -0.4,
    net: 8.4, dNet: -0.3,
    panel: {
      title: 'Cost breakdown',
      subtitle: '% of net sales · period to date',
      categories: true,
      rows: [
        ['Food', null, 26.1, 'warn', 24.5],
        ['Beverage', null, 4.1, null, 5],
        ['Labor — Kitchen', null, 15.2, null, 15.5],
        ['Labor — Front of house', null, 14.4, null, 14.5],
      ],
    },
    dex: {
      ask: 'What pushed food cost up?',
      answer:
        'Produce invoices from your main distributor are up 14% over four weeks — mostly avocados and berries. Your short rib special is now plating at a 38% food cost.',
    },
  },

  'multi-unit-groups': {
    audience: 'Multi-Unit Groups',
    company: 'Brasswick Restaurant Group',
    scope: 'All concepts',
    scopeCount: '7 locations · 3 concepts',
    user: ['Hannah', 'Cole', 'COO'],
    mix: 'casual',
    weekly: 352_600,
    growth: 0.041,
    cashWeeks: 0.92,
    cashDelta: 1.6,
    food: 29.4, dFood: -0.3,
    labor: 29.9, dLabor: 0.5,
    net: 8.9, dNet: 0.2,
    panel: {
      title: 'Locations',
      subtitle: 'Prime cost · period to date',
      target: 61,
      rows: [
        ['Brasswick Tavern · Old Town', 0.19, 59.6],
        ['Brasswick Tavern · Harbor', 0.17, 60.2],
        ['Mosswood Noodle · Midtown', 0.14, 56.8],
        ['Cinderhollow BBQ · Westfield', 0.15, 64.1, 'warn'],
      ],
    },
    dex: {
      ask: 'Which location needs attention?',
      answer:
        'Cinderhollow BBQ — Westfield is 3.1 pts over target. Brisket costs rose 9% on the last two invoices and weren’t reflected in menu prices.',
    },
  },

  'accounting-firms': {
    audience: 'Accounting Firms',
    company: 'Tallis & Penn CPAs',
    scope: 'Client: Marigold Cantina',
    scopeCount: '23 restaurant clients',
    user: ['Priya', 'Raman', 'Partner'],
    mix: 'casual',
    weekly: 64_200,
    growth: 0.027,
    cashWeeks: 1.1,
    cashDelta: -2.4,
    food: 29.8, dFood: 0.2,
    labor: 31.2, dLabor: 0.9,
    net: 6.7, dNet: -0.8,
    panel: {
      title: 'Client portfolio',
      subtitle: 'Prime cost · period to date',
      target: 62,
      rows: [
        ['Marigold Cantina', 0.3, 61.0],
        ['Bluefin Poke Co.', 0.22, 57.3],
        ['Haverly’s Diner', 0.26, 65.8, 'warn'],
        ['Sunbridge Bakery', 0.22, 59.4],
      ],
    },
    dex: {
      ask: 'Which clients should I call this week?',
      answer:
        'Haverly’s Diner — prime cost is 3.8 pts over target and 6 vendor bills are awaiting approval. Every other client is closed through last period.',
    },
  },

  qsr: {
    audience: 'QSR',
    company: 'Bolt & Bun Burgers',
    scope: 'All locations',
    scopeCount: '12 locations',
    user: ['Marcus', 'Bell', 'Franchise Owner'],
    mix: 'qsr',
    weekly: 318_900,
    growth: 0.038,
    cashWeeks: 0.74,
    cashDelta: 4.6,
    food: 29.6, dFood: -0.4,
    labor: 26.8, dLabor: 0.3,
    net: 11.2, dNet: 0.5,
    panel: {
      title: 'Locations',
      subtitle: 'Prime cost · period to date',
      target: 58,
      rows: [
        ['#104 — Route 9', 0.094, 55.1],
        ['#107 — Airport Blvd', 0.091, 55.9],
        ['#112 — Canal St', 0.081, 60.7, 'warn'],
        ['#115 — Mill Creek', 0.084, 56.4],
      ],
    },
    dex: {
      ask: 'Why is #112 over target?',
      answer:
        'Labor at #112 is 2.4 pts above the group — the overnight shift is staffed at 4 while drive-thru sales after 11pm fell 18%.',
    },
  },

  'fast-casual': {
    audience: 'Fast Casual',
    company: 'Field & Fold',
    scope: 'All locations',
    scopeCount: '5 locations',
    user: ['Jordan', 'Kim', 'Founder'],
    mix: 'fastCasual',
    weekly: 131_700,
    growth: 0.061,
    cashWeeks: 0.95,
    cashDelta: 5.2,
    food: 30.4, dFood: -0.8,
    labor: 27.9, dLabor: 0.2,
    net: 9.1, dNet: 0.9,
    panel: {
      title: 'Locations',
      subtitle: 'Prime cost · period to date',
      target: 59,
      rows: [
        ['Union Square', 0.24, 56.6],
        ['University', 0.21, 57.8],
        ['Tech Park', 0.18, 61.9, 'warn'],
        ['Riverside', 0.19, 58.2],
      ],
    },
    dex: {
      ask: 'What’s happening at Tech Park?',
      answer:
        'Tech Park sales are down 11% on Mondays and Fridays since the office hybrid schedule changed — labor hasn’t moved with it.',
    },
  },

  'casual-dining': {
    audience: 'Casual Dining',
    company: 'Hollis Street Grill',
    scope: 'All locations',
    scopeCount: '3 locations',
    user: ['Tom', 'Alvarez', 'Owner'],
    mix: 'casual',
    weekly: 176_300,
    growth: 0.029,
    cashWeeks: 0.88,
    cashDelta: 2.7,
    food: 30.6, dFood: -0.2,
    labor: 31.4, dLabor: 0.6,
    net: 7.2, dNet: 0.3,
    panel: {
      title: 'Locations',
      subtitle: 'Prime cost · period to date',
      target: 62,
      rows: [
        ['Main St', 0.38, 61.1],
        ['Brookside', 0.33, 60.4],
        ['Airport', 0.29, 65.3, 'warn'],
      ],
    },
    dex: {
      ask: 'Why is the Airport location over?',
      answer:
        'Overtime at Airport is 41 hours this period, all in the kitchen. Two line cooks are covering a vacancy — the other locations have none.',
    },
  },

  'fine-dining': {
    audience: 'Fine Dining',
    company: 'Maison Verrault',
    scope: 'Single location',
    scopeCount: '1 location',
    user: ['Elena', 'Moreau', 'Proprietor'],
    mix: 'fine',
    weekly: 96_400,
    growth: 0.044,
    cashWeeks: 1.6,
    cashDelta: 1.9,
    food: 32.1, dFood: 0.9,
    labor: 35.2, dLabor: -0.5,
    net: 6.3, dNet: 0.2,
    panel: {
      title: 'Cost breakdown',
      subtitle: '% of net sales · period to date',
      categories: true,
      rows: [
        ['Food', null, 22.6, 'warn', 21],
        ['Wine & spirits', null, 9.5, null, 10],
        ['Labor — Kitchen', null, 19.8, null, 20],
        ['Labor — Dining room', null, 15.4, null, 15.5],
      ],
    },
    dex: {
      ask: 'Why is food cost up this period?',
      answer:
        'Seafood is up 1.6 pts — your langoustine and turbot invoices rose 12% and the tasting menu price hasn’t changed since spring.',
    },
  },

  'coffee-shops': {
    audience: 'Coffee Shops',
    company: 'Lanternfish Coffee',
    scope: 'All cafés',
    scopeCount: '3 cafés',
    user: ['Sam', 'Whitaker', 'Owner'],
    mix: 'coffee',
    weekly: 38_900,
    growth: 0.048,
    cashWeeks: 1.2,
    cashDelta: 3.1,
    food: 27.6, dFood: 0.5,
    labor: 33.4, dLabor: -0.7,
    net: 10.6, dNet: 0.4,
    panel: {
      title: 'Cafés',
      subtitle: 'Prime cost · period to date',
      target: 62,
      rows: [
        ['Harbor St', 0.39, 59.8],
        ['Old Mill', 0.34, 60.6],
        ['Station Sq', 0.27, 64.2, 'warn'],
      ],
    },
    dex: {
      ask: 'What’s driving Station Sq?',
      answer:
        'Pastry waste at Station Sq is 2× the other cafés — afternoon bake counts haven’t dropped since commuter traffic thinned after 2pm.',
    },
  },

  pizzerias: {
    audience: 'Pizzerias',
    company: 'Forno Ottavio',
    scope: 'All locations',
    scopeCount: '2 locations',
    user: ['Gina', 'Russo', 'Owner'],
    mix: 'pizza',
    weekly: 52_300,
    growth: 0.036,
    cashWeeks: 1.05,
    cashDelta: 2.4,
    food: 28.7, dFood: 0.8,
    labor: 28.2, dLabor: -0.3,
    net: 10.9, dNet: -0.2,
    panel: {
      title: 'Locations',
      subtitle: 'Prime cost · period to date',
      target: 58,
      rows: [
        ['North End', 0.56, 56.1],
        ['Lakeview', 0.44, 58.9, 'warn'],
      ],
    },
    dex: {
      ask: 'Why is Lakeview creeping up?',
      answer:
        'Cheese is 34% of Lakeview’s food spend vs. 29% at North End — portioning on large pies is running heavy. Delivery fees are flat.',
    },
  },

  'bars-nightclubs': {
    audience: 'Bars & Nightclubs',
    company: 'The Velvet Ledger',
    scope: 'All venues',
    scopeCount: '2 venues',
    user: ['Andre', 'Lewis', 'Managing Partner'],
    mix: 'bar',
    weekly: 71_600,
    growth: 0.057,
    cashWeeks: 1.3,
    cashDelta: 6.2,
    food: 21.4, dFood: 0.6,
    labor: 24.8, dLabor: -0.4,
    net: 14.2, dNet: 0.8,
    foodLabel: 'Pour cost',
    panel: {
      title: 'Venues',
      subtitle: 'Prime cost · period to date',
      target: 47,
      rows: [
        ['The Velvet Ledger', 0.58, 45.2],
        ['Afterglow Room', 0.42, 48.9, 'warn'],
      ],
    },
    dex: {
      ask: 'Why is pour cost up at Afterglow?',
      answer:
        'Tequila depletion at Afterglow is 11% above what POS sales account for — likely over-pours or comps on Fri and Sat. Beer and wine are in line.',
    },
  },

  'hotel-restaurants-bars': {
    audience: 'Hotel Restaurants & Bars',
    company: 'The Ashcombe Hotel',
    scope: 'All F&B outlets',
    scopeCount: '4 outlets',
    user: ['Claire', 'Donovan', 'Director of F&B'],
    mix: 'hotel',
    weekly: 148_200,
    growth: 0.033,
    cashWeeks: 0.8,
    cashDelta: 1.2,
    food: 29.8, dFood: -0.5,
    labor: 37.6, dLabor: 0.8,
    net: 8.1, dNet: -0.1,
    panel: {
      title: 'Outlets',
      subtitle: 'Prime cost · period to date',
      target: 68,
      rows: [
        ['Ashcombe Grill', 0.42, 66.8],
        ['Lobby Bar', 0.21, 54.2],
        ['Rooftop Terrace', 0.19, 63.1],
        ['In-Room Dining', 0.18, 79.4, 'warn'],
      ],
    },
    dex: {
      ask: 'Why is in-room dining so high?',
      answer:
        'In-room dining is staffed for 92% occupancy but averaged 71% this period. Shifting one overnight server to on-call saves about $4,800 a month.',
    },
  },
};

// Deterministic noise so re-running produces the same numbers.
function rng(seed) {
  let s = [...seed].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32);
}

const round = (v, dp = 0) => Math.round(v * 10 ** dp) / 10 ** dp;

// 28 days ending yesterday. Today is Thursday, so the last three bars are
// Mon–Wed of the current week — exactly what "week to date" sums.
function salesDays(p, r) {
  const mix = MIX[p.mix];
  const days = [];
  for (let w = 0; w < 5; w++) {
    const weekBase = p.weekly * (1 + p.growth * (w - 4) / 4);
    for (let d = 0; d < 7; d++) {
      if (w === 4 && d > 2) break; // Thu–Sun of this week haven't happened yet
      const noise = mix[d] === 0 ? 0 : 1 + (r() - 0.5) * 0.12;
      days.push(round(weekBase * mix[d] * noise));
    }
  }
  // Keep the last 28 days, so the oldest bar is a Thursday.
  return days.slice(days.length - 28);
}

function spark(r, end, drift, n = 12) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const back = n - 1 - i;
    out.push(round(end - drift * (back / (n - 1)) + (r() - 0.5) * Math.abs(drift || end * 0.02) * 0.6, 2));
  }
  out[n - 1] = end;
  return out;
}

function build(id, p) {
  const r = rng(id);
  const days = salesDays(p, r);
  // Pin week-to-date vs. the same days last week to the profile's growth, so
  // the noise can't flip the headline tile negative.
  const sum = (a) => a.reduce((x, y) => x + y, 0);
  const lastWeekSameDays = sum(days.slice(-10, -7));
  const want = lastWeekSameDays * (1 + (p.wtdDelta ?? p.growth * 100) / 100);
  const k = want / sum(days.slice(-3));
  for (let i = days.length - 3; i < days.length; i++) days[i] = round(days[i] * k);
  const wtd = sum(days.slice(-3));
  const salesDelta = round(((wtd - lastWeekSameDays) / lastWeekSameDays) * 100, 1);
  // cashWeeks = weeks of sales held in the bank (healthy range ~1.5–3).
  const cash = round(p.weekly * p.cashWeeks * 2.4 / 10) * 10;
  const prime = round(p.food + p.labor, 1);
  const dPrime = round(p.dFood + p.dLabor, 1);

  const panelRows = p.panel.rows.map(([name, share, pct, status, target]) => ({
    name,
    sales: share == null ? null : round(wtd * share / 10) * 10,
    pct,
    target: target ?? p.panel.target,
    status: status ?? (pct > (target ?? p.panel.target) ? 'warn' : 'ok'),
  }));

  return {
    $comment: 'Fictional data for marketing animations. Generated by generate.mjs — see animations/README.md.',
    id,
    audience: p.audience,
    company: { name: p.company, scope: p.scope, scopeCount: p.scopeCount },
    user: { firstName: p.user[0], lastName: p.user[1], role: p.user[2], initials: p.user[0][0] + p.user[1][0] },
    greeting: 'Good morning',
    period: { label: 'This period', wtdLabel: 'Week to date' },
    kpis: [
      { key: 'cash', label: 'Cash balance', value: cash, format: 'money', delta: p.cashDelta, unit: '%', goodWhen: 'up', compare: 'vs. last week', spark: spark(r, cash, cash * p.cashDelta / 100) },
      { key: 'sales', label: 'Net sales (week to date)', value: round(wtd), format: 'money', delta: salesDelta, unit: '%', goodWhen: 'up', compare: 'vs. last week', spark: days.slice(-12) },
      { key: 'prime', label: 'Prime cost', value: prime, format: 'pct', delta: dPrime, unit: 'pts', goodWhen: 'down', compare: 'vs. last period', spark: spark(r, prime, dPrime) },
      { key: 'food', label: p.foodLabel ?? 'Food cost', value: p.food, format: 'pct', delta: p.dFood, unit: 'pts', goodWhen: 'down', compare: 'vs. last period', spark: spark(r, p.food, p.dFood) },
      { key: 'labor', label: 'Labor cost', value: p.labor, format: 'pct', delta: p.dLabor, unit: 'pts', goodWhen: 'down', compare: 'vs. last period', spark: spark(r, p.labor, p.dLabor) },
      { key: 'net', label: 'Net profit', value: p.net, format: 'pct', delta: p.dNet, unit: 'pts', goodWhen: 'up', compare: 'vs. last period', spark: spark(r, p.net, p.dNet) },
    ],
    salesTrend: {
      title: 'Net sales',
      subtitle: 'Daily · last 4 weeks',
      days,
      // Weekday of the first bar (0 = Mon). 28 bars ending on a Wednesday.
      firstWeekday: 3,
      currentWeekBars: 3,
    },
    panel: {
      title: p.panel.title,
      subtitle: p.panel.subtitle,
      mode: p.panel.categories ? 'categories' : 'entities',
      rows: panelRows,
    },
    dex: p.dex,
  };
}

const only = process.argv.slice(2);
for (const [id, p] of Object.entries(PROFILES)) {
  if (only.length && !only.includes(id)) continue;
  const out = build(id, p);
  writeFileSync(join(here, `${id}.json`), JSON.stringify(out, null, 2) + '\n');
  const k = Object.fromEntries(out.kpis.map((x) => [x.key, x.value]));
  console.log(`${id.padEnd(24)} cash ${String(k.cash).padStart(8)}  wtd ${String(k.sales).padStart(8)}  prime ${k.prime}%  net ${k.net}%`);
}
