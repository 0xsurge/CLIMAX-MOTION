/**
 * Frame renderer — deterministic.
 *
 * Opens a scene, calls its seek(t) for every frame, screenshots each one, then
 * encodes with ffmpeg. Because seek(t) is a pure function of time, frames are
 * independent: the same scene always produces the same video.
 *
 *   node studio/render.mjs --scene circle-to-pill --fps 60 --duration 2 --size 1440
 *   node studio/render.mjs --scene circle-to-pill --frames-only
 *
 * Scenes are served over http://127.0.0.1 on an ephemeral port, not file://,
 * because browsers refuse ES-module imports from file:// (CORS) — a scene that
 * imports from ../lib would silently never initialise.
 */
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdir, rm, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// ── args: accepts both `--key=value` and `--key value` ────────────────────
const argv = (() => {
  const out = {};
  const raw = process.argv.slice(2);
  for (let i = 0; i < raw.length; i++) {
    const tok = raw[i];
    if (!tok.startsWith('--')) continue;
    const body = tok.slice(2);
    if (body.includes('=')) {
      const [k, ...rest] = body.split('=');
      out[k] = rest.join('=');
    } else {
      const next = raw[i + 1];
      if (next !== undefined && !next.startsWith('--')) { out[body] = next; i++; }
      else out[body] = true;
    }
  }
  return out;
})();

const SCENE = argv.scene || 'circle-to-pill';
const FPS = +(argv.fps || 60);
const SIZE = +(argv.size || 1440);
const W = +(argv.width || SIZE);
const H = +(argv.height || SIZE);
const FRAMES_DIR = path.join(ROOT, 'renders', `${SCENE}-frames`);
const OUT = path.join(ROOT, 'renders', `${SCENE}.mp4`);
const FFMPEG = '/usr/local/bin/ffmpeg';

// Playwright 1.63 refuses to install its bundled Chromium on macOS 12
// ("does not support chromium on mac12"), so drive the working system Chrome.
// Override with CHROME_PATH on another machine.
const CHROME =
  process.env.CHROME_PATH ||
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.woff2': 'font/woff2',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
};

const run = (cmd, args) =>
  new Promise((ok, bad) => {
    const p = spawn(cmd, args, { stdio: 'inherit' });
    p.on('close', (c) => (c ? bad(new Error(`${cmd} exited ${c}`)) : ok()));
  });

/** Static server rooted at studio/, so `../lib/x.mjs` and ../assets resolve. */
function serve(rootDir) {
  const server = http.createServer(async (req, res) => {
    try {
      const rel = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      const file = path.join(rootDir, rel);
      if (!file.startsWith(rootDir)) { res.writeHead(403).end(); return; }
      const body = await readFile(file);
      res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' });
      res.end(body);
    } catch {
      res.writeHead(404).end('not found');
    }
  });
  return new Promise((ok) =>
    server.listen(0, '127.0.0.1', () => ok({ server, port: server.address().port }))
  );
}

// ── render ────────────────────────────────────────────────────────────────
const scenePath = path.join(__dirname, 'scenes', `${SCENE}.html`);
if (!existsSync(scenePath)) throw new Error(`no scene at ${scenePath}`);

await rm(FRAMES_DIR, { recursive: true, force: true });
await mkdir(FRAMES_DIR, { recursive: true });

// serve the repo root so both studio/ and assets/ are reachable
const { server, port } = await serve(ROOT);
const url = `http://127.0.0.1:${port}/studio/scenes/${SCENE}.html`;

const t0 = Date.now();
const browser = await chromium.launch({ executablePath: CHROME });
const page = await browser.newPage({
  viewport: { width: W, height: H },
  deviceScaleFactor: 1,
});

const errors = [];
page.on('pageerror', (e) => errors.push(String(e.message)));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

await page.goto(url, { waitUntil: 'load', timeout: 0 });
try {
  await page.waitForFunction('window.__ready === true', { timeout: 30000 });
} catch (e) {
  console.error('scene never signalled __ready. page errors:');
  console.error(errors.length ? errors.join('\n') : '  (none captured)');
  await browser.close(); server.close();
  process.exit(1);
}
await page.evaluate(() => document.fonts.ready);

const DURATION = +(argv.duration || (await page.evaluate('window.__DURATION')) || 2);
const total = Math.round(DURATION * FPS);
process.stdout.write(`scene ${SCENE} · ${W}x${H} · ${FPS}fps · ${DURATION}s · ${total} frames\n`);

for (let i = 0; i < total; i++) {
  await page.evaluate((tt) => window.seek(tt), i / FPS);
  await page.screenshot({
    path: path.join(FRAMES_DIR, `f${String(i).padStart(5, '0')}.png`),
    animations: 'disabled',
  });
  if (i % 20 === 0 || i === total - 1) process.stdout.write(`  frame ${i + 1}/${total}\n`);
}
await browser.close();
server.close();
process.stdout.write(`captured ${total} frames in ${((Date.now() - t0) / 1000).toFixed(1)}s\n`);
if (errors.length) process.stdout.write(`note: ${errors.length} page error(s) during render\n`);

if (argv['frames-only']) {
  process.stdout.write(`frames → ${FRAMES_DIR}\n`);
  process.exit(0);
}

// ── encode ────────────────────────────────────────────────────────────────
await run(FFMPEG, [
  '-y', '-loglevel', 'error', '-stats',
  '-framerate', String(FPS),
  '-i', path.join(FRAMES_DIR, 'f%05d.png'),
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '16',
  '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
  OUT,
]);
process.stdout.write(`wrote ${OUT}\n`);
