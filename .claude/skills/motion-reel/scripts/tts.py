#!/opt/chatterbox/bin/python
"""Voiceover with Chatterbox TTS (CPU). Every file it writes carries Resemble AI's inaudible Perth watermark.
   /opt/chatterbox/bin/python tts.py "One order. Every step handled." --out audio/vo.wav [--exaggeration 0.45] [--cfg 0.5] [--voice ref.wav]
--voice clones the voice in a short reference clip: use only your own voice or one you have the speaker's permission to use.
Then time the cuts to the words: python3 transcribe.py audio/vo.wav --out audio/vo_words.json"""
import argparse, torchaudio as ta
from chatterbox.tts import ChatterboxTTS

p = argparse.ArgumentParser(); p.add_argument('text'); p.add_argument('--out', required=True)
p.add_argument('--exaggeration', type=float, default=0.45); p.add_argument('--cfg', type=float, default=0.5); p.add_argument('--voice')
a = p.parse_args()
m = ChatterboxTTS.from_pretrained(device='cpu')
wav = m.generate(a.text, audio_prompt_path=a.voice, exaggeration=a.exaggeration, cfg_weight=a.cfg)
ta.save(a.out, wav, m.sr); print(f'{a.out}: {wav.shape[-1] / m.sr:.2f} s at {m.sr} Hz')
