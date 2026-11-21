# python3 pvdump.py <section prefix, e.g. "1.1" or "Pre-6.4"> [maxGroups]
# For each geometry practice type in that section: its kinds (topic + question sentence), with one instance each
# (seed, stem, answer, solution, the words drawn in the figure) to write the narrated video from.
from playwright.sync_api import sync_playwright
import re, sys, json
sec = sys.argv[1]; mx = int(sys.argv[2]) if len(sys.argv) > 2 else 6; SUBJ = sys.argv[3] if len(sys.argv) > 3 else 'geometry'
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page()
    pg.route(re.compile(r'https://.*'), lambda r: r.abort())
    pg.goto('http://localhost:8777/practice.html'); pg.wait_for_timeout(1500)
    res = pg.evaluate("""([sec, S]) => {
      const skel = (s) => String(s||'').replace(/[\\u0305\\u0304\\u20D6\\u20D7]/g,'').replace(/−?\\d+(\\.\\d+)?/g,'#').replace(/\\b[A-Z]{1,4}\\b/g,'@').replace(/(^|[^A-Za-z])[a-zℓ](?![A-Za-z])/g,'$1v').replace(/\\s+/g,' ');
      const labels = (q) => { if (!q.draw) return ''; const got = []; const P = CanvasRenderingContext2D.prototype, f = P.fillText;
        P.fillText = function (t, ...a) { got.push(String(t)); return f.call(this, t, ...a); };
        try { const cv = q.size ? makeCanvas(q.size[0], q.size[1]) : makeCanvas(560, 300); q.draw(cv); } catch (e) { got.push('ERR ' + e.message); }
        P.fillText = f; return got.filter((x) => x.trim()).join(' · '); };
      const out = [];
      for (const t of QUESTION_TYPES.filter(x => x.subject === S && x.section.split(' ')[0] === sec)) {
        const G = {};
        for (let k = 0; k < 300; k++) { const seed = 1000 + k; let q; try { q = TEMPLATES[t.id](mulberry32(seed)); } catch (e) { continue; }
          const sig = (q.topic||'') + ' ## ' + skel(String(q.stem)).slice(0,110);
          if (!G[sig]) G[sig] = { n: 0, seed, q }; G[sig].n++; }
        const gs = Object.entries(G).sort((a, b) => b[1].n - a[1].n);
        out.push({ id: t.id, label: t.label, ng: gs.length, groups: gs.map(([sig, g]) => { const q = g.q;
          const ans = q.fr && q.fr.display ? q.fr.display : (q.choices ? q.choices[q.answer] : '');
          return { sig, n: g.n, seed: g.seed, stem: q.stem, ans: String(ans), sol: String(q.solution||''), fig: labels(q) }; }) });
      }
      return out; }""", [sec, SUBJ])
    b.close()
for t in res:
    print(f"\n######## {t['id']} · {t['label']} · {t['ng']} groups")
    for g in t['groups'][:mx]:
        print(f"-- [{g['n']}] seed {g['seed']} | {g['sig']}\nSTEM: {g['stem']}\nANS: {g['ans']}\nSOL: {g['sol']}" + (f"\nFIG: {g['fig'][:300]}" if g['fig'] else ''))
    if t['ng'] > mx: print(f"-- …{t['ng']-mx} more groups: " + ' / '.join(g['sig'][:60] for g in t['groups'][mx:mx+12]))
