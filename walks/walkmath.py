# recompute every plain-number equality chain in the walkthrough lines ("a + b = c = d")
import json,re,math,sys
W=json.load(open('/home/claude/math-practice/walks/'+(sys.argv[1] if len(sys.argv)>1 and not sys.argv[1].startswith('-') else 'geometry')+'.json'))
def ev(t):
    t=t.strip()
    if not t or re.search(r'[a-zA-Zπ°%$]', t.replace('√','')): return None
    t=t.replace('−','-').replace('·','*').replace('×','*').replace('÷','/').replace('²','**2').replace('³','**3').replace(',','')
    t=re.sub(r'√\(', 'math.sqrt(', t); t=re.sub(r'√(\d+(\.\d+)?)', r'math.sqrt(\1)', t)
    t=re.sub(r'(\d)\(', r'\1*(', t); t=re.sub(r'\)\(', ')*(', t); t=re.sub(r'\)(\d)', r')*\1', t)
    t=t.replace('½','0.5*')
    try: return float(eval(t,{'math':math}))
    except Exception: return None
bad=0; n=0
for stem,steps in W.items():
    for line,_ in steps:
        body=re.sub(r'^[a-z]\.\s+','',line.split('   ')[0])
        body=body.split(':')[-1]
        parts=[p for p in re.split(r'=|≈', body)]
        approx='≈' in body
        vals=[ev(p) for p in parts]
        for a,b in zip(vals,vals[1:]):
            if a is None or b is None: continue
            n+=1
            tol=max(0.06*max(1,abs(b))*0.02, 0.051) if approx else 1e-6
            if abs(a-b)>tol and not (approx and abs(a-b)<=0.051*max(1,abs(b))/10+0.051):
                bad+=1; print('CHECK:', line, '|', a, b)
print('equalities checked:', n, 'flagged:', bad)
