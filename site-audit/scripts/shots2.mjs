import { chromium } from 'playwright';
const SH = process.argv[2];
const b = await chromium.launch({ channel: 'chrome' });
async function go(url, w, h, name, fn) {
  const c = await b.newContext({ viewport: { width: w, height: h } }); const p = await c.newPage();
  await p.goto(url, { waitUntil: 'load' }); await p.waitForTimeout(2500);
  const r = fn ? await fn(p) : null;
  await p.screenshot({ path: `${SH}/${name}.png` }); await c.close(); return r;
}
const mark = sel => p => p.evaluate(sel => { const els = [...document.querySelectorAll(sel)]; els.forEach(e => { e.style.outline = '4px solid #ff2d55'; e.style.outlineOffset = '3px'; }); els[0]?.scrollIntoView({ block: 'center' }); return els.map(e => e.outerHTML.slice(0, 160)); }, sel);
console.log(await go('https://dishbooks.com/feature/smart-dashboard', 1440, 900, 'feature-hero-dead-ctas', mark('a[href="#"], a[href="/v2-contact"]')));
console.log(await go('https://dishbooks.com/compare/quickbooks', 1440, 900, 'compare-dead-cta', mark('a[href="#"]:not(.footer-link)')));
await go('https://dishbooks.com/feature/custom-reporting', 375, 812, 'overflow-custom-reporting-375', p => p.evaluate(() => { const e = document.querySelector('.f-compare-card-right'); e.scrollIntoView({ block: 'center' }); e.style.outline = '3px solid #ff2d55'; }));
await go('https://dishbooks.com/feature/invoice-bill-pay', 375, 812, 'overflow-invoice-bill-pay-375', p => p.evaluate(() => { const e = [...document.querySelectorAll('.flex-24')].find(e => e.getBoundingClientRect().right > 380); e?.scrollIntoView({ block: 'center' }); if (e) e.style.outline = '3px solid #ff2d55'; }));
await go('https://dishbooks.com/contact', 768, 1024, 'overflow-contact-768', p => p.evaluate(() => { const e = document.querySelector('.contact-card'); e.scrollIntoView({ block: 'center' }); e.style.outline = '3px solid #ff2d55'; }));
console.log(await go('https://dishbooks.com/', 1440, 900, 'footer-dead-legal-links', mark('a[href="#"]')));
await b.close();
