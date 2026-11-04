#!/usr/bin/env python3
"""Generate one image with ComfyUI + SDXL Lightning (4 steps), headless on CPU, through ComfyUI's HTTP API.
   python3 comfy_generate.py "warm travertine plinth in a soft beige studio, no text" --out assets/plates/plinth.png [--seed 7] [--w 1024 --h 1024]
Starts ComfyUI on 127.0.0.1:8188 if it isn't running (and stops it again afterwards), queues the job, waits, saves the image.
Same prompt + seed + size gives the same image. Use generated images for sets, plates and textures only: never in place of the
brand's real products, logos or UI (CLAUDE.md). Install first: bash install_comfyui.sh"""
import argparse, json, subprocess, sys, time, urllib.request, urllib.parse

p = argparse.ArgumentParser(); p.add_argument('prompt'); p.add_argument('--out', required=True)
p.add_argument('--negative', default='text, watermark, logo, letters, blurry, lowres')
p.add_argument('--seed', type=int, default=7); p.add_argument('--w', type=int, default=1024); p.add_argument('--h', type=int, default=1024)
a = p.parse_args()
URL = 'http://127.0.0.1:8188'

def get(path):
    with urllib.request.urlopen(URL + path, timeout=10) as r: return r.read()
def up():
    try: get('/system_stats'); return True
    except Exception: return False

server = None
if not up():
    server = subprocess.Popen(['/opt/ComfyUI/.venv/bin/python', 'main.py', '--cpu', '--listen', '127.0.0.1', '--port', '8188', '--disable-auto-launch'],
                              cwd='/opt/ComfyUI', stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    for _ in range(240):
        if up(): break
        time.sleep(1)
    else: sys.exit('ComfyUI did not start')

# SDXL Lightning 4-step: Euler sampler, sgm_uniform schedule, CFG 1 (the settings ByteDance recommends for this checkpoint)
wf = {
  '1': {'class_type': 'CheckpointLoaderSimple', 'inputs': {'ckpt_name': 'sdxl_lightning_4step.safetensors'}},
  '2': {'class_type': 'CLIPTextEncode', 'inputs': {'text': a.prompt, 'clip': ['1', 1]}},
  '3': {'class_type': 'CLIPTextEncode', 'inputs': {'text': a.negative, 'clip': ['1', 1]}},
  '4': {'class_type': 'EmptyLatentImage', 'inputs': {'width': a.w, 'height': a.h, 'batch_size': 1}},
  '5': {'class_type': 'KSampler', 'inputs': {'model': ['1', 0], 'positive': ['2', 0], 'negative': ['3', 0], 'latent_image': ['4', 0],
        'seed': a.seed, 'steps': 4, 'cfg': 1.0, 'sampler_name': 'euler', 'scheduler': 'sgm_uniform', 'denoise': 1.0}},
  # tiled decode: a full 1024 px decode while the 9.8 GB model is loaded runs this 15 GB machine out of memory
  '6': {'class_type': 'VAEDecodeTiled', 'inputs': {'samples': ['5', 0], 'vae': ['1', 2], 'tile_size': 512, 'overlap': 64, 'temporal_size': 64, 'temporal_overlap': 8}},
  '7': {'class_type': 'SaveImage', 'inputs': {'images': ['6', 0], 'filename_prefix': 'climax'}}}
t0 = time.time()
req = urllib.request.Request(URL + '/prompt', data=json.dumps({'prompt': wf}).encode(), headers={'Content-Type': 'application/json'})
pid = json.loads(urllib.request.urlopen(req).read())['prompt_id']
while True:
    h = json.loads(get('/history/' + pid))
    if pid in h:
        st = h[pid].get('status', {})
        if st.get('status_str') == 'error': sys.exit('ComfyUI error: ' + json.dumps(st)[:500])
        imgs = [i for o in h[pid]['outputs'].values() for i in o.get('images', [])]
        if imgs: break
    time.sleep(1)
im = imgs[0]
data = get('/view?' + urllib.parse.urlencode({'filename': im['filename'], 'subfolder': im['subfolder'], 'type': im['type']}))
open(a.out, 'wb').write(data)
print(f'{a.out}: {a.w}x{a.h}, seed {a.seed}, {time.time() - t0:.0f} s')
if server: server.terminate()
