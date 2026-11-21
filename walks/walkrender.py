# render every walkthrough line with the site's text drawer; report errors and save a sample sheet
from playwright.sync_api import sync_playwright
import re,json,sys
W=json.load(open('/home/claude/math-practice/walks/'+(sys.argv[1] if len(sys.argv)>1 and not sys.argv[1].startswith('-') and not ' ' in sys.argv[1] and sys.argv[1].isalnum() else 'geometry')+'.json'))
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':900,'height':800})
    pg.route(re.compile(r'https://.*'), lambda r: r.abort())
    pg.goto('http://localhost:8777/practice.html'); pg.wait_for_timeout(2500)
    bad=pg.evaluate("""(W)=>{ const out=[]; for (const [k,steps] of Object.entries(W)) for (const [l] of steps) { try { const c=textCanvas(l, 700, '19px "Times New Roman", Times, serif', 28); if(!c||!c.width) out.push(l); } catch(e){ out.push(l+' :: '+e); } } return out; }""", W)
    print('render errors:', len(bad)); [print(' ',x) for x in bad[:10]]
    if len(sys.argv)>1:
        lines=sys.argv[1:]
        pg.evaluate("(L)=>{ document.body.innerHTML=''; L.forEach(l=>{ const c=textCanvas(l, 700, '22px \"Times New Roman\", Times, serif', 34); c.style.display='block'; c.style.border='1px solid #ddd'; document.body.append(c); }); }", lines)
        pg.screenshot(path='/tmp/claude-0/-home-claude/d8f1b11a-4e57-5a8f-938d-9d1053124102/scratchpad/sh/lines.png', full_page=True)
    b.close()
