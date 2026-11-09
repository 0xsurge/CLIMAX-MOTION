#!/opt/chatterbox/bin/python
# Generate each voiceover line once with one model load. Default Chatterbox voice (female), warm and unhurried:
# exaggeration 0.55 for a little more expression, cfg 0.35 for slower, softer pacing. Seeded for repeatability.
import json, sys, torch, torchaudio as ta
from chatterbox.tts import ChatterboxTTS
m = ChatterboxTTS.from_pretrained(device='cpu')
for key, t0, text in json.load(open('vo_lines.json')):
    torch.manual_seed(7)
    wav = m.generate(text, exaggeration=0.55, cfg_weight=0.35)
    ta.save(f'vo/{key}.wav', wav, m.sr); print(key, round(wav.shape[-1] / m.sr, 2), text, flush=True)
