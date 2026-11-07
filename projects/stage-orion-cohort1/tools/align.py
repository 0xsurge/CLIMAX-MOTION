import json,re,torch,torchaudio,soundfile as sf,numpy as np
S='.cache'  # local scratch dir for wav/intermediate files (gitignored)
B=torchaudio.pipelines.MMS_FA;model=B.get_model().eval();tok=B.get_tokenizer();aligner=B.get_aligner()
D={'0':'zero','1':'one','2':'two','3':'three','4':'four','5':'five','6':'six','7':'seven','8':'eight','9':'nine'}
def clean(s):
    s=s.lower().replace('%',' percent')
    s=''.join(' '+D[ch]+' ' if ch in D else ch for ch in s)
    return re.sub(r"[^a-z]","",s.replace(' ',''))
import sys
for c in sys.argv[1:]:
    w=json.load(open(f'transcripts/STAGE_{c}/transcript.json'))
    y,sr=sf.read(f'{S}/sil/{c}.wav');wav=torch.tensor(y,dtype=torch.float32)[None]
    N=sr*30;ems=[]
    with torch.inference_mode():
        for o in range(0,wav.shape[1],N): ems.append(model(wav[:,o:o+N])[0])
    em=torch.cat(ems,1)
    ratio=wav.shape[1]/em.shape[1]/sr
    idx=[i for i,x in enumerate(w) if clean(x['text'])]
    words=[clean(w[i]['text']) for i in idx]
    spans=aligner(em[0],tok(words))
    out=[dict(x) for x in w]
    for k,i in enumerate(idx):
        out[i]['start']=round(spans[k][0].start*ratio,3);out[i]['end']=round(spans[k][-1].end*ratio,3)
    for i,x in enumerate(out):
        if i not in idx: x['start']=x['end']=out[i-1]['end'] if i else 0
    json.dump(out,open(f'transcripts/STAGE_{c}/aligned.json','w'),indent=0)
    d=[abs(out[i]['end']-w[i]['end']) for i in idx];print(c,len(words),'median drift',round(float(np.median(d)),2),'max',round(max(d),2))
