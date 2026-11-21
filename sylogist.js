/* Sylogist helper, shared by practice.html and crossword.html.
 *  - SYLOGIST.copy(rows): copies [{ name, score }] for the "Fill Sylogist" bookmark
 *  - SYLOGIST.installCard(): the card with the bookmark to drag to the bookmarks bar, and how to use it
 * The bookmark runs on the Sylogist gradebook page: the teacher clicks the score box of the first student in the
 * assignment's column, then clicks the bookmark. It matches each row's student name to the copied names, types the
 * scores into that column, and lists anything it couldn't match. It never saves; the teacher looks it over and saves.
 */
(function () {
  const TAG = 'ATOKA-SYLOGIST-1|';

  // ---- the bookmark itself (runs on the Sylogist page, so it uses nothing from this file) ----
  function fill() {
    const TAG = 'ATOKA-SYLOGIST-1|';
    const say = (m) => alert('Fill Sylogist\n\n' + m);
    // the box the teacher clicked, even inside a frame
    let doc = document, box = document.activeElement;
    try { while (box && /^i?frame$/i.test(box.tagName) && box.contentDocument) { doc = box.contentDocument; box = doc.activeElement; } } catch (e) {}
    const isBox = (x) => x && x.tagName === 'INPUT' && /^(text|number|tel|)$/i.test(x.type || '') && !x.disabled && !x.readOnly;
    if (!isBox(box)) return say('First click the score box for any student in the assignment’s column, then click this bookmark again.');
    const norm = (s) => String(s || '').toUpperCase().replace(/[^A-Z, ]/g, '').replace(/\s+/g, ' ').trim();
    const parts = (n) => {
      n = norm(n);
      if (n.includes(',')) { const [l, f] = n.split(','); return { last: l.replace(/ /g, ''), first: f.trim() }; }
      const w = n.split(' '); return { last: (w.pop() || '').replace(/ /g, ''), first: w.join(' ') };
    };
    const same = (a, b) => { // last names equal; first names agree on their first word (SARAH vs SARAH ANN)
      if (!a.last || a.last !== b.last) return false;
      const fa = a.first.split(' ')[0] || '', fb = b.first.split(' ')[0] || '';
      return !!fa && !!fb && (fa === fb || fa.startsWith(fb) || fb.startsWith(fa));
    };
    const go = (text) => {
      text = String(text || '').trim();
      if (!text.startsWith(TAG)) return say('The copied scores weren’t found. On the Results dashboard (or the crossword Results), click 📋 Copy for Sylogist first, then come back and click this bookmark.');
      let data; try { data = JSON.parse(text.slice(TAG.length)); } catch (e) { return say('The copied scores couldn’t be read. Copy them again.'); }
      const list = data.rows.map((r) => Object.assign({ p: parts(r.name), used: false }, r));
      // the column: the clicked box's position among the score boxes in its row
      const boxesIn = (tr) => [...tr.querySelectorAll('input')].filter(isBox);
      const row0 = box.closest('tr'); if (!row0) return say('That box isn’t in the gradebook table. Click a student’s score box.');
      const col = boxesIn(row0).indexOf(box);
      const nameOf = (tr) => { // a cell that reads LAST, FIRST
        for (const c of tr.querySelectorAll('a, td, th, span')) {
          const t = (c.textContent || '').trim();
          if (t.length < 60 && /^[A-Za-z][A-Za-z'’ .\-]*,\s*[A-Za-z]/.test(t) && !c.querySelector('input')) return t;
        }
        return '';
      };
      const table = row0.closest('table');
      let rows = [...table.querySelectorAll('tr')].filter((tr) => boxesIn(tr).length > col);
      let names = rows.map(nameOf);
      if (!names.some(Boolean)) { // names in a separate table beside the scores: pair them up in order
        const all = [...doc.querySelectorAll('tr')].filter((tr) => !table.contains(tr)).map(nameOf).filter(Boolean);
        if (all.length === rows.length) names = all;
        else return say('The student names couldn’t be found next to these score boxes, so nothing was filled in.');
      }
      const filled = [], noScore = [];
      rows.forEach((tr, i) => {
        const nm = names[i]; if (!nm) return;
        const p = parts(nm);
        let hit = list.find((r) => !r.used && same(p, r.p));
        if (!hit) { // a shortened name like "Betty S": same first name, and the last name starts with what was typed (only if just one fits)
          const fa = (p.first.split(' ')[0] || '');
          const c = list.filter((r) => !r.used && r.p.last && p.last.startsWith(r.p.last) && (r.p.first.split(' ')[0] || '') === fa);
          if (c.length === 1 && !rows.some((t2, j) => j !== i && names[j] && parts(names[j]).last.startsWith(c[0].p.last) && (parts(names[j]).first.split(' ')[0] || '') === fa)) hit = c[0];
        }
        if (!hit || hit.score === '' || hit.score == null) { noScore.push(nm); return; }
        hit.used = true;
        const input = boxesIn(tr)[col], v = String(hit.score);
        input.focus();
        const setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(input), 'value');
        if (setter && setter.set) setter.set.call(input, v); else input.value = v;
        ['input', 'keyup', 'change'].forEach((t) => input.dispatchEvent(new Event(t, { bubbles: true })));
        input.blur();
        input.style.outline = '3px solid #2e7d32';
        filled.push(nm);
      });
      const extra = list.filter((r) => !r.used && r.score !== '' && r.score != null).map((r) => r.name);
      say(`${data.title ? data.title + '\n' : ''}Filled in ${filled.length} score${filled.length === 1 ? '' : 's'} (outlined in green). Nothing is saved yet: look them over, then save in Sylogist.` +
        (noScore.length ? `\n\nLeft blank (no score copied for them):\n${noScore.join('\n')}` : '') +
        (extra.length ? `\n\nCopied, but not found on this page (a different period, or a different name in Sylogist):\n${extra.join('\n')}` : ''));
    };
    (navigator.clipboard && navigator.clipboard.readText ? navigator.clipboard.readText() : Promise.reject())
      .then(go, () => go(prompt('Fill Sylogist: press Ctrl+V (⌘V on a Mac) to paste the copied scores here, then OK.') || ''));
  }

  const href = 'javascript:' + encodeURIComponent('(' + fill.toString() + ')()');

  // rows: [{ name, score }] with score a number (percent) or '' for none
  async function copy(rows, title) {
    const text = TAG + JSON.stringify({ title: title || '', rows: rows.map((r) => ({ name: r.name, score: r.score === '' || r.score == null ? '' : Math.round(r.score * 100) / 100 })) });
    try { await navigator.clipboard.writeText(text); return true; }
    catch (e) { const t = document.createElement('textarea'); t.value = text; document.body.append(t); t.select(); const ok = document.execCommand('copy'); t.remove(); return ok; }
  }

  // the card with the bookmark: drag it to the bookmarks bar once
  function installCard(mk) {
    const box = document.createElement('div');
    box.className = mk || '';
    box.innerHTML = `<details style="margin-top:10px"><summary style="cursor:pointer;font-weight:700">How to put these scores in Sylogist</summary>
      <ol style="margin:8px 0 0;padding-left:20px;line-height:1.5">
        <li>One time: drag this button to your Chrome bookmarks bar → <a class="sylo-bm" style="display:inline-block;padding:4px 12px;border-radius:8px;background:#692b31;color:#fff;text-decoration:none;font-weight:700;cursor:grab" title="Drag me to the bookmarks bar" onclick="alert('Drag this button to your bookmarks bar. Then use it on the Sylogist gradebook page.');return false">Fill Sylogist</a>
          <span style="opacity:.75">(If the bookmarks bar is hidden: View → Always Show Bookmarks Bar.)</span></li>
        <li>Pick the assignment (and period) here and click <strong>📋 Copy for Sylogist</strong>.</li>
        <li>Switch to your Sylogist tab and open that period’s gradebook. Click the white score box in the assignment’s column for any student (for example, the box where you’d type Sarah Barton’s score). The bookmark only works on the Sylogist page, not here.</li>
        <li>Click <strong>Fill Sylogist</strong> on your bookmarks bar. If Chrome asks to see what you copied, click Allow.</li>
        <li>The filled scores are outlined in green, and a message lists anyone it skipped. Look them over, then save in Sylogist as usual.</li>
      </ol></details>`;
    box.querySelector('.sylo-bm').setAttribute('href', href);
    return box;
  }

  window.SYLOGIST = { copy, installCard, href, TAG };
})();
