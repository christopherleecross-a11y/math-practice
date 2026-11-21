# python3 pvforms.py tpl [tpl...] : groups of stems with numbers and single-letter variables masked (plus first solution line), with counts and a seed
from playwright.sync_api import sync_playwright
import re, sys, os
MX = int(os.environ.get('MX', '40'))
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(); pg.route(re.compile(r'https://.*'), lambda r: r.abort())
    pg.goto('http://localhost:8777/practice.html'); pg.wait_for_timeout(1500)
    for t in sys.argv[1:]:
        r = pg.evaluate("""(t) => { const C = {}; for (let k = 0; k < 400; k++) { let q; try { q = TEMPLATES[t](mulberry32(1000 + k)); } catch (e) { continue; }
          const m = (s) => String(s || '').replace(/−?\\d+(\\.\\d+)?/g, '#').replace(/(^|[^A-Za-z])[a-zℓ](?![A-Za-z])/g, '$1v').replace(/\\b(One|Two|Three|Four|Five|Six|Seven|Eight|Nine|Ten|one|two|three|four|five|six|seven|eight|nine|ten|twice|half)\\b/g, 'N').replace(/\\s+/g, ' ');
          const s = m(q.stem).slice(0, 150);
          if (!C[s]) C[s] = [0, 1000 + k, String(q.solution || '').split('\\n')[0].slice(0, 90)]; C[s][0]++; } return Object.entries(C).sort((a, b) => b[1][0] - a[1][0]).slice(0, 60); }""", t)
        print('##', t, len(r)); [print(f'  [{n}] {sd}: {s}  ⟹ {sol}') for s, (n, sd, sol) in r[:MX]]
    b.close()
