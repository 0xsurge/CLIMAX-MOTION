# Interview cuts (locked v6 rough cut)

`picks-v6.json`: `[question, clip, in_seconds, out_seconds]` for every soundbite, in order.
Times refer to the constant-30fps conforms of the intern clips (`footage-cfr/`, kept local, not in git).

Rules used:
- Every intern answers Q1, Q2 and Q3.
- Each soundbite is a complete point: starts at the start of a thought, ends after the speaker lands it.
- Cuts sit in the pause after the last word, never touching the next word.

How it's built:
1. `tools/align.py`: force-aligns the Whisper transcript to the audio (torchaudio MMS_FA), because Whisper word times drift up to ~2.5s.
2. `tools/cut_picks.py`: finds each pick by its first/last words and snaps in/out points to the quietest point in the surrounding gap.
