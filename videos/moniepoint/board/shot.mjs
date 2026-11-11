import { chromium } from 'playwright';
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 0.5 });
for (let i = 1; i <= 7; i++) { await p.goto('file://' + process.cwd() + '/beat.html?b=' + i); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300); await p.screenshot({ path: `b${i}.png` }); }
await b.close();
