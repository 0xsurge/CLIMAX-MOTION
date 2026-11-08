import json,subprocess,os,numpy as np,soundfile as sf
E=json.load(open('edit/edl.json')); FPS=30; W,H=1080,1920; C='.cache/plate'
# ---- video plate: one segment file per piece + black fillers, then concat
def run(a): subprocess.run(['ffmpeg','-loglevel','error','-y']+a,check=True)
items=[]; t=0.0
def black(d,i):
    o=f'{C}/b{i:03d}.mp4'; run(['-f','lavfi','-i',f'color=c=0x01042A:s={W}x{H}:r={FPS}','-t',f'{d:.4f}','-c:v','libx264','-preset','veryfast','-crf','14','-pix_fmt','yuv420p',o]); return o
for i,sg in enumerate(E['segments']):
    if sg['t_in']-t>1e-3: items.append(black(sg['t_in']-t,i))
    o=f'{C}/s{i:03d}.mp4'
    HQ=json.load(open('edit/hq_index.json')) if os.path.exists('edit/hq_index.json') else []
    pc=[h for h in HQ if h['clip']==sg['clip'] and h['start']-0.01<=sg['src_in'] and sg['src_out']<=h['start']+h['dur']+0.01]
    if pc: src=pc[0]['file']; seek=sg['src_in']-pc[0]['start']
    else: src=f"footage-cfr/STAGE {sg['clip']}.mp4"; seek=sg['src_in']; print('proxy fallback',i,sg['clip'],sg['src_in'])
    d=sg['t_out']-sg['t_in']
    run(['-ss',f"{max(0,seek):.4f}",'-i',src,'-an','-vf',f'scale={W}:{H}:force_original_aspect_ratio=increase:flags=lanczos,crop={W}:{H},setsar=1,fps={FPS},tpad=stop_mode=clone:stop_duration=1',
         '-frames:v',str(round(d*FPS)),'-r',str(FPS),'-c:v','libx264','-preset','veryfast','-crf','14','-pix_fmt','yuv420p','-g',str(FPS),o])
    nf=int(subprocess.run(['ffprobe','-v','error','-count_frames','-select_streams','v:0','-show_entries','stream=nb_read_frames','-of','csv=p=0',o],capture_output=True,text=True).stdout.strip())
    if nf!=round(d*FPS): print('FRAME MISMATCH',i,sg['clip'],nf,round(d*FPS))
    items.append(o); t=sg['t_out']
if E['duration']-t>1e-3: items.append(black(E['duration']-t,999))
open(f'{C}/list.txt','w').write(''.join(f"file '{os.path.abspath(x)}'\n" for x in items))
run(['-f','concat','-safe','0','-i',f'{C}/list.txt','-c','copy','hf/assets/media/plate.mp4'])
# ---- dialogue track on the film timeline
SR=48000; out=np.zeros((int(E['duration']*SR)+SR,2)); cache={}
def aud(c):
    if c not in cache:
        w=f'{C}/a{c}.wav'; run(['-i',f'footage-cfr/STAGE {c}.mp4','-vn','-ac','2','-ar',str(SR),'-af','highpass=f=70',w]); cache[c]=sf.read(w)[0]
    return cache[c]
gains={}
for key in dict.fromkeys(s['key'] for s in E['segments']):
    sg=[s for s in E['segments'] if s['key']==key]; y=aud(sg[0]['clip'])
    x=np.concatenate([y[int(s['src_in']*SR):int(s['src_out']*SR)] for s in sg]).mean(1)
    f=np.sqrt(np.convolve(x**2,np.ones(960)/960,'valid')[::480]); act=f[f>np.percentile(f,60)]
    gains[key]=10**((-19-20*np.log10(np.sqrt(np.mean(act**2))+1e-9))/20)
for s in E['segments']:
    y=aud(s['clip'])[int(s['src_in']*SR):int(s['src_out']*SR)].copy()*gains[s['key']]; n=len(y); r=min(int(0.012*SR),n//2)
    y[:r]*=np.linspace(0,1,r)[:,None]; y[-r:]*=np.linspace(1,0,r)[:,None]
    a=int(round(s['t_in']*SR)); out[a:a+n]+=y
out=out[:int(E['duration']*SR)]; pk=np.max(np.abs(out)); lim=10**(-1.5/20)
if pk>lim: out=np.tanh(out/lim*0.9)*lim  # soft limit any hot peaks
sf.write('hf/assets/media/dialogue.wav',out,SR,subtype='PCM_24')
print('pieces',len(items),'peak dB',round(20*np.log10(np.max(np.abs(out))),1))
