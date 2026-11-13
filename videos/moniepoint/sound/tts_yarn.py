# Nigerian-English voiceover with YarnGPT2 (saheedniyi/YarnGPT2, Apache 2.0). Runs on CPU.
# usage: /opt/yarn/venv/bin/python tts_yarn.py <speaker> <out.wav> "<text>" [<speaker> <out.wav> "<text>" ...]
# male speakers: jude tayo umar osagie onye emma
import sys, importlib.util, torch, soundfile as sf
from transformers import AutoModelForCausalLM
spec = importlib.util.spec_from_file_location('yat', '/opt/yarn/repo/audiotokenizer.py'); yat = importlib.util.module_from_spec(spec); spec.loader.exec_module(yat)
at = yat.AudioTokenizerV2('saheedniyi/YarnGPT2', '/opt/yarn/wavtokenizer_large_speech_320_24k.ckpt', '/opt/yarn/wavtokenizer_mediumdata_frame75_3s_nq1_code4096_dim512_kmeans200_attn.yaml')
model = AutoModelForCausalLM.from_pretrained('saheedniyi/YarnGPT2', torch_dtype=torch.float32).to(at.device)
a = sys.argv[1:]
for spk, out, text in zip(a[0::3], a[1::3], a[2::3]):
    ids = at.tokenize_prompt(at.create_prompt(text, lang='english', speaker_name=spk))
    with torch.no_grad(): o = model.generate(input_ids=ids, temperature=.1, repetition_penalty=1.1, max_length=4000)
    audio = at.get_audio(at.get_codes(o)); sf.write(out, audio.float().cpu().numpy().reshape(-1), 24000); print(out, round(audio.shape[-1] / 24000, 2), flush=True)
