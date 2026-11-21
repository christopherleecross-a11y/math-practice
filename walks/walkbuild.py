# build walks/geometry.json from walks/src/*.txt and report coverage
import re,json,glob,sys
PRE=sys.argv[1] if len(sys.argv)>1 and not sys.argv[1].startswith('-') else 'geo'
OUT={'geo':'geometry','alg1':'algebra1','alg2':'algebra2','precalc':'precalc'}[PRE]
s=open('/home/claude/math-practice/practice.html').read()
stems={}; allstems=set()
for m in re.finditer(r"^  '("+PRE+r"-[\w-]+)': (\{\"minutes\".*?)(,?)$", s, re.M):
    k=m.group(1); d=json.loads(m.group(2))
    for st in d['steps']:
        for x in st.get('show',[]):
            f=x.get('fixed',{})
            if x['label'].startswith('Example') and f.get('stem'):
                stems[(k,x['label'])]=f['stem']; allstems.add(f['stem'])
out={}; errs=[]
for fn in sorted(glob.glob('/home/claude/math-practice/walks/src/'+PRE+'-*.txt')):
    cur=None
    for ln in open(fn, encoding='utf8'):
        ln=ln.rstrip('\n')
        if not ln.strip(): continue
        if ln.startswith('@@'):
            k,lab=[t.strip() for t in ln[2:].split('|')]
            st=stems.get((k,lab))
            if not st: errs.append(f'{fn}: no example {k} {lab}'); cur=None; continue
            cur=out.setdefault(st,[])
            if cur: errs.append(f'{fn}: duplicate {k} {lab}')
            continue
        if cur is None: errs.append(f'{fn}: line outside an example: {ln[:60]}'); continue
        if '||' not in ln: errs.append(f'{fn}: no || in: {ln[:60]}'); continue
        a,b=ln.split('||',1); cur.append([a.strip(), b.strip()])
json.dump(out, open('/home/claude/math-practice/walks/'+OUT+'.json','w'), ensure_ascii=False, separators=(',',':'))
inline=set(re.findall(r"^  '((?:[^'\\]|\\.)*)': \[\n    \{ line:", s, re.M))
missing=[k for k,v in stems.items() if v not in out]
print('walkthroughs:',len(out),'of',len(allstems),'examples', '| errors:',len(errs))
for e in errs[:20]: print(' ',e)
if '-v' in sys.argv:
    print('still missing:', sorted({k for k,_ in missing}))
