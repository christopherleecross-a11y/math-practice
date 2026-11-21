# python3 show.py tpl:seed ... : compact stem + solution
import sys, re
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(); pg.route(re.compile(r'https://.*'), lambda r: r.abort())
    pg.goto('http://localhost:8777/practice.html'); pg.wait_for_timeout(1500)
    for a in sys.argv[1:]:
        t,s=a.split(':')
        print(t,s,pg.evaluate("([t,s])=>{const q=TEMPLATES[t](mulberry32(+s)); return q.stem.replace(/\\s+/g,' ').slice(-180)+' || '+String(q.solution).replace(/\\n/g,' / ')+(q.fr&&q.fr.display?' || ANS '+q.fr.display:'')}",[t,s])[:520])
    b.close()
