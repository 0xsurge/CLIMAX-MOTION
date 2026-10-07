// node scaffold.mjs <film-dir> [--preset presets/blank]
// Creates a self-contained film folder: index.html, film.js, tokens.js, engine/lib/motion.js.
import { cpSync, mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url)), skill = resolve(here, '..');
const dir = resolve(process.argv[2] || 'videos/new');
const pi = process.argv.indexOf('--preset');
let presetDir = pi > 0 ? resolve(process.argv[pi + 1]) : join(skill, 'presets/blank');
if (!existsSync(join(presetDir, 'preset.jsonc'))) presetDir = join(skill, 'presets', process.argv[pi + 1] || 'blank');
const p = JSON.parse(readFileSync(join(presetDir, 'preset.jsonc'), 'utf8').replace(/^\s*\/\/.*$/gm, '').replace(/\s\/\/[^"\n]*$/gm, ''));
mkdirSync(join(dir, 'engine/lib'), { recursive: true });
for (const d of ['audio', 'assets', 'renders', 'docs', 'review']) mkdirSync(join(dir, d), { recursive: true });
cpSync(join(skill, 'engine/index.html'), join(dir, 'index.html'));
cpSync(join(skill, 'engine/lib/motion.js'), join(dir, 'engine/lib/motion.js'));
if (!existsSync(join(dir, 'film.js'))) cpSync(join(skill, 'templates/film.js'), join(dir, 'film.js'));
const tokens = { ...p.colors, bpm: p.bpm, hook: p.hook, promise: p.promise, proof: p.proof, cta: p.cta,
  displayFont: p.fonts.display, uiFont: p.fonts.ui, product: p.product };
writeFileSync(join(dir, 'tokens.js'), readFileSync(join(skill, 'templates/tokens.js'), 'utf8').replace('__TOKENS__', JSON.stringify(tokens, null, 2)));
writeFileSync(join(dir, 'preset.json'), JSON.stringify(p, null, 2));
console.log('scaffolded ' + dir);
