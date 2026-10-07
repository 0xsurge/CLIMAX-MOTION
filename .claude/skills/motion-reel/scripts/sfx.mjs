// node sfx.mjs cues.json [--dur 16] [--out audio/sfx.wav]
// Synthesizes UI sounds from cues.json: [{ "t": 1.0, "type": "click|pop|thump|whoosh", "vol": 0.5, "pitch": 1 }, ...]
// No samples, nothing to license. Soft-clips so a busy mix never clips the bed.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
const [cuesPath, ...rest] = process.argv.slice(2);
const a = Object.fromEntries(rest.map((s, i, r) => s.startsWith('--') ? [s.slice(2), r[i + 1]] : []).filter(x => x.length));
const SR = 44100, dur = +(a.dur || 16), out = a.out || 'audio/sfx.wav';
const cues = JSON.parse(readFileSync(cuesPath, 'utf8')), buf = new Float32Array(Math.ceil(dur * SR));
let seed = 1; const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;   // seeded noise
const lp = (x, c) => { let y = 0; return x.map(v => (y += c * (v - y))); };
const voices = {
  click: (p) => Array.from({ length: SR * 0.05 | 0 }, (_, i) => { const t = i / SR; return (Math.sin(2 * Math.PI * 2400 * p * t) * 0.5 + rnd() * 0.5) * Math.exp(-t * 140); }),
  pop: (p) => Array.from({ length: SR * 0.14 | 0 }, (_, i) => { const t = i / SR; return Math.sin(2 * Math.PI * (520 * p * Math.exp(-t * 18) + 180) * t) * Math.exp(-t * 28); }),
  thump: (p) => { let ph = 0; return Array.from({ length: SR * 0.45 | 0 }, (_, i) => { const t = i / SR; ph += 2 * Math.PI * (48 * p + 90 * Math.exp(-t * 20)) / SR; return Math.sin(ph) * Math.exp(-t * 7); }); },
  whoosh: (p) => { const n = SR * 0.4 | 0, x = Array.from({ length: n }, () => rnd()); const lo = lp(x, 0.08), hi = lp(x, 0.4);
    return x.map((_, i) => { const t = i / n, env = Math.sin(Math.PI * Math.pow(t, 0.6)); return (lo[i] * (1 - t) + (hi[i] - lo[i]) * t) * env * 1.6; }); },
};
for (const c of cues) {
  const v = voices[c.type]; if (!v) { console.error('unknown cue type', c.type); process.exit(1); }
  const x = v(c.pitch || 1), off = Math.round(c.t * SR), g = c.vol ?? 0.5;
  for (let i = 0; i < x.length && off + i < buf.length; i++) buf[off + i] += x[i] * g;
}
const pcm = Buffer.alloc(buf.length * 2);
for (let i = 0; i < buf.length; i++) pcm.writeInt16LE(Math.round(Math.tanh(buf[i]) * 32767), i * 2);
const h = Buffer.alloc(44); h.write('RIFF', 0); h.writeUInt32LE(36 + pcm.length, 4); h.write('WAVEfmt ', 8); h.writeUInt32LE(16, 16);
h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22); h.writeUInt32LE(SR, 24); h.writeUInt32LE(SR * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34);
h.write('data', 36); h.writeUInt32LE(pcm.length, 40);
mkdirSync(dirname(out), { recursive: true }); writeFileSync(out, Buffer.concat([h, pcm]));
console.log(`${out}  ${cues.length} cues  ${dur}s`);
