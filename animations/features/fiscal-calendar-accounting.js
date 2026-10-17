// Fiscal Calendar Accounting — Settings → Calendars.
//
// The Calendars page loads (the grid row, the 2026 timeline, Total Sales by
// month with the 5-weekend months flagged). Operational Structure goes from
// Months to 13-4; the year re-cuts into thirteen 28-day periods; Total Sales
// re-flows into even, comparable periods. The page is the homepage hero's
// (../scenes/home-hero/hero.js).

import { calView, calRefs, calMeasure, calFrame } from '../scenes/home-hero/hero.js';

const CAL = {
  tlDraw: [0.25, 0.8],
  monthBars: [0.35, 0.7],
  fiveFlags: 0.9,
  cellClick: 1.95,
  selectOpen: [2.0, 0.18],
  optionHover: 2.3,
  optionClick: 2.55,
  selectClose: [2.6, 0.15],
  morph: [3.45, 0.9],
  quarters: [4.05, 0.4],
  chartMorph: [5.75, 1.0],
};

export const STORY = {
  id: 'fiscal-calendar-accounting',
  duration: 10,
  startAt: { d: 1.2 },
  nav: 7,
  crumb: 'Settings',
  title: 'Calendars',
  rootClass: ['hh'],
  view: (D, L, N, id) => calView(D, L, id),
  refs: (q, qa) => calRefs(q, qa),
  blocks: () => ['.calg', '.tlc', '.repc'],
  spots: () => [
    { at: 1.3, dur: 1.9, sel: ['.calg'], focus: ['.calg', '.rs'], label: '13-4, 4-4-5, 4-5-4, 5-4-4 or calendar months' },
    { at: 3.3, dur: 2.2, sel: ['.tlc'], label: 'Thirteen periods of 28 days, 4 weekends each' },
    { at: 5.6, dur: 2.6, sel: ['.repc'], label: 'Compare periods like for like' },
  ],
  taps: () => {
    let g = null; // the dropdown is hidden until it opens: measure it once, opened
    const cal = (R, at) => (g ??= calMeasure(R, at));
    return [
      { at: CAL.cellClick, pos: (R, at) => cal(R, at).cell },
      { at: CAL.optionClick, pos: (R, at) => cal(R, at).option },
    ];
  },
  frame: (t, R, L) => calFrame(R, t, CAL, L, 0.05),
};
