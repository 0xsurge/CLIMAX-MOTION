// node shoot.mjs open glass stage wall -> review/still_<name>.png (1080x1920)
import { pathToFileURL } from 'node:url'; import { resolve } from 'node:path'; import { mkdirSync } from 'node:fs';
const { chromium } = await import('/home/user/CLIMAX-MOTION/node_modules/playwright/index.mjs');
let b; try { b = await chromium.launch(); } catch { b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }); }
mkdirSync('review', { recursive: true });
const page = await b.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
page.on('pageerror', e => console.error('page error:', e.message));
for (const s of process.argv.slice(2)) {
  await page.goto(pathToFileURL(resolve('stills.html')).href + '?s=' + s); await page.waitForFunction('window.__ready===true', null, { timeout: 60000 }); await page.waitForTimeout(400);
  await page.screenshot({ path: `review/still_${s}.png` }); console.log('review/still_' + s + '.png');
}
await b.close();
