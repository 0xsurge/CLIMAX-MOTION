import json,re,subprocess,numpy as np,soundfile as sf
S='.cache'  # local scratch dir for wav/intermediate files (gitignored)
def norm(s): return re.sub(r"[^a-z0-9']","",s.lower())
_p={}
def pauses(c):
    if c in _p: return _p[c]
    wav=f'{S}/sil/{c}.wav'
    subprocess.run(['ffmpeg','-loglevel','error','-y','-i',f'footage-cfr/STAGE {c}.mp4','-ac','1','-ar','16000','-af','highpass=f=90,lowpass=f=4000',wav],check=True)
    y,sr=sf.read(wav);h=int(sr*0.02)
    rms=np.sqrt(np.convolve(y**2,np.ones(h)/h,'same')[::h]+1e-12);db=20*np.log10(rms)
    lo,hi=np.percentile(db,10),np.percentile(db,90);th=lo+0.30*(hi-lo)
    q=db<th;out=[];i=0
    while i<len(q):
        if q[i]:
            j=i
            while j<len(q) and q[j]: j+=1
            if (j-i)*0.02>=0.16: out.append((i*0.02,j*0.02))
            i=j
        else: i+=1
    _p[c]=out;return out
_e={}
def breath(c,a,b):
    if c not in _e:
        y,sr=sf.read(f'{S}/sil/{c}.wav');h=int(sr*0.02)
        _e[c]=np.sqrt(np.convolve(y**2,np.ones(h)/h,'same')[::h]+1e-12)
    r=_e[c];i0,i1=int(a/0.02),int(b/0.02)
    return (i0+int(np.argmin(r[i0:i1])))*0.02
_env={}
def env(c):
    if c not in _env:
        pauses(c)  # makes the wav
        y,sr=sf.read(f'{S}/sil/{c}.wav');h=int(sr*0.02)
        r=np.array([np.sqrt(np.mean(y[i:i+h]**2))+1e-9 for i in range(0,len(y)-h,h)]);db=20*np.log10(r)
        lo,hi=np.percentile(db,10),np.percentile(db,90)
        _env[c]=(db,lo+0.28*(hi-lo))
    return _env[c]
def quiet_runs(c,a,b,minlen=0.1):
    db,th=env(c);i0,i1=max(0,int(a/0.02)),min(len(db),int(b/0.02));runs=[];i=i0
    while i<i1:
        if db[i]<th:
            j=i
            while j<len(db) and db[j]<th: j+=1
            if (j-i)*0.02>=minlen: runs.append((i*0.02,j*0.02))
            i=j
        else: i+=1
    return runs
def find(c,a,b,after=0):
    w=json.load(open(f'transcripts/STAGE_{c}/aligned.json'));t=[norm(x['text']) for x in w]
    A=[norm(x) for x in a.split()];B=[norm(x) for x in b.split()]
    si=next(i for i in range(len(t)) if w[i]['start']>=after and t[i:i+len(A)]==A)
    ei=next(i for i in range(si,len(t)) if t[i:i+len(B)]==B)+len(B)-1
    ws,we=w[si]['start'],w[ei]['end']
    pe=w[si-1]['end'] if si>0 else max(0,ws-0.6)
    ns=w[ei+1]['start'] if ei+1<len(w) else we+1.0
    g=ns-we
    # OUT: quietest point in the gap after the last word, keeping a natural tail, never touching the next word
    lo=we+min(0.12,g*0.3); hi=min(ns-0.1, we+0.45)
    cout=breath(c,lo,hi)+0.02 if hi-lo>0.04 else we+g*0.5
    cout=max(cout,we+min(0.15,g*0.5)); cout=min(cout,ns-0.06)
    gi=ws-pe
    lo=max(pe+0.08,ws-0.4); hi=ws-0.04
    cin=breath(c,lo,hi) if hi-lo>0.04 else ws-gi*0.5
    flag=' [TIGHT]' if g<0.2 else ''
    txt=' '.join(x['text'] for x in w[si:ei+1]); nxt=' '.join(x['text'] for x in w[ei+1:ei+3])
    return round(max(0,cin),2),round(cout,2),f"{txt}{flag}  >>gap {g:.2f}s then: {nxt}"
picks=[
# Q1 experience
("Q1","03","It was an incredibly","fun experience."),
("Q1","01","experience with Stage","importance of teamwork."),
("Q1","05","Honestly, it was","eye-opening."),
("Q1","05","At some point, I","support team."),
("Q1","07","I'll describe my","so thank you Stage Run."),
("Q1","04","my experience is","dealing with customers."),
("Q1","12","I've explained my","not just theory."),
("Q1","02","So, my experience","I learned during this internship."),
("Q1","08","I would describe my","the right solution."),
("Q1","09","my experience with","so much knowledge"),
("Q1","06","The internship was","Thank you."),
("Q1","10","It was fun field,","with people."),
# Q2 lesson
("Q2","07","And I would say","amazing experience."),
("Q2","03","The most important thing","completely satisfied."),
("Q2","12","And my biggest lesson","most of the problems."),
("Q2","02","Of course, customer","career changer."),
("Q2","05","It has to be","being provided."),
("Q2","04","the most important thing","when it comes to communication"),
("Q2","09","effective communication tolerance","underlying factors"),
("Q2","06","during the course of","an angry customer."),
("Q2","10","The highlight was","deep down into CRM."),
("Q2","01","The most important thing","learning and improving."),
("Q2","08","So the most important","and policy."),
# Q3 challenge / funny
("Q3","03","To be honest, my","internally too."),
("Q3","02","So, to be honest,","is network."),
("Q3","02","Sometimes you connect","very bad."),
("Q3","09","my biggest funniest","so hard"),
("Q3","04","for the most challenging","really challenging"),
("Q3","06","The fun part","and everything."),
("Q3","05","Honestly, it has","problem to all."),
("Q3","01","My biggest challenge","in any project."),
("Q3","07","my funniest and","so thank you."),
("Q3","08","Now honestly, one","support processes."),
("Q3","10","We also had our","in any family."),
("Q3","12","If I don't forget","the best."),
# closer
("END","12","And the CEO","carry everybody along."),
]
res=[]
for q,c,a,b in picks:
    try: s,e,txt=find(c,a,b)
    except StopIteration: print('MISS',q,c,a,'|',b); continue
    res.append([q,c,s,e]);print(f"{q} {c} {s:7.2f}-{e:7.2f} ({e-s:4.1f}s) | {txt}")
json.dump(res,open(S+'/picks-v8.json','w'));print('TOTAL',round(sum(o[3]-o[2] for o in res),1))
