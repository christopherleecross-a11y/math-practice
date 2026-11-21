# python3 pvfig.py out.png tpl:seed [tpl:seed ...]  -> one image with each problem's figure and stem (to write narration from)
from playwright.sync_api import sync_playwright
import re, sys
out, items = sys.argv[1], [a.split(':') for a in sys.argv[2:]]
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1200, 'height': 900})
    pg.route(re.compile(r'https://.*'), lambda r: r.abort())
    pg.goto('http://localhost:8777/practice.html'); pg.wait_for_timeout(1500)
    pg.evaluate("""(items) => { document.body.innerHTML = ''; document.body.style.background = '#fff';
      const g = document.createElement('div'); g.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;padding:6px;width:1180px'; document.body.append(g);
      for (const [t, s] of items) { const q = TEMPLATES[t](mulberry32(+s)), d = document.createElement('div'); d.style.cssText = 'border:1px solid #999;width:380px;font:12px sans-serif';
        d.append(`${t} ${s}: ${String(q.stem).slice(0, 160)}`);
        if (q.draw) { const sc = Math.min(1, 370 / (q.size ? q.size[0] : 560)), cv = q.size ? makeCanvas(Math.round(q.size[0] * sc), Math.round(q.size[1] * sc)) : makeCanvas(370, 200); q.draw(cv); cv.style.display = 'block'; d.append(cv); }
        g.append(d); } }""", items)
    pg.wait_for_timeout(300); pg.locator('body > div').first.screenshot(path=out); b.close()
