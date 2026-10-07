// render.mjs: drive <film>/index.html in headless Chromium, one window.seek(t) per frame.
//   node render.mjs <film-dir> --fmt=16x9 --fps=60 --dur=15 --sub=4 [--from=0 --to=5] --out=renders/16x9.mp4
//   node render.mjs <film-dir> --stills=0.5,1,2 --fmt=16x9 --out=review/s       PNG stills
//   node render.mjs <film-dir> --sheet=0,0.5,1 [--cols=3 --tw=480] --out=review/sheet.png   contact sheet
// Video is H.264 yuv420p, CRF 16, +faststart, silent. Audio is added by mix.py.
// Motion blur: --sub N seeks N times inside a 180-degree shutter and averages them (ffmpeg tmix).
import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const FORMATS = { '16x9': [1920, 1080], '1x1': [1080, 1080], '4x5': [1080, 1350], '9x16': [1080, 1920] };
const [dirArg, ...rest] = process.argv.slice(2);
const a = Object.fromEntries(rest.map(s => { const [k, v] = s.replace(/^--/, '').split('='); return [k, v ?? true]; }));
if (!dirArg) { console.error('usage: node render.mjs <film-dir> [--fmt --fps --dur --sub --from --to --out --stills --sheet]'); process.exit(1); }
const film = resolve(dirArg);
const fmt = a.fmt || '16x9'; const [W, H] = FORMATS[fmt] || fmt.split('x').map(Number);
const fps = +(a.fps || 60), sub = Math.max(1, +(a.sub || 1)), shutter = 0.5;
const from = +(a.from || 0), to = +(a.to || a.dur || 5);

const { chromium } = await import('playwright');
let browser;
try { browser = await chromium.launch(); }
catch { browser = await chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium' }); }
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
page.on('pageerror', e => { console.error('page error:', e.message); process.exitCode = 2; });
await page.goto(pathToFileURL(film + '/index.html').href + `?w=${W}&h=${H}`);
await page.waitForFunction('window.__ready === true', null, { timeout: 30000 });
const shot = async t => { await page.evaluate(t => window.seek(t), t); return page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: W, height: H } }); };
const ff = (args, input) => spawnSync('ffmpeg', ['-y', '-loglevel', 'error', ...args], { input, maxBuffer: 1 << 30 });

if (a.stills) {
  const out = resolve(a.out || film + '/review/still'); mkdirSync(dirname(out), { recursive: true });
  for (const t of a.stills.split(',').map(Number)) { writeFileSync(`${out}_${t.toFixed(2)}.png`, await shot(t)); console.log(`${out}_${t.toFixed(2)}.png`); }
} else if (a.sheet) {
  const ts = a.sheet.split(',').map(Number), cols = +(a.cols || 6), tw = +(a.tw || 480);
  const out = resolve(a.out || film + '/review/sheet.png'); mkdirSync(dirname(out), { recursive: true });
  const tmp = out.replace(/\.\w+$/, '') + '_tiles'; mkdirSync(tmp, { recursive: true });
  for (let i = 0; i < ts.length; i++) writeFileSync(`${tmp}/${String(i).padStart(4, '0')}.png`, await shot(ts[i]));
  const r = ff(['-framerate', '1', '-i', `${tmp}/%04d.png`, '-vf', `scale=${tw}:-2,tile=${cols}x${Math.ceil(ts.length / cols)}:padding=6:color=0x222222`, '-frames:v', '1', out]);
  if (r.status) { console.error(String(r.stderr)); process.exit(1); }
  console.log(out + `  (${ts.length} frames: ${ts.map(t => t.toFixed(2)).join(' ')})`);
} else {
  const out = resolve(a.out || film + `/renders/${fmt}.mp4`); mkdirSync(dirname(out), { recursive: true });
  const n = Math.round((to - from) * fps);
  const vf = sub > 1 ? `tmix=frames=${sub},select=eq(mod(n\\,${sub})\\,${sub - 1}),` : '';
  const enc = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-c:v', 'png', '-framerate', String(fps * sub), '-i', '-',
    '-vf', vf + 'format=yuv420p', '-c:v', 'libx264', '-crf', '16', '-preset', 'slow', '-r', String(fps), '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise(res => enc.on('close', res));
  const t0 = Date.now();
  for (let f = 0; f < n; f++) {
    for (let k = 0; k < sub; k++) {
      const t = Math.max(0, from + (f + (sub > 1 ? ((k + 0.5) / sub - 0.5) * shutter : 0)) / fps);
      if (!enc.stdin.write(await shot(t))) await new Promise(r => enc.stdin.once('drain', r));
    }
    if (f % 30 === 0) process.stderr.write(`\r${f}/${n} frames  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  enc.stdin.end(); const code = await done;
  console.log(`\n${out}  ${W}x${H} @${fps}fps  ${n} frames  sub=${sub}  exit ${code}`);
  if (code) process.exitCode = 1;
}
await browser.close();
