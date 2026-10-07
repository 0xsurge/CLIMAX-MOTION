// node capture.mjs <url> <out-dir> [--w=1440 --h=900]
// Visits a site in Chromium and saves what a film needs: viewport + full-page screenshots, per-section crops,
// the logo/favicon/images, computed colors and fonts, :root variables, and the real copy. Nothing is redrawn later.
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const [url, outArg, ...rest] = process.argv.slice(2);
if (!url || !outArg) { console.error('usage: node capture.mjs <url> <out-dir> [--w=1440 --h=900]'); process.exit(1); }
const a = Object.fromEntries(rest.map(s => { const [k, v] = s.replace(/^--/, '').split('='); return [k, v]; }));
const W = +(a.w || 1440), H = +(a.h || 900), out = resolve(outArg);
mkdirSync(out + '/shots', { recursive: true }); mkdirSync(out + '/img', { recursive: true });
const { chromium } = await import('playwright');
let browser; try { browser = await chromium.launch(); } catch { browser = await chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium' }); }
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
const failed = []; page.on('requestfailed', r => failed.push(r.url()));
// keep the real files the page loads (images, video, fonts) so the film uses the actual assets
mkdirSync(out + '/net', { recursive: true });
const netLog = []; const savedNames = new Set();
page.on('response', async r => {
  try {
    const ct = (r.headers()['content-type'] || '').split(';')[0], u = r.url();
    if (!/^(image|video|font)\//.test(ct) && !/\.(woff2?|ttf|otf|mp4|webm|mov|svg|png|jpe?g|webp|avif|gif)(\?|$)/i.test(u)) return;
    if (r.status() !== 200 && r.status() !== 206) return;
    const name = decodeURIComponent(u.split('?')[0].split('/').pop() || 'file').replace(/[^\w.\-]/g, '_');
    netLog.push({ url: u, type: ct, status: r.status(), name });
    if (/^video\//.test(ct) || r.status() === 206) return;   // videos are fetched whole below
    if (savedNames.has(name)) return; savedNames.add(name);
    writeFileSync(`${out}/net/${name}`, await r.body());
  } catch {}
});
await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(1500);
await page.getByRole('button', { name: /^(decline|reject|accept|got it|ok)/i }).first().waitFor({ timeout: 6000 }).catch(() => {});   // cookie banners often appear late
for (const label of ['Decline', 'Reject', 'Accept', 'Got it', 'OK']) { const b = page.getByRole('button', { name: new RegExp('^' + label, 'i') }).first(); if (await b.count()) { try { await b.click({ timeout: 1500 }); break; } catch {} } }
await page.waitForTimeout(600);
// scroll once so lazy content and scroll-triggered reveals render
const total = await page.evaluate(async () => { const h = document.documentElement.scrollHeight; for (let y = 0; y < h; y += 400) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); } window.scrollTo(0, 0); return document.documentElement.scrollHeight; });
await page.waitForTimeout(800);
const data = await page.evaluate(() => {
  const cs = (el, p) => getComputedStyle(el).getPropertyValue(p);
  const vis = el => { const r = el.getBoundingClientRect(), s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; };
  const txt = el => (el.innerText || '').trim().replace(/\s+/g, ' ');
  const rootVars = {}; for (const sheet of document.styleSheets) { try { for (const rule of sheet.cssRules) if (rule.selectorText === ':root' || rule.selectorText === ':root, :host') for (const p of rule.style) if (p.startsWith('--')) rootVars[p] = rule.style.getPropertyValue(p).trim(); } catch {} }
  const fontFaces = []; for (const f of document.fonts) fontFaces.push({ family: f.family, weight: f.weight, style: f.style, status: f.status });
  const fams = {}; document.querySelectorAll('body *').forEach(el => { if (!vis(el) || !txt(el)) return; const f = cs(el, 'font-family'); fams[f] = (fams[f] || 0) + 1; });
  const colors = {}; const bump = (c, k) => { if (!c || c === 'rgba(0, 0, 0, 0)' || c === 'transparent') return; colors[c] = colors[c] || { bg: 0, text: 0, border: 0 }; colors[c][k]++; };
  document.querySelectorAll('body, body *').forEach(el => { if (!vis(el)) return; bump(cs(el, 'background-color'), 'bg'); if (txt(el)) bump(cs(el, 'color'), 'text'); if (parseFloat(cs(el, 'border-top-width')) > 0) bump(cs(el, 'border-top-color'), 'border'); });
  const heads = [...document.querySelectorAll('h1,h2,h3,h4')].filter(vis).map(e => ({ tag: e.tagName, text: txt(e), font: cs(e, 'font-family'), size: cs(e, 'font-size'), weight: cs(e, 'font-weight'), color: cs(e, 'color') }));
  const buttons = [...document.querySelectorAll('a,button')].filter(vis).filter(e => /btn|button|cta/i.test(e.className) || e.tagName === 'BUTTON' || cs(e, 'background-color') !== 'rgba(0, 0, 0, 0)').slice(0, 20).map(e => ({ text: txt(e), bg: cs(e, 'background-color'), color: cs(e, 'color'), radius: cs(e, 'border-radius'), font: cs(e, 'font-family'), weight: cs(e, 'font-weight') }));
  const nav = [...document.querySelectorAll('nav a, header a')].filter(vis).map(e => ({ text: txt(e), href: e.getAttribute('href') }));
  const imgs = [...document.images].filter(vis).map(i => ({ src: i.currentSrc || i.src, alt: i.alt, w: i.naturalWidth, h: i.naturalHeight, box: i.getBoundingClientRect().toJSON() }));
  const svgs = [...document.querySelectorAll('header svg, nav svg, a svg')].filter(vis).slice(0, 6).map(s => ({ box: s.getBoundingClientRect().toJSON(), html: s.outerHTML.slice(0, 4000) }));
  const sections = [...document.querySelectorAll('section, main > div, header, footer')].filter(vis).map(e => { const r = e.getBoundingClientRect(); return { tag: e.tagName, id: e.id, cls: String(e.className).slice(0, 80), y: Math.round(r.top + scrollY), h: Math.round(r.height), text: txt(e).slice(0, 400), bg: cs(e, 'background-color') }; });
  const icon = document.querySelector('link[rel~="icon"]'); const meta = n => document.querySelector(`meta[name="${n}"],meta[property="${n}"]`)?.content;
  return { title: document.title, description: meta('description'), ogImage: meta('og:image'), favicon: icon && icon.href, themeColor: meta('theme-color'),
    body: { bg: cs(document.body, 'background-color'), color: cs(document.body, 'color'), font: cs(document.body, 'font-family') }, rootVars, fontFaces, fontFamilies: fams, colors, heads, buttons, nav, imgs, svgs, sections,
    bodyText: txt(document.body).slice(0, 6000) };
});
data.url = url; data.viewport = { w: W, h: H }; data.pageHeight = total; data.failedRequests = failed.slice(0, 20);
// screenshots: top viewport, one per viewport-height, plus full page
await page.screenshot({ path: out + '/shots/full.png', fullPage: true });
const n = Math.ceil(total / H);
for (let i = 0; i < n; i++) { await page.evaluate(y => window.scrollTo(0, y), i * H); await page.waitForTimeout(500); await page.screenshot({ path: `${out}/shots/view_${String(i).padStart(2, '0')}.png` }); }
await page.evaluate(() => window.scrollTo(0, 0));
// per-section crops
let k = 0; for (const s of data.sections.filter(s => s.h > 120).slice(0, 14)) { const el = (await page.$$('section, main > div, header, footer'))[0]; }
const els = await page.$$('section, header, footer'); for (const el of els) { const b = await el.boundingBox(); if (!b || b.height < 120) continue; try { await el.screenshot({ path: `${out}/shots/section_${String(k++).padStart(2, '0')}.png` }); } catch {} }
// download images the page uses (logo, hero art, favicon)
const seen = new Set(); let ii = 0; for (const src of [...data.imgs.map(i => i.src), data.favicon, data.ogImage].filter(Boolean)) { if (seen.has(src) || src.startsWith('data:')) continue; seen.add(src); try { const r = await page.request.get(src); if (r.ok()) { const ext = (src.split('?')[0].match(/\.(\w{2,4})$/) || [, 'bin'])[1]; writeFileSync(`${out}/img/${String(ii++).padStart(2, '0')}.${ext}`, await r.body()); } } catch {} }
const vids = await page.evaluate(() => [...document.querySelectorAll('video')].map(v => ({ src: v.currentSrc || v.src, poster: v.poster, w: v.videoWidth, h: v.videoHeight, dur: v.duration, box: v.getBoundingClientRect().toJSON(), srcs: [...v.querySelectorAll('source')].map(x => x.src) })));
data.videos = vids; data.network = netLog;
let vi = 0; for (const v of vids) for (const src of [v.src, ...v.srcs].filter(Boolean)) { if (seen.has(src)) continue; seen.add(src); try { const r = await page.request.get(src); if (r.ok()) { const ext = (src.split('?')[0].match(/\.(\w{2,4})$/) || [, 'mp4'])[1]; writeFileSync(`${out}/net/video_${vi++}.${ext}`, await r.body()); } } catch {} }
writeFileSync(out + '/capture.json', JSON.stringify(data, null, 2));
console.log(`${out}: ${netLog.length} media/font responses, ${vids.length} <video>; ${n} viewport shots, ${k} section crops, ${ii} images, full page ${total}px high; ${Object.keys(data.fontFamilies).length} font stacks, ${data.fontFaces.length} loaded faces`);
await browser.close();
