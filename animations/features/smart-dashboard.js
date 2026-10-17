// Smart Dashboard — "Every number that matters, the moment you log in."
//
// Home loads (KPI cards count up, Sales Performance and Cost Breakdown draw),
// then the spotlight walks it: sales and prime cost, net profit and cash, the
// sales trend against last year, and where each sales dollar goes.

import { homeView } from '../scenes/why-dishbooks/app.js';
import { homeRefs, homeLoad } from './pages.js';

export const STORY = {
  id: 'smart-dashboard',
  duration: 10,
  startAt: { d: 1.65 }, // Home loaded, nothing lit yet
  nav: 0,
  title: 'Home',
  view: (D, L, N, id) => homeView(D, L, id),
  refs: (q, qa, L, D) => homeRefs(q, qa, L, D),
  blocks: () => ['.kpi', '.salesp', '.cost'],
  spots: () => [
    { at: 1.7, dur: 1.9, sel: (R) => byKey(R, ['sales', 'prime']), label: 'Sales and prime cost, current every morning' },
    { at: 3.7, dur: 1.9, sel: (R) => byKey(R, ['net', 'cash']), label: 'Net profit and cash, no spreadsheet' },
    { at: 5.7, dur: 2.0, sel: ['.salesp'], label: 'Sales against last year, month by month' },
    { at: 7.8, dur: 1.65, sel: ['.cost'], label: 'Where every sales dollar goes' },
  ],
  frame: (t, R, L, D) => homeLoad(t, R, L, D, 0.05),
};

const byKey = (R, keys) => R.kpis.filter((k) => keys.includes(k.d.key)).map((k) => k.el);
