import json,re,torch,torchaudio,soundfile as sf,numpy as np
S='/tmp/claude-0/-home-claude/7f3602e2-2584-533b-a206-586fedb7a675/scratchpad'
FPS=30; fr=lambda x: round(round(x*FPS)/FPS,4)
LAYOUT=dict(logo=2.6,end=4.5); IT=json.load(open('edit/intro_timing.json'))['questions']
picks=json.load(open(S+'/picks-4min.json')); hook=json.load(open(S+'/hook.json'))
text=json.load(open('edit/captions_text.json'))
allp=[(('HOOK',)+tuple(hook[1:]),'HOOK')]+[(tuple(p),str(i)) for i,p in enumerate(picks)]
B=torchaudio.pipelines.MMS_FA;model=B.get_model().eval();tok=B.get_tokenizer();aligner=B.get_aligner()
D={'0':'zero','1':'one','2':'two','3':'three','4':'four','5':'five','6':'six','7':'seven','8':'eight','9':'nine'}
SPOKEN={'30':'thirty','1.0':'one point o','CSR,':'csr','pèlerinage,':'pelerinage'}
def clean(tok):
    t=SPOKEN.get(tok,tok).lower(); t=''.join(' '+D[c]+' ' if c in D else c for c in t)
    t=t.replace('è','e'); return re.sub(r"[^a-z]","",t)
_wav={}
def wav(c):
    if c not in _wav: _wav[c]=sf.read(f'{S}/sil/{c}.wav')[0]
    return _wav[c]
segs=[];words=[];sections=[];t=0.0
def place(kind,dur):
    global t; sections.append(dict(kind=kind,start=fr(t),end=fr(t+dur))); t=fr(t+dur)
curq=None
for (q,c,s,e),key in allp:
    if q!=curq:
        if curq=='HOOK': place('logo',LAYOUT['logo'])
        if q in ('Q1','Q2','Q3'): place('intro_'+q,IT[q]['out'])
        sections.append(dict(kind='answers_'+q,start=fr(t),end=None)); curq=q
    # tighten pauses using aligned whisper words
    W=[x for x in json.load(open(f'transcripts/STAGE_{c}/aligned.json')) if x['start']>=s-0.05 and x['end']<=e+0.05 and x['end']>x['start']]
    cuts=[s]
    for i in range(len(W)-1):
        if W[i+1]['start']-W[i]['end']>0.42: cuts+=[W[i]['end']+0.14,W[i+1]['start']-0.14]
    cuts.append(e)
    mine=[]
    for j in range(0,len(cuts),2):
        a,b=fr(cuts[j]),fr(cuts[j+1])
        if b-a<1/FPS: continue
        sg=dict(key=key,q=q,clip=c,src_in=a,src_out=b,t_in=fr(t),t_out=fr(t+b-a),jump=len(mine)>0); segs.append(sg); mine.append(sg); t=fr(t+b-a)
    # force-align corrected caption text to this pick's audio
    y=wav(c); sr=16000; a0=int(s*sr); clip=torch.tensor(y[a0:int(e*sr)],dtype=torch.float32)[None]
    disp=text[key].split(); al=[clean(x) for x in disp]
    keep=[i for i,x in enumerate(al) if x]
    with torch.inference_mode(): em,_=model(clip)
    ratio=clip.shape[1]/em.shape[1]/sr
    spans=aligner(em[0],tok([al[i] for i in keep]))
    for k,i in enumerate(keep):
        ws=s+spans[k][0].start*ratio; we=s+spans[k][-1].end*ratio
        # map source time -> film time through this pick's segments
        def m(x):
            for sg in mine:
                if sg['src_in']-0.02<=x<=sg['src_out']+0.02: return sg['t_in']+min(max(x,sg['src_in']),sg['src_out'])-sg['src_in']
            nxt=min((sg for sg in mine if sg['src_in']>x),key=lambda g:g['src_in'],default=mine[-1]); return nxt['t_in']
        words.append(dict(key=key,q=q,clip=c,text=disp[i],start=round(m(ws),3),end=round(m(we),3)))
# close sections
for i,sec in enumerate(sections):
    if sec['end'] is None:
        nxt=next((x['start'] for x in sections[i+1:]),None); sec['end']=nxt if nxt is not None else fr(t)
place('end',LAYOUT['end'])
json.dump(dict(fps=FPS,width=1080,height=1920,duration=fr(t),sections=sections,segments=segs,words=words),open('edit/edl.json','w'),indent=1)
print('film',fr(t),'s =',f"{int(t//60)}:{t%60:04.1f}",'| segments',len(segs),'| words',len(words))
for sec in sections: print(f"  {sec['kind']:12s} {sec['start']:7.2f} - {sec['end']:7.2f}")
