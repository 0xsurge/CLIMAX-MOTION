// node grab.mjs <url> <out-dir> <jobs.json> [--w=1440 --h=900 --scale=3]
// Saves real page elements as transparent PNGs so a film can animate the actual UI instead of redrawing it.
// jobs.json: [{ "name": "nav", "selector": "header.nav-desktop", "index": 0 }, { "name": "hero-img", "selector": "img.hero", "srcData": true }, { "name": "all-notes", "selector": "figure.testimonial", "all": true }]
//   - all: grab every match as <name>_<i>.png
//   - srcData: save the <img>'s own pixels (works for data: URIs and blob images)
// Ancestor backgrounds are hidden (visibility), the element keeps its own fill, and PNG corners are transparent.
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';
const [url, outArg, jobsPath, ...rest] = process.argv.slice(2);
if (!url || !outArg || !jobsPath) { console.error('usage: node grab.mjs <url> <out-dir> <jobs.json> [--w --h --scale]'); process.exit(1); }
const a = Object.fromEntries(rest.map(s => { const [k, v] = s.replace(/^--/, '').split('='); return [k, v]; }));
const out = resolve(outArg); mkdirSync(out, { recursive: true });
const jobs = JSON.parse(readFileSync(jobsPath, 'utf8'));
const { chromium } = await import('playwright');
let browser; try { browser = await chromium.launch(); } catch { browser = await chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium' }); }
const page = await browser.newPage({ viewport: { width: +(a.w || 1440), height: +(a.h || 900) }, deviceScaleFactor: +(a.scale || 3) });
await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(1200);
for (const label of ['Decline', 'Reject', 'Accept']) { const b = page.getByRole('button', { name: new RegExp('^' + label, 'i') }).first(); if (await b.count()) { try { await b.click({ timeout: 1500 }); break; } catch {} } }
await page.evaluate(async () => { const h = document.documentElement.scrollHeight; for (let y = 0; y < h; y += 400) { scrollTo(0, y); await new Promise(r => setTimeout(r, 90)); } scrollTo(0, 0); });
const results = [];
for (const job of jobs) {
  const loc = page.locator(job.selector); const n = await loc.count();
  const idxs = job.all ? [...Array(n).keys()] : [job.index || 0];
  for (const i of idxs) {
    const name = job.all ? `${job.name}_${i}` : job.name; const el = loc.nth(i);
    try {
      if (job.srcData) { const data = await el.evaluate(img => { const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight; c.getContext('2d').drawImage(img, 0, 0); return c.toDataURL('image/png'); }); writeFileSync(`${out}/${name}.png`, Buffer.from(data.split(',')[1], 'base64')); results.push(`${name}: pixels ${n}`); continue; }
      await el.scrollIntoViewIfNeeded(); await page.waitForTimeout(250);
      await el.evaluate(e => e.setAttribute('data-grab', '1'));
      const st = await page.addStyleTag({ content: 'html,body{background:transparent!important}body *{visibility:hidden!important}[data-grab],[data-grab] *{visibility:visible!important}' });
      const b = await el.boundingBox();
      await page.screenshot({ path: `${out}/${name}.png`, omitBackground: true, clip: { x: b.x, y: b.y, width: b.width, height: b.height }, animations: 'disabled' });
      await st.evaluate(s => s.remove()); await el.evaluate(e => e.removeAttribute('data-grab'));
      results.push(`${name}: ${Math.round(b.width)}x${Math.round(b.height)} css px`);
    } catch (e) { results.push(`${name}: FAILED ${String(e.message).split('\n')[0]}`); }
  }
  if (!n) results.push(`${job.name}: selector matched nothing`);
}
console.log(results.join('\n')); await browser.close();
