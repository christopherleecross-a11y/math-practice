# python3 pvq.py tpl:seed ...  -> stem, answer, solution, figure words for those exact problems
from playwright.sync_api import sync_playwright
import re, sys
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(); pg.route(re.compile(r'https://.*'), lambda r: r.abort())
    pg.goto('http://localhost:8777/practice.html'); pg.wait_for_timeout(1500)
    for a in sys.argv[1:]:
        t, s = a.split(':')
        r = pg.evaluate("""([t, s]) => { const q = TEMPLATES[t](mulberry32(+s)); const got = [];
          if (q.draw) { const P = CanvasRenderingContext2D.prototype, f = P.fillText; P.fillText = function (x, ...a) { got.push(String(x)); return f.call(this, x, ...a); };
            try { q.draw(q.size ? makeCanvas(q.size[0], q.size[1]) : makeCanvas(560, 300)); } catch (e) {} P.fillText = f; }
          const ans = q.fr && q.fr.display ? q.fr.display : (q.choices ? q.choices[q.answer] : '');
          return `STEM: ${q.stem}\\nANS: ${ans}\\nSOL: ${q.solution}` + (got.length ? `\\nFIG: ${got.filter((x) => x.trim()).join(' · ').slice(0, 900)}` : ''); }""", [t, s])
        print(f'-- {a}\n{r}')
    b.close()
