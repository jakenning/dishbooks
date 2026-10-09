// Read-only crawl of dishbooks.com: SEO tags, headings, images, links, errors, axe, overflow.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const axeSrc = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

const OUT = process.argv[2];
const urls = fs.readFileSync(process.argv[3], 'utf8').trim().split('\n');
const SHOTS = path.join(OUT, '..', 'screenshots');
const shotPages = new Set(['/', '/why-dishbooks', '/pricing', '/feature/smart-dashboard', '/who-we-serve/independent-restaurants', '/blog', '/blog/how-to-read-a-restaurant-pl-line-by-line', '/contact', '/faq', '/compare/quickbooks', '/nope-404-test']);
const WIDTHS = [375, 768, 1024, 1440, 1920];

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results = [];
for (const url of urls) {
  const pth = new URL(url).pathname.replace(/\/$/, '') || '/';
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const r = { url, path: pth, console: [], pageErrors: [], failed: [], badStatus: [], insecure: [], requests: 0 };
  page.on('console', m => { if (['error', 'warning'].includes(m.type())) r.console.push(`${m.type()}: ${m.text().slice(0, 300)}`); });
  page.on('pageerror', e => r.pageErrors.push(String(e).slice(0, 300)));
  page.on('requestfailed', q => r.failed.push(`${q.failure()?.errorText} ${q.url().slice(0, 200)}`));
  page.on('request', q => { r.requests++; if (q.url().startsWith('http://')) r.insecure.push(q.url()); });
  page.on('response', s => { if (s.status() >= 400) r.badStatus.push(`${s.status()} ${s.url().slice(0, 200)}`); });
  let resp;
  try { resp = await page.goto(url, { waitUntil: 'load', timeout: 60000 }); } catch (e) { r.error = String(e); results.push(r); await ctx.close(); continue; }
  r.status = resp.status();
  // scroll to trigger lazy content
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise(res => setTimeout(res, 120)); } window.scrollTo(0, 0); });
  await page.waitForTimeout(1500);
  Object.assign(r, await page.evaluate(() => {
    const q = s => document.querySelector(s);
    const meta = n => q(`meta[name="${n}"]`)?.content ?? q(`meta[property="${n}"]`)?.content ?? null;
    const heads = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].filter(h => h.offsetParent !== null || getComputedStyle(h).position === 'fixed')
      .map(h => ({ l: +h.tagName[1], t: h.textContent.trim().replace(/\s+/g, ' ').slice(0, 90) }));
    const allH1 = [...document.querySelectorAll('h1')].map(h => ({ t: h.textContent.trim().replace(/\s+/g, ' ').slice(0, 90), visible: h.offsetParent !== null }));
    const skips = []; let prev = 0; for (const h of heads) { if (prev && h.l > prev + 1) skips.push(`h${prev}→h${h.l} "${h.t.slice(0, 40)}"`); prev = h.l; }
    const imgs = [...document.images].map(i => ({ src: (i.currentSrc || i.src).slice(0, 220), alt: i.getAttribute('alt'), loading: i.getAttribute('loading'), nw: i.naturalWidth, nh: i.naturalHeight, w: i.clientWidth, h: i.clientHeight, srcset: !!i.getAttribute('srcset'), top: Math.round(i.getBoundingClientRect().top + scrollY) }));
    const links = [...document.querySelectorAll('a')].map(a => ({ href: a.getAttribute('href'), abs: a.href, text: (a.textContent.trim() || a.getAttribute('aria-label') || a.querySelector('img')?.alt || '').replace(/\s+/g, ' ').slice(0, 60), target: a.target, rel: a.rel, vis: a.offsetParent !== null }));
    const ids = [...document.querySelectorAll('[id]')].map(e => e.id);
    const ld = [...document.querySelectorAll('script[type="application/ld+json"]')].map(s => { try { const j = JSON.parse(s.textContent); return [].concat(j['@graph'] || j).map(x => x['@type']).flat(); } catch { return ['INVALID JSON']; } }).flat();
    const res = performance.getEntriesByType('resource');
    const nav = performance.getEntriesByType('navigation')[0];
    const bytes = res.reduce((a, e) => a + (e.transferSize || 0), 0) + (nav?.transferSize || 0);
    const videos = [...document.querySelectorAll('video')].map(v => ({ src: (v.currentSrc || v.querySelector('source')?.src || '').slice(0, 200), autoplay: v.autoplay, preload: v.preload, poster: !!v.poster }));
    const iframes = [...document.querySelectorAll('iframe')].map(f => f.src.slice(0, 150));
    const forms = [...document.querySelectorAll('form')].map(f => ({ id: f.id, name: f.getAttribute('name') || f.dataset.name, action: f.action, fields: [...f.querySelectorAll('input,select,textarea')].filter(i => i.type !== 'hidden' && i.type !== 'submit').map(i => ({ type: i.type, name: i.name, required: i.required, label: !!(i.labels?.length || i.getAttribute('aria-label') || i.getAttribute('aria-labelledby')), placeholder: i.placeholder })) }));
    return {
      title: document.title, desc: meta('description'), canonical: q('link[rel="canonical"]')?.href ?? null, robots: meta('robots'),
      og: { title: meta('og:title'), desc: meta('og:description'), image: meta('og:image'), type: meta('og:type'), url: meta('og:url') },
      tw: { card: meta('twitter:card'), title: meta('twitter:title'), image: meta('twitter:image') },
      lang: document.documentElement.lang, h1: allH1, heads, skips, imgs, links, ids, ld, bytes, resCount: res.length, videos, iframes, forms,
      landmarks: { main: document.querySelectorAll('main,[role=main]').length, nav: document.querySelectorAll('nav,[role=navigation]').length, header: document.querySelectorAll('header,[role=banner]').length, footer: document.querySelectorAll('footer,[role=contentinfo]').length },
      skipLink: !![...document.querySelectorAll('a[href^="#"]')].slice(0, 3).find(a => /skip/i.test(a.textContent)),
      words: document.body.innerText.split(/\s+/).length,
      fontsLoaded: [...document.fonts].filter(f => f.status === 'loaded').map(f => `${f.family.replace(/"/g, '')} ${f.weight}${f.style === 'italic' ? 'i' : ''}`),
      fontsUsed: [...new Set([...document.querySelectorAll('body *')].filter(e => e.childNodes.length && [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())).map(e => { const cs = getComputedStyle(e); return `${cs.fontFamily.split(',')[0].replace(/"/g, '')} ${cs.fontWeight}`; }))],
      dexChat: [...document.querySelectorAll('[data-dex-chat]')].map(e => e.querySelectorAll(':scope > svg').length),
      lottie: document.querySelectorAll('[data-lottie]').length, animate: document.querySelectorAll('[data-animate]').length,
      unicorn: document.querySelectorAll('[data-us-project]').length,
    };
  }));
  // axe
  await page.addScriptTag({ content: axeSrc });
  r.axe = await page.evaluate(async () => {
    const res = await axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'] });
    return res.violations.map(v => ({ id: v.id, impact: v.impact, help: v.help, n: v.nodes.length, ex: v.nodes.slice(0, 4).map(n => ({ t: n.target.join(' ').slice(0, 120), s: (n.failureSummary || '').split('\n').slice(1, 2).join(' ').slice(0, 160) })) }));
  });
  if (shotPages.has(pth)) await page.screenshot({ path: path.join(SHOTS, `${pth.replace(/\//g, '_') || 'home'}-1440.png`), fullPage: true }).catch(() => {});
  // overflow per width
  r.overflow = {};
  for (const w of WIDTHS) {
    await page.setViewportSize({ width: w, height: 900 });
    await page.waitForTimeout(500);
    r.overflow[w] = await page.evaluate(() => {
      const de = document.documentElement; const vw = de.clientWidth;
      const over = de.scrollWidth - vw;
      const off = [];
      if (over > 0) for (const el of document.querySelectorAll('body *')) { const b = el.getBoundingClientRect(); if (b.right > vw + 2 && b.width > 0 && getComputedStyle(el).position !== 'fixed') { off.push(`${el.tagName.toLowerCase()}.${[...el.classList].join('.')} r=${Math.round(b.right)}`); if (off.length > 6) break; } }
      return { over, off };
    });
    if (shotPages.has(pth) && w === 375) await page.screenshot({ path: path.join(SHOTS, `${pth.replace(/\//g, '_') || 'home'}-375.png`), fullPage: true }).catch(() => {});
  }
  results.push(r);
  console.log(`${r.status} ${pth} req=${r.requests} kb=${Math.round(r.bytes / 1024)} axe=${r.axe.length} cons=${r.console.length} ovf375=${r.overflow[375].over}`);
  await ctx.close();
}
await browser.close();
fs.writeFileSync(path.join(OUT, 'crawl.json'), JSON.stringify(results, null, 1));
