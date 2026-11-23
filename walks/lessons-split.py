"""Move the lesson plans out of practice.html into lessons.js (loaded only when a lesson page or a student's Notes needs them),
and keep practice.html's small index of them and the version stamp up to date.
Run after changing lessons.js (or once, to split them out):  python3 walks/lessons-split.py"""
import hashlib, json, os, re, subprocess
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P, J = os.path.join(ROOT, 'practice.html'), os.path.join(ROOT, 'lessons.js')
s = open(P, encoding='utf-8').read()
head = 'const LESSONS = {\n'
i = s.index(head)
if not os.path.exists(J) or 'const LESSONS = { /* index */' not in s:  # first run: cut the object out
    j = s.index('\n};\n', i) + 4
    body = s[i + len(head): j - 3]
    open(J, 'w', encoding='utf-8').write('/* Lesson plans for practice.html: loaded only when a lesson page or a student’s Notes needs them (see lessonsReady). */\nObject.assign(LESSONS, {\n' + body + '\n});\nlessonsDone();\n')
    s = s[:i] + 'const LESSONS = { /* index */ };\n' + s[j:]
# the index: key → { base, altTitle } (enough for menus and links), from lessons.js
out = subprocess.run(['node', '-e', '''
const LESSONS = {}; global.LESSONS = LESSONS; global.lessonsDone = () => {};
eval(require("fs").readFileSync(process.argv[1], "utf8"));
const idx = {}; for (const [k, v] of Object.entries(LESSONS)) { idx[k] = { _stub: 1 }; if (v.base) idx[k].base = v.base; if (v.altTitle) idx[k].altTitle = v.altTitle; }
process.stdout.write(JSON.stringify(idx));''', J], capture_output=True, text=True, check=True).stdout
ver = hashlib.sha1(open(J, 'rb').read()).hexdigest()[:10]
s = re.sub(r'const LESSONS = \{ /\* index \*/.*?\};\n(const LESSONS_VER = .*?;\n)?', lambda m: 'const LESSONS = { /* index */ ' + out[1:-1] + ' };\nconst LESSONS_VER = ' + json.dumps(ver) + ';\n', s, count=1, flags=re.S)
open(P, 'w', encoding='utf-8').write(s)
print('lessons.js', os.path.getsize(J), 'bytes; practice.html', os.path.getsize(P), 'bytes; version', ver, '; plans', out.count('_stub'))
