# python3 find.py tpl 'regex' [tpl 'regex' ...] : first seed whose "topic ## stem" matches, with stem + solution
import sys, re
from playwright.sync_api import sync_playwright
a=sys.argv[1:]
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(); pg.route(re.compile(r'https://.*'), lambda r: r.abort())
    pg.goto('http://localhost:8777/practice.html'); pg.wait_for_timeout(1500)
    for k in range(0,len(a),2):
        print(a[k], pg.evaluate("""([t,rx])=>{const R=new RegExp(rx); for(let s=1000;s<1600;s++){let q; try{q=TEMPLATES[t](mulberry32(s));}catch(e){continue;} if(R.test(`${q.topic} ## ${q.stem}`)) return s+' '+q.stem.replace(/\\s+/g,' ').slice(-170)+' || '+String(q.solution).replace(/\\n/g,' / ')+(q.fr&&q.fr.display?' || ANS '+q.fr.display:'');} return 'NONE'}""",[a[k],a[k+1]])[:480])
    b.close()
