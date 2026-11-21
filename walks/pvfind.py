# python3 pvfind.py tpl 'regex on topic ## stem' ['regex on solution'] -> the first seed whose problem matches, with its details
from playwright.sync_api import sync_playwright
import re, sys
t, rx = sys.argv[1], sys.argv[2]; sx = sys.argv[3] if len(sys.argv) > 3 else ''
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(); pg.route(re.compile(r'https://.*'), lambda r: r.abort())
    pg.goto('http://localhost:8777/practice.html'); pg.wait_for_timeout(1500)
    r = pg.evaluate("""([t, rx, sx]) => { const R = new RegExp(rx), S = new RegExp(sx); let n = 0, first = null;
      for (let k = 0; k < 600; k++) { let q; try { q = TEMPLATES[t](mulberry32(1000 + k)); } catch (e) { continue; }
        if (R.test(`${q.topic || ''} ## ${q.stem}`) && S.test(String(q.solution || ''))) { n++; if (!first) { const ans = q.fr && q.fr.display ? q.fr.display : (q.choices ? q.choices[q.answer] : ''); first = `seed ${1000 + k}\\nSTEM: ${q.stem}\\nANS: ${ans}\\nSOL: ${q.solution}`; } } }
      return `${n}/600 match\\n${first || ''}`; }""", [t, rx, sx])
    print(r); b.close()
