#!/usr/bin/env python3
"""Transcribe speech with faster-whisper and write word timestamps for captions, cue timing or voiceover sync.
   python3 transcribe.py audio/vo.wav --out audio/vo_words.json [--model small] [--lang en]
Writes {"language", "duration", "segments": [{"start", "end", "text", "words": [{"word", "start", "end", "p"}]}]}.
Models download from Hugging Face on first use (tiny, base, small, medium, large-v3); int8 on CPU."""
import argparse, json
from faster_whisper import WhisperModel

p = argparse.ArgumentParser(); p.add_argument('audio'); p.add_argument('--out', required=True)
p.add_argument('--model', default='small'); p.add_argument('--lang', default=None)
a = p.parse_args()
m = WhisperModel(a.model, device='cpu', compute_type='int8')
segs, info = m.transcribe(a.audio, language=a.lang, word_timestamps=True, vad_filter=True)
out = {'language': info.language, 'duration': round(info.duration, 3), 'segments': [
    {'start': round(s.start, 3), 'end': round(s.end, 3), 'text': s.text.strip(),
     'words': [{'word': w.word.strip(), 'start': round(w.start, 3), 'end': round(w.end, 3), 'p': round(w.probability, 3)} for w in s.words]}
    for s in segs]}
json.dump(out, open(a.out, 'w'), indent=1)
print(f"{a.out}: {info.language}, {len(out['segments'])} segments, {sum(len(s['words']) for s in out['segments'])} words")
