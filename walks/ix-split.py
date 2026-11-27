"""Keep the interactives in interactives.js (loaded only when one is shown), with a small index of them in practice.html.
practice.html keeps the shared helpers (ixCanvas, ixMount, ixLink, …) and an index: id → { title, hint, subjects } so menus,
lesson plans, and the Interactives page can list them without downloading them all.
Run after changing interactives.js (or once, to split them out):  python3 walks/ix-split.py"""
import hashlib, json, os, re, subprocess
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P, J = os.path.join(ROOT, 'practice.html'), os.path.join(ROOT, 'interactives.js')
s = open(P, encoding='utf-8').read()
START, END = '// ---- Unit circle: drag the point', '// ======== end of the new interactives ========\n'
MARK = '// ---- the interactives themselves are in interactives.js (index below; see ixReady)\n'
if MARK not in s:  # first run: cut them out
    i, j = s.index(START), s.index(END) + len(END)
    open(J, 'w', encoding='utf-8').write('/* The interactives for practice.html: loaded only when one is shown (see ixReady in practice.html).\n   After changing this file, run  python3 walks/ix-split.py  so the index in practice.html matches. */\n' + s[i:j] + 'ixDone();\n')
    s = s[:i] + MARK + 'Object.assign(IX, { /* index */ });\nconst IX_VER = "";\n' + s[j:]
# the core helpers stay in the page; evaluate them with the interactives to read each one's title, hint, and subjects
core = s[s.index('const IX = {};'):s.index(MARK)]
node = r'''
const fs = require("fs"); global.el = () => ({ append() {}, addEventListener() {}, style: {} }); global.document = { createElement: () => ({ getContext: () => ({}), style: {} }) };
global.ixDone = () => {}; global.gcd = (a, b) => (b ? gcd(b, a % b) : a); global.mulberry32 = () => Math.random; global.CONFIG = {}; global.textCanvas = () => ({});
const src = fs.readFileSync(process.argv[1], "utf8") + "\n" + fs.readFileSync(process.argv[2], "utf8") + "\nglobalThis.__IX = IX;";
(0, eval)(src);
const idx = {}; for (const [k, D] of Object.entries(globalThis.__IX)) { idx[k] = { title: D.title, hint: D.hint, subjects: D.subjects || [], _stub: 1 }; if (D.wide) idx[k].wide = 1; }
process.stdout.write(JSON.stringify(idx));'''
tmp = os.path.join(ROOT, '.ix-core.tmp.js'); open(tmp, 'w', encoding='utf-8').write(core)
try:
    out = subprocess.run(['node', '-e', node, tmp, J], capture_output=True, text=True, check=True).stdout
finally:
    os.remove(tmp)
ver = hashlib.sha1(open(J, 'rb').read()).hexdigest()[:10]
s = re.sub(r'Object\.assign\(IX, \{ /\* index \*/.*?\}\);\nconst IX_VER = .*?;\n', lambda m: 'Object.assign(IX, { /* index */ ' + out[1:-1] + ' });\nconst IX_VER = ' + json.dumps(ver) + ';\n', s, count=1, flags=re.S)
open(P, 'w', encoding='utf-8').write(s)
print('interactives.js', os.path.getsize(J), 'bytes; practice.html', os.path.getsize(P), 'bytes; version', ver, '; interactives', out.count('_stub'))
