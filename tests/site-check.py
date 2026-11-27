"""Checks the site before it goes live (run by GitHub on every push; also by hand: python3 tests/site-check.py).
Starts a local web server, then:
  1. every script parses (practice.html, crossword.html, interactives.js, lessons.js, sw.js)
  2. practice.html opens with no errors
  3. every question type makes 20 questions with no errors and no NaN / [object …] / ${…} in the text
  4. the Interactives page lists them, and each interactive opens and can be dragged with no errors
  5. a lesson plan, the crossword page, and the student Notes code load with no errors
Exits with an error (so the update is not published) if anything fails."""
import os, re, subprocess, sys, threading, http.server, functools, tempfile
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
fails = []
def fail(msg): fails.append(msg); print('FAIL:', msg, flush=True)

# 1. syntax
def check_js(code, name):
    with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8') as f: f.write(code)
    r = subprocess.run(['node', '--check', f.name], capture_output=True, text=True); os.unlink(f.name)
    if r.returncode: fail(f'{name} has a syntax error: {r.stderr.strip()[:400]}')
for page in ['practice.html', 'crossword.html']:
    s = open(os.path.join(ROOT, page), encoding='utf-8').read()
    for i, code in enumerate(re.findall(r'<script>([\s\S]*?)</script>', s)): check_js(code, f'{page} script {i + 1}')
for js in ['interactives.js', 'lessons.js', 'sw.js', 'sylogist.js']:
    if os.path.exists(os.path.join(ROOT, js)): check_js(open(os.path.join(ROOT, js), encoding='utf-8').read(), js)
print('1. syntax checked', flush=True)

# a local server
class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
handler = functools.partial(Quiet, directory=ROOT)
srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), handler); port = srv.server_address[1]
threading.Thread(target=srv.serve_forever, daemon=True).start()
BASE = f'http://127.0.0.1:{port}/'

with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1240, 'height': 900}); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.route(re.compile(r'https?://(?!127\.0\.0\.1).*'), lambda r: r.abort())  # no Google Sheet, fonts, or videos
    def page_errors(where):
        if errs: fail(f'{where}: {errs[0][:300]}'); errs.clear()
    # 2. the page
    pg.goto(BASE + 'practice.html'); pg.wait_for_timeout(1500); page_errors('practice.html')
    # 3. question types
    bad = pg.evaluate("""() => { const bad = []; let n = 0; for (const id of Object.keys(TEMPLATES)) { for (let s = 1; s <= 20; s++) { try { const q = TEMPLATES[id](mulberry32(s)); n++;
        const t = String(q.stem) + String(q.solution) + JSON.stringify(q.choices || ''); if (/NaN|\\[object |\\$\\{/.test(t)) { bad.push(id + ' (seed ' + s + '): ' + (t.match(/.{0,40}(NaN|\\[object |\\$\\{).{0,20}/) || [''])[0]); break; } }
        catch (e) { bad.push(id + ' (seed ' + s + '): ' + e.message); break; } } } return [n, bad]; }""")
    print(f'3. {bad[0]} questions made', flush=True)
    for x in bad[1]: fail('question type ' + x)
    # 4. interactives
    pg.goto(BASE + 'practice.html?demo='); pg.wait_for_timeout(1000); page_errors('Interactives page')
    if pg.locator('.lp-ul li').count() < 50: fail('the Interactives page lists too few interactives')
    ids = pg.evaluate('() => Object.keys(IX)')
    for id in ids:
        pg.goto(BASE + 'practice.html?demo=' + id); pg.wait_for_timeout(450)
        cv = pg.locator('canvas.ix-cv')
        if cv.count():
            bx = cv.first.bounding_box(); pg.mouse.move(bx['x'] + bx['width'] * .5, bx['y'] + bx['height'] * .5); pg.mouse.down(); pg.mouse.move(bx['x'] + bx['width'] * .6, bx['y'] + bx['height'] * .4, steps=3); pg.mouse.up()
        elif not pg.locator('.ix-row').count(): fail(f'interactive {id} did not open')
        for bt in pg.locator('.ix-seg button').all()[:4]:
            try: bt.click(timeout=300)
            except Exception: pass
        page_errors(f'interactive {id}')
    print(f'4. {len(ids)} interactives opened', flush=True)
    # 5. other pages
    pg.goto(BASE + 'practice.html'); pg.wait_for_timeout(800)
    pg.evaluate('() => lessonsReady()'); pg.wait_for_timeout(2500); page_errors('lessons.js')
    n = pg.evaluate('() => Object.values(LESSONS).filter((L) => !L._stub).length')
    if n < 100: fail(f'only {n} lesson plans loaded')
    pg.goto(BASE + 'crossword.html'); pg.wait_for_timeout(1200); page_errors('crossword.html')
    print('5. lesson plans and crossword loaded', flush=True)
    b.close()
srv.shutdown()
if fails: print(f'\n{len(fails)} problem(s): not publishing.'); sys.exit(1)
print('\nAll checks passed.')
