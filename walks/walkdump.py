# print the examples of the given geometry chapters: python3 walkdump.py 1 2
import re,json,sys
s=open('/home/claude/math-practice/practice.html').read()
PRE=sys.argv[1]; chs=set(sys.argv[2:]); seen=set()
def figdesc(f):
    if not f: return ''
    if f.get('kind')=='polys':
        out=[]
        for P in f['polys']:
            nm=''.join(n for n in (P.get('names') or []) if n)
            extra=[]
            for k in ('slab','alab'):
                v=[x for x in (P.get(k) or []) if x]
                if v: extra.append(k+'='+','.join(v))
            if any(P.get('right') or []): extra.append('right')
            out.append(nm+('('+';'.join(extra)+')' if extra else ''))
        return 'FIG polys: '+' | '.join(out)
    if f.get('kind')=='circ': return 'FIG circ points '+','.join(k for k in f.get('pts',{}) if not k.startswith('_'))+(' labels '+','.join(t.get('t','') for t in f.get('txt',[])) if f.get('txt') else '')
    if f.get('kind')=='grid': return 'FIG grid '+json.dumps(f.get('polys',[]))[:200]
    return 'FIG '+f.get('kind','?')
for m in re.finditer(r"^  '("+PRE+r"-([A-Za-z0-9]+)-[\w-]+)': (\{\"minutes\".*?)(,?)$", s, re.M):
    k,ch=m.group(1),m.group(2)
    if ch not in chs: continue
    d=json.loads(m.group(3))
    for st in d['steps']:
        for x in st.get('show',[]):
            f=x.get('fixed',{})
            if not x['label'].startswith('Example') or not f.get('stem') or f['stem'] in seen: continue
            seen.add(f['stem'])
            print(f"@@ {k} | {x['label']}\nSTEM: {f['stem']}\nANS: {f.get('display','')}\nSOL: {f.get('solution','')}\n{figdesc(f.get('figure'))}\n")
