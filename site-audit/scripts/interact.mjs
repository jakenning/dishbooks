// Read-only interaction checks: nav, mobile menu, dropdowns, tabs, accordions, forms (validity only), focus, no-JS.
import { chromium } from 'playwright';
import fs from 'node:fs';
const SH = process.argv[2]; const OUT = process.argv[3];
const b = await chromium.launch({ channel: 'chrome', headless: true });
const R = {};
const shot = (p, n, full = false) => p.screenshot({ path: `${SH}/${n}.png`, fullPage: full });

// 1. Mobile menu
{
  const c = await b.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
  const p = await c.newPage();
  await p.goto('https://dishbooks.com/', { waitUntil: 'load' }); await p.waitForTimeout(2500);
  await shot(p, 'home-375-firstview');
  R.heroOpacityAt2_5s = await p.evaluate(() => getComputedStyle(document.querySelector('h1')).opacity);
  await p.click('.w-nav-button'); await p.waitForTimeout(800);
  await shot(p, 'mobile-menu-open');
  R.mobileMenu = await p.evaluate(() => { const m = document.querySelector('.w-nav-overlay'); const btn = document.querySelector('.w-nav-button'); return { overlayVisible: m && getComputedStyle(m).display !== 'none', expanded: btn.getAttribute('aria-expanded'), bodyScrollLocked: getComputedStyle(document.body).overflow, links: [...document.querySelectorAll('.w-nav-overlay a')].filter(a => a.offsetParent).map(a => a.textContent.trim()).slice(0, 30) }; });
  // open first dropdown inside menu
  const dd = p.locator('.w-nav-overlay .w-dropdown-toggle').first();
  if (await dd.count()) { await dd.click(); await p.waitForTimeout(600); await shot(p, 'mobile-menu-features-open'); R.mobileDropdownLinks = await p.evaluate(() => [...document.querySelectorAll('.w-nav-overlay .w--open a, .w-nav-overlay .w-dropdown-list.w--open a')].map(a => a.textContent.trim()).slice(0, 20)); }
  await c.close();
}
// 2. Desktop dropdown + keyboard focus
{
  const c = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await c.newPage();
  await p.goto('https://dishbooks.com/', { waitUntil: 'load' }); await p.waitForTimeout(2000);
  await p.hover('.w-dropdown-toggle >> nth=0'); await p.waitForTimeout(700);
  await shot(p, 'desktop-features-dropdown');
  R.desktopDropdownHoverOpen = await p.evaluate(() => !!document.querySelector('.w-dropdown-list.w--open'));
  // keyboard focus ring check on first 12 tabbable elements
  await p.mouse.move(5, 890); await p.waitForTimeout(500);
  const foc = [];
  for (let i = 0; i < 14; i++) {
    await p.keyboard.press('Tab'); await p.waitForTimeout(120);
    foc.push(await p.evaluate(() => { const e = document.activeElement; const cs = getComputedStyle(e); return { el: `${e.tagName.toLowerCase()}.${[...e.classList].slice(0, 2).join('.')}`, text: (e.textContent || e.getAttribute('aria-label') || '').trim().slice(0, 30), outline: `${cs.outlineStyle} ${cs.outlineWidth}`, shadow: cs.boxShadow !== 'none' }; }));
    if (i === 3) await shot(p, 'desktop-keyboard-focus');
  }
  R.focusOrder = foc;
  // dropdown keyboard: focus Features toggle and press Enter
  await p.focus('.w-dropdown-toggle >> nth=0'); await p.keyboard.press('Enter'); await p.waitForTimeout(500);
  R.dropdownKeyboardOpens = await p.evaluate(() => !!document.querySelector('.w-dropdown-list.w--open'));
  // 3. Tabs on home
  const tabs = await p.$$('.w-tab-link');
  R.homeTabs = [];
  for (let i = 0; i < tabs.length; i++) {
    await tabs[i].scrollIntoViewIfNeeded(); await tabs[i].click(); await p.waitForTimeout(700);
    R.homeTabs.push(await p.evaluate(i => { const panes = [...document.querySelectorAll('.w-tab-pane')]; const act = document.querySelector('.w-tab-pane.w--tab-active'); const img = act?.querySelector('img, video, canvas, svg'); return { tab: document.querySelectorAll('.w-tab-link')[i].textContent.trim().slice(0, 40), activeIdx: panes.indexOf(act), role: document.querySelectorAll('.w-tab-link')[i].getAttribute('role'), media: img ? `${img.tagName} ${img.getBoundingClientRect().width | 0}x${img.getBoundingClientRect().height | 0}` : null }; }, i));
    if (i === 0) await shot(p, 'home-tabs-1440');
  }
  await c.close();
}
// 4. FAQ accordion + contact form validity (no submit) + pricing
{
  const c = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await c.newPage();
  await p.goto('https://dishbooks.com/faq', { waitUntil: 'load' }); await p.waitForTimeout(2000);
  R.faq = await p.evaluate(() => { const qs = [...document.querySelectorAll('[class*="faq"] [class*="question"], .w-dropdown-toggle, details summary, [class*="accordion"] [class*="trigger"], [class*="faq-item"]')].filter(e => e.offsetParent); return { candidates: qs.length, sample: qs.slice(0, 3).map(e => ({ cls: e.className, tag: e.tagName, role: e.getAttribute('role'), expanded: e.getAttribute('aria-expanded'), tabindex: e.tabIndex })), faqSchema: [...document.querySelectorAll('script[type="application/ld+json"]')].length }; });
  const q = p.locator('[class*="faq"] [class*="question"], [class*="faq-item"]').first();
  if (await q.count()) { const before = await p.evaluate(() => document.body.scrollHeight); await q.click(); await p.waitForTimeout(800); R.faqClickChangesHeight = (await p.evaluate(() => document.body.scrollHeight)) - before; await shot(p, 'faq-accordion-open'); }
  await p.goto('https://dishbooks.com/contact', { waitUntil: 'load' }); await p.waitForTimeout(2000);
  R.contactForm = await p.evaluate(() => { const f = document.querySelector('form'); if (!f) return null; return { valid: f.checkValidity(), invalidFields: [...f.elements].filter(e => e.willValidate && !e.checkValidity()).map(e => `${e.name}:${e.validationMessage}`), recaptcha: !!f.querySelector('.g-recaptcha, [data-sitekey]'), action: f.getAttribute('action'), method: f.method, hubspot: !!document.querySelector('.hs-form, [id^="hsForm"]'), selectFirst: f.querySelector('select')?.options[0]?.text, labels: [...f.querySelectorAll('input:not([type=hidden]):not([type=submit]),select,textarea')].map(i => ({ name: i.name, label: i.labels?.[0]?.textContent.trim() || null, aria: i.getAttribute('aria-label'), ph: i.placeholder, req: i.required, type: i.type })) }; });
  await p.evaluate(() => document.querySelector('form')?.scrollIntoView());
  await shot(p, 'contact-form-1440');
  await c.close();
}
// 5. No-JS render of home (what crawlers/without-JS see) + 404 page
{
  const c = await b.newContext({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false });
  const p = await c.newPage();
  await p.goto('https://dishbooks.com/', { waitUntil: 'load' }); await p.waitForTimeout(1500);
  await shot(p, 'home-nojs-1440');
  R.noJsH1Opacity = await p.evaluate(() => getComputedStyle(document.querySelector('h1')).opacity);
  await c.close();
  const c2 = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p2 = await c2.newPage();
  await p2.goto('https://dishbooks.com/nope-404-test', { waitUntil: 'load' }); await p2.waitForTimeout(1000);
  await shot(p2, '404-1440', true);
  R.page404 = await p2.evaluate(() => ({ links: [...document.querySelectorAll('a')].map(a => a.textContent.trim() + ' → ' + a.getAttribute('href')), nav: !!document.querySelector('.w-nav') }));
  await c2.close();
}
await b.close();
fs.writeFileSync(OUT, JSON.stringify(R, null, 1));
console.log(JSON.stringify(R, null, 1));
