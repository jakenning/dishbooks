import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'chrome' }); const c = await b.newContext({ viewport: { width: 1440, height: 700 } }); const p = await c.newPage();
await p.goto('https://dishbooks.com/pricing', { waitUntil: 'load' }); await p.waitForTimeout(2000);
await p.evaluate(() => { const els = [...document.querySelectorAll('a.credit-legal-link')]; els.forEach(e => { e.style.outline = '3px solid #ff2d55'; e.style.outlineOffset = '2px'; }); els[0].scrollIntoView({ block: 'end' }); window.scrollBy(0, 60); });
await p.screenshot({ path: process.argv[2] + '/footer-dead-legal-links.png' });
await p.goto('https://dishbooks.com/compare/quickbooks', { waitUntil: 'load' }); await p.waitForTimeout(2000);
await p.evaluate(() => { const e = document.querySelector('a.v2-button[href="#"]'); e.style.outline = '4px solid #ff2d55'; e.style.outlineOffset = '3px'; e.scrollIntoView({ block: 'center' }); });
await p.screenshot({ path: process.argv[2] + '/compare-dead-cta.png' });
await b.close();
