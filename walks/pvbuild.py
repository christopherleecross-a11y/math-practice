# python3 pvbuild.py [geo]  -> walks/pv-geometry.json from walks/pv/geo-*.txt, checked in a browser:
# each video's seed makes a problem of its own kind, and every problem the covered types make has a video.
from playwright.sync_api import sync_playwright
import re, json, glob, sys
PRE = sys.argv[1] if len(sys.argv) > 1 else 'geo'; SUBJ = {'geo': 'geometry', 'alg1': 'algebra1', 'alg2': 'algebra2', 'calc': 'apcalc', 'pc': 'precalc'}[PRE]
vids, errs = [], []
for fn in sorted(glob.glob(f'/home/claude/math-practice/walks/pv/{PRE}-*.txt')):
    cur = None
    for n, raw in enumerate(open(fn, encoding='utf-8'), 1):
        line = raw.rstrip('\n')
        if not line.strip(): continue
        m = re.match(r'^@@ (\w+) (\d+)\s*$', line)
        if m: cur = {'tpl': m.group(1), 'seed': int(m.group(2)), 'kind': '', 'title': '', 'steps': []}; vids.append(cur); continue
        m = re.match(r'^(kind|title|pick): ?(.*)$', line)
        if m and cur is not None and not cur['steps']: cur[m.group(1)] = m.group(2).strip(); continue
        if '||' in line and cur is not None:
            a, b = line.split('||', 1); cur['steps'].append([a.strip(), b.strip()]); continue
        errs.append(f'{fn}:{n}: {line[:80]}')
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page()
    pg.route(re.compile(r'https://.*'), lambda r: r.abort())
    pg.goto('http://localhost:8777/practice.html'); pg.wait_for_timeout(1500)
    res = pg.evaluate("""(vids) => {
      const errs = [], tpls = [...new Set(vids.map((v) => v.tpl))];
      for (const v of vids) {
        let q; try { q = TEMPLATES[v.tpl](mulberry32(v.seed)); } catch (e) { errs.push(`${v.tpl} ${v.seed}: ${e.message}`); continue; }
        v.stem = String(q.stem);
        let re; try { re = new RegExp(v.kind); } catch (e) { errs.push(`${v.tpl} ${v.seed}: bad kind ${v.kind}`); continue; }
        if (!re.test(`${q.topic || ''} ## ${q.stem}`)) errs.push(`${v.tpl} ${v.seed}: its own problem doesn't match kind /${v.kind}/: ${q.stem.slice(0, 80)}`);
        if (!v.title) errs.push(`${v.tpl} ${v.seed}: no title`); if (v.steps.length < 2) errs.push(`${v.tpl} ${v.seed}: no steps`);
      }
      const miss = [];
      for (const t of tpls) { const mv = vids.filter((v) => v.tpl === t), mine = mv.map((v) => new RegExp(v.kind)); let bad = 0, ex = '', ov = 0, oex = '';
        for (let k = 0; k < 400; k++) { let q; try { q = TEMPLATES[t](mulberry32(5000 + k)); } catch (e) { continue; } const key = `${q.topic || ''} ## ${q.stem}`;
          if (!mine.some((r) => r.test(key))) { bad++; ex = ex || key.slice(0, 110); }
          const hit = mv.filter((v, i) => mine[i].test(key)); if (hit.length > 1 && hit.some((v) => !v.pick)) { ov++; oex = oex || hit.map((v) => v.seed).join('+') + ' ' + key.slice(0, 90); } }
        if (ov) miss.push(`${t}: ${ov}/400 problems match several videos without picks, e.g. ${oex}`);
        if (bad) miss.push(`${t}: ${bad}/400 problems have no video, e.g. ${ex}`); }
      // AP® Practice types in the same sections with no videos of their own: every problem must find a video of the type it came from
      const secs0 = [...new Set(tpls.map((t) => (QUESTION_TYPES.find((x) => x.id === t) || {}).section))];
      for (const t of QUESTION_TYPES.filter((x) => /^cAP/.test(x.id) && secs0.includes(x.section) && !tpls.includes(x.id)).map((x) => x.id)) {
        let bad = 0, ex = '';
        for (let k = 0; k < 300; k++) { let q; try { q = TEMPLATES[t](mulberry32(7000 + k)); } catch (e) { continue; } if (!q.baseTpl) { bad++; ex = 'no baseTpl'; break; }
          const key = `${q.baseTopic || ''} ## ${q.stem}`; if (!vids.some((v) => v.tpl === q.baseTpl && new RegExp(v.kind).test(key))) { bad++; ex = ex || q.baseTpl + ': ' + key.slice(0, 90); } }
        if (bad) miss.push(`${t} (AP, uses its base type's videos): ${bad}/300 problems have no video, e.g. ${ex}`);
      }
      const sections = [...new Set(tpls.map((t) => (QUESTION_TYPES.find((x) => x.id === t) || {}).section))];
      const notDone = QUESTION_TYPES.filter((x) => x.subject === '""" + SUBJ + """' && sections.includes(x.section) && !tpls.includes(x.id) && !PRACTICE_VIDS.some((v) => v.tpl === x.id)).map((x) => x.id);
      return { vids, errs, miss, notDone, allTypes: QUESTION_TYPES.filter((x) => x.subject === '""" + SUBJ + """').length, doneTypes: tpls.length };
    }""", vids)
    b.close()
out = [{k: v[k] for k in ('tpl', 'seed', 'stem', 'kind', 'pick', 'title', 'steps') if v.get(k) not in (None, '')} for v in res['vids']]
json.dump(out, open(f'/home/claude/math-practice/walks/pv-{SUBJ}.json', 'w'), ensure_ascii=False, separators=(',', ':'))
print(f"videos: {len(out)} for {res['doneTypes']} of {res['allTypes']} types | errors: {len(errs) + len(res['errs'])} | uncovered types: {len(res['miss'])}")
for e in errs + res['errs'] + res['miss']: print('  ', e)
if res['notDone']: print('   section types with no videos:', ', '.join(res['notDone']))
