# python3 pvsol.py tpl [n]: distinct solution openings (numbers and letters masked) to spot kinds hidden behind the same question
from playwright.sync_api import sync_playwright
import re, sys
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(); pg.route(re.compile(r'https://.*'), lambda r: r.abort())
    pg.goto('http://localhost:8777/practice.html'); pg.wait_for_timeout(1500)
    for t in sys.argv[1:]:
        r = pg.evaluate("""(t) => { const C = {}; for (let k = 0; k < 300; k++) { let q; try { q = TEMPLATES[t](mulberry32(1000 + k)); } catch (e) { continue; }
          const s = String(q.solution || '').replace(/[\\u0305]/g, '').replace(/−?\\d+(\\.\\d+)?/g, '#').replace(/\\b[A-Z]{1,4}\\b/g, '@').split('\\n')[0].slice(0, 70);
          if (!C[s]) C[s] = [0, 1000 + k]; C[s][0]++; } return Object.entries(C).sort((a, b) => b[1][0] - a[1][0]).slice(0, 12); }""", t)
        print('##', t); [print(f'  [{n}] seed {sd}: {s}') for s, (n, sd) in r]
    b.close()
