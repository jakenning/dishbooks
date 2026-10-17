// Invoice Approval & Bill Pay — Expenses → Bills.
//
// Bills that came in by email, already read: vendor, invoice number, due date,
// category, amount. The open invoice's lines are coded to the company's COGS
// categories. The spotlight walks it: the bills waiting for approval, the
// coded line items, Approve, and scheduling the payment. Vendors and lines are
// invented (search them before publishing).

import { seg, ease, riseIn } from '../lib/timeline.js';
import { icon } from '../shared/icons.js';
import { esc } from '../scenes/why-dishbooks/app.js';

const APPROVE = 5.95;
const PAY = 7.85;
const usd = (v) => `$${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// The open invoice: [item, category, amount].
const LINES = [
  ['Beef short rib, 30 lb', 'Proteins', 1947.0],
  ['Chicken thighs, 40 lb', 'Proteins', 1084.5],
  ['Atlantic salmon, 25 lb', 'Proteins', 1312.4],
  ['Heavy cream, 6 × ½ gal', 'Dairy & Bakery', 214.8],
  ['Brioche buns, 96 ct', 'Dairy & Bakery', 388.8],
  ['Russet potatoes, 50 lb', 'Produce', 268.0],
];
const INV_TOTAL = LINES.reduce((a, l) => a + l[2], 0);
// [vendor, invoice #, due, category, amount, status: na needs approval | ok approved | sc scheduled]
const BILLS = [
  ['Larkfield Provisions', 'INV-20714', 'Oct 14', 'COGS · Food', INV_TOTAL, 'na'],
  ['Copperleaf Beverage Co.', 'CB-5521', 'Oct 15', 'COGS · Beverage', 3914.4, 'na'],
  ['Harrow Lane Produce', '88213', 'Oct 16', 'COGS · Food', 2186.75, 'na'],
  ['Valecrest Power & Light', '0042-1187', 'Oct 20', 'Utilities', 3067.06, 'na'],
  ['Northline Linen Service', 'NL-3390', 'Oct 22', 'Linen & Laundry', 842.3, 'ok'],
  ['Bellmont Dairy Co.', 'BD-1066', 'Oct 13', 'COGS · Food', 1526.9, 'sc'],
];
const STATUS = { na: 'Needs approval', ok: 'Approved', sc: 'Scheduled · Oct 13' };

function ibView(D, L) {
  const st = (s) => `<span class="bst ${s}">${STATUS[s]}</span>`;
  // The first bill's status changes on Approve and again on Schedule payment.
  const first = `<span class="bst3"><span class="bst na">${STATUS.na}</span><span class="bst ok">${STATUS.ok}</span><span class="bst sc">${STATUS.sc}</span></span>`;
  const row = (b, i) =>
    L.compact
      ? `<div class="tr${b[5] === 'na' ? ' na' : ''}${i === 0 ? ' sel' : ''}"><span class="d2"><b>${esc(b[0])}</b><em>Due ${b[2]} · ${esc(b[3])}</em></span><span class="am">${usd(b[4])}</span>${i === 0 ? first : st(b[5])}</div>`
      : `<div class="tr${b[5] === 'na' ? ' na' : ''}${i === 0 ? ' sel' : ''}"><span class="ds">${esc(b[0])}</span><span class="cg">${b[2]}</span><span class="cg">${esc(b[3])}</span><span class="am">${usd(b[4])}</span>${i === 0 ? first : st(b[5])}</div>`;
  const acct = D.locations.length > 1 ? 'Operating ••4821' : 'Operating ••4821';
  return `<section class="view ibv">
    <div class="card bls">
      <div class="ch"><div class="ct">Bills</div><div class="tabs"><span class="on">Needs approval <b>4</b></span><span>Scheduled <b>7</b></span><span>Paid</span></div></div>
      <div class="tx">
        ${L.compact ? '' : '<div class="tr th"><span>Vendor</span><span>Due</span><span>Category</span><span>Amount</span><span>Status</span></div>'}
        ${BILLS.map(row).join('')}
      </div>
      ${L.compact ? '' : `<div class="inbox">${icon('paper-plane-right')}Forward bills to <b>bills@${esc(D.company.name.split(' ')[0].toLowerCase())}.dishbooks.com</b> — they land here, already read</div>`}
    </div>
    <div class="card inv">
      <div class="ih"><span class="vlogo">LP</span><div class="rn"><b>Larkfield Provisions</b><span>INV-20714 · Due Oct 14 · Net 7</span></div><span class="src">${icon('check')}Read from email</span></div>
      <div class="lis">
        <div class="lih"><span>Item</span><span>Category</span><span>Amount</span></div>
        ${LINES.map(([n, c, a]) => `<div class="li"><span class="ln">${esc(n)}</span><span class="lc2">${esc(c)}</span><span class="la">${usd(a)}</span></div>`).join('')}
        <div class="li lt"><span class="ln">Total</span><span></span><span class="la">${usd(INV_TOTAL)}</span></div>
      </div>
      <div class="act"><span class="abtn"><span class="b1">${icon('check')}Approve</span><span class="b2">${icon('check')}Approved by ${esc(D.user.firstName)} ${esc(D.user.lastName)}</span></span><span class="rej">Reject</span></div>
      <div class="pay">
        <div class="fr"><span class="fl2">Pay from</span><span class="sel">${icon('bank')}${acct}${icon('caret-down', 'car')}</span></div>
        <div class="fr"><span class="fl2">Pay on</span><span class="sel">${icon('calendar')}Oct 13 · ACH${icon('caret-down', 'car')}</span></div>
        <div class="pbtn"><span class="b1">Schedule payment · ${usd(INV_TOTAL)}</span><span class="b2">${icon('check')}Scheduled · ACH, Oct 13</span></div>
      </div>
    </div>
  </section>`;
}

export const STORY = {
  id: 'invoice-bill-pay',
  duration: 10,
  startAt: { d: 1.25 },
  nav: 2,
  crumb: 'Expenses',
  title: 'Bills',
  app: { m: { h: 1240 } },
  view: (D, L) => ibView(D, L),
  refs: (q, qa) => ({
    bls: q('.bls'),
    rows: qa('.bls .tr'),
    first: q('.bst3'),
    inv: q('.inv'),
    lis: qa('.li'),
    abtn: q('.abtn'),
    pbtn: q('.pbtn'),
    pay: q('.pay'),
  }),
  blocks: () => ['.bls .ch', '.bls .tr', '.inbox', '.inv .ih', '.lis', '.act', '.pay'],
  spots: (L) => [
    { at: 1.3, dur: 1.9, sel: ['.bls .tr.na'], label: 'Bills arrive by email, already read' },
    { at: 3.3, dur: 2.0, sel: ['.lis'], label: 'Every line coded to your COGS categories' },
    { at: 5.4, dur: 1.75, sel: L.compact ? ['.act'] : ['.act', '.bls .tr.sel'], label: 'Approve in one click' },
    { at: 7.25, dur: 2.15, sel: ['.pay'], label: 'Paid on time, from the right account' },
  ],
  taps: () => [
    { at: APPROVE, el: (R) => R.abtn, fx: 0.4 },
    { at: PAY, el: (R) => R.pbtn, fx: 0.5 },
  ],
  frame(t, R) {
    riseIn(R.bls, t, 0.05, { dy: 12 });
    R.rows.forEach((r, i) => riseIn(r, t, 0.15 + i * 0.05, { dy: 4, dur: 0.3 }));
    riseIn(R.inv, t, 0.15, { dy: 12 });
    R.lis.forEach((r, i) => riseIn(r, t, 0.3 + i * 0.05, { dy: 4, dur: 0.3 }));
    const s = t >= PAY + 0.08 ? 'sc' : t >= APPROVE + 0.08 ? 'ok' : 'na';
    R.first.dataset.s = s;
    R.abtn.classList.toggle('done', t >= APPROVE + 0.08);
    R.pbtn.classList.toggle('done', t >= PAY + 0.08);
    R.pay.style.setProperty('--on', ease.outCubic(seg(t, APPROVE + 0.1, 0.4)).toFixed(3));
    const press = (a) => seg(t, a - 0.06, 0.06) - seg(t, a + 0.04, 0.12);
    R.abtn.style.scale = 1 - press(APPROVE) * 0.05;
    R.pbtn.style.scale = 1 - press(PAY) * 0.05;
  },
};
