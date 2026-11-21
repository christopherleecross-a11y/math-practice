/**
 * Crossword class sheet
 * ---------------------
 * Connects the crossword game to this Google Sheet so you can:
 *   - assign puzzles to a whole period or to individual students (Assignments tab)
 *   - check student names against your class list (Roster tab, optional)
 *   - give a word bank to the students you tick on the Roster
 *   - collect finished puzzles automatically, with what each student typed (Results tab)
 *   - see average scores and the most-missed words for each assignment (Summary tab)
 *   - let students finish on a different Chromebook (Progress tab, hidden; leave it alone)
 *   - work from the crossword's teacher page: saved puzzles (Puzzles tab), assigning to periods, and results
 *
 * One-time setup (about 10 minutes):
 *   1. In this Sheet: Extensions > Apps Script. Delete what's there, paste this whole file, click Save.
 *   2. Choose the "setup" function in the toolbar and click Run. Approve the permission prompts.
 *      This creates the Assignments, Roster and Results tabs.
 *   3. Deploy > New deployment > gear icon > Web app.
 *        Execute as: Me
 *        Who has access: Anyone
 *      Click Deploy and copy the Web app URL (it ends in /exec).
 *   4. In crossword.html, paste that URL into your entry in the TEACHERS list (sheet: '...').
 *   5. Reload this Sheet. Use the new Crossword menu > "Connect the teacher page…" and type the password
 *      you use to unlock teacher mode in the crossword. (Do this again if you ever change that password.)
 *
 * AUTOMATIC UPDATES: put the short "starter" script in Apps Script instead of this file
 *   (Crossword starter: https://christopherleecross-a11y.github.io/math-practice/scripts/crossword-sheet-starter.gs).
 *   The starter loads the newest copy of this file from Mr. Cross's site, so updates arrive by themselves.
 *
 * Version 3 (Nov 2026): a student who signs in with Google and is in your class in Classroom (your Practice Results
 * roster) is added to the Roster tab by themselves, so you don't have to type new students in. "5", "5th" and
 * "5th hour" count as the same period. The crossword's teacher page tells this Sheet where your Practice Results
 * sheet is the next time you open it.
 *
 * Version 2 (Nov 2026): the sign-in, assignment and saved-progress lookups also work as POST, for school computers
 * whose web filter blocks reading the answer to a GET.
 *
 * If you edit this script later (or paste in a newer copy), use
 * Deploy > Manage deployments > (pencil) > Version: New version > Deploy, so the same URL keeps working.
 * A newer copy upgrades your existing tabs by itself (it adds any new columns).
 *
 * Privacy: students only ever receive the list of period names and their own puzzle.
 * The roster, assignments and results are never sent to a student's browser.
 */
var SCRIPT_BUILD = '2026-11-21.2'; // which copy this is (Check for updates now shows it)


var TABS = {
  assign: {
    name: 'Assignments',
    headers: ['Period', 'Student (blank = whole period)', 'Puzzle (student link or list name)', 'Difficulty (for list names)', 'Active', 'Label (what you call it)'],
    widths: [90, 200, 420, 170, 70, 220]
  },
  roster: {
    name: 'Roster',
    headers: ['Period', 'Student name', 'Word bank'],
    widths: [90, 240, 140]
  },
  results: {
    name: 'Results',
    headers: ['Submitted', 'Period', 'Student', 'Assignment', 'Puzzle', 'Score', 'Grade (%)', 'Difficulty', 'Words', 'Puzzle code',
              'Time', 'Left page (times)', 'Time away', 'Attempts on this device', 'Teacher mode used',
              'Letters revealed', 'Matches assignment', 'ID', 'Word bank', 'Version', 'Status',
              'Answers (what the student typed)', 'Word data (used by the Summary tab)', 'Devices used'],
    widths: [150, 70, 180, 180, 240, 80, 80, 80, 60, 95, 70, 120, 80, 150, 130, 115, 140, 90, 90, 80, 130, 520, 120, 100]
  },
  library: {
    name: 'Puzzles',
    headers: ['Saved', 'ID', 'Name', 'List', 'Difficulty', 'Words', 'Versions', 'Every student gets', 'Time limit (min)', 'Word bank for everyone', 'Puzzle code', 'Student link'],
    widths: [150, 90, 220, 240, 80, 60, 70, 150, 110, 150, 95, 420]
  },
  progress: {
    name: 'Progress',
    headers: ['Updated', 'Period', 'Student', 'Puzzle key', 'Started (ms)', 'Elapsed (s)', 'Letters', 'Left page (times)', 'Time away (s)', 'Turned in', 'Devices', 'Score'],
    widths: [150, 70, 180, 140, 120, 90, 300, 110, 100, 80, 120, 80]
  }
};

// position (0 = column A) of each Results column, by name
function rc_(name) { return TABS.results.headers.indexOf(name); }

/* ======================= web app ======================= */

function doGet(e) {
  try {
    ensureTabs_();
    var p = (e && e.parameter) || {};
    if (p.action === 'config') return json_({ ok: true, periods: periodsFrom(rows_('roster'), rows_('assign')) });
    if (p.action === 'assignment') return json_(lookupSigned_(p));
    if (p.action === 'progress') return json_(progressGet(rows_('progress'), rows_('roster'), p.period, p.name, p.key));
    return json_({ ok: true, hello: 'Crossword class sheet is running.', version: 3, build: typeof SCRIPT_BUILD === 'undefined' ? '' : SCRIPT_BUILD });
  } catch (err) {
    return json_({ ok: false, error: 'Sheet error: ' + err });
  }
}

// Reads, sent as POST too: some school web filters let a page read the answer to a POST but not to a GET.
// (The crossword tries these first and falls back to doGet for an older copy of this script.)
function readPost_(d) {
  if (d.action === 'config') return { ok: true, periods: periodsFrom(rows_('roster'), rows_('assign')) };
  if (d.action === 'assignment') return lookupSigned_(d);
  if (d.action === 'getProgress') return progressGet(rows_('progress'), rows_('roster'), d.period, d.name, d.key);
  return null;
}

function doPost(e) {
  var d0 = {};
  try { d0 = JSON.parse((e && e.postData && e.postData.contents) || '{}'); } catch (err) {}
  if (d0.action === 'config' || d0.action === 'assignment' || d0.action === 'getProgress') {
    try { ensureTabs_(); return json_(readPost_(d0)); } catch (err) { return json_({ ok: false, error: 'Sheet error: ' + err }); }
  }
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    ensureTabs_();
    var d = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (d.action === 'teacher') return json_(teacherPost_(d));
    if (d.action === 'progress') {
      var psh = sheet_('progress'), prow = progressPut(rows_('progress'), rows_('roster'), d, new Date());
      if (prow.index >= 0) psh.getRange(prow.index + 2, 1, 1, prow.row.length).setValues([prow.row]);
      else psh.appendRow(prow.row);
      return json_({ ok: true });
    }
    if (d.action !== 'result') return json_({ ok: false, error: 'Unknown action' });
    var sheet = sheet_('results');
    var ids = sheet.getLastRow() > 1 ? sheet.getRange(Math.max(2, sheet.getLastRow() - 999), rc_('ID') + 1, Math.min(1000, sheet.getLastRow() - 1), 1).getValues() : [];
    if (d.id && ids.some(function (r) { return String(r[0]) === String(d.id); })) return json_({ ok: true, duplicate: true });
    var row = resultRow(d, rows_('roster'), rows_('assign'), new Date());
    sheet.appendRow(row);
    try { updateSummary_(); } catch (err) { /* the result is saved even if the summary can't be redrawn */ }
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: 'Sheet error: ' + err });
  } finally {
    lock.releaseLock();
  }
}

/* ======================= teacher page ======================= */
// The crossword's teacher page sends a key made from the teacher password. The Sheet keeps only that key
// (Crossword menu > Connect the teacher page), never the password. Students never have it.
function onOpen() {
  if (SpreadsheetApp.getActive().getSheetByName(ARCHIVE_TAB)) { SpreadsheetApp.getUi().createMenu('Crossword').addItem('Check for updates now', 'checkForUpdatesNow').addToUi(); return; }
  SpreadsheetApp.getUi().createMenu('Crossword')
    .addItem('Connect the teacher page…', 'connectTeacherPage')
    .addItem('Redraw the Summary tab', 'refreshSummary')
    .addSeparator()
    .addItem('Check for updates now', 'checkForUpdatesNow')
    .addToUi();
}
function teacherKey(pw) {
  var b = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, 'crossword|' + pw, Utilities.Charset.UTF_8);
  return b.map(function (x) { return ('0' + (x & 255).toString(16)).slice(-2); }).join('');
}
function connectTeacherPage() {
  ensureTabs_();
  var ui = SpreadsheetApp.getUi();
  var r = ui.prompt('Connect the teacher page', 'Type the password you use to unlock teacher mode in the crossword (the same one, exactly).', ui.ButtonSet.OK_CANCEL);
  if (r.getSelectedButton() !== ui.Button.OK || !r.getResponseText()) return;
  PropertiesService.getScriptProperties().setProperty('TEACHER_KEY', teacherKey(r.getResponseText()));
  ui.alert('Connected. Open the crossword, unlock teacher mode, and your assignments and results will show on the teacher page.');
}
function teacherPost_(d) {
  var want = PropertiesService.getScriptProperties().getProperty('TEACHER_KEY');
  if (!want) return { ok: false, needSetup: true };
  var cache = CacheService.getScriptCache(), fails = Number(cache.get('tfail') || 0);
  if (fails >= 20) return { ok: false, error: 'Too many wrong tries. Wait 10 minutes and try again.' };
  if (String(d.key || '') !== want) { cache.put('tfail', String(fails + 1), 600); return { ok: false, badKey: true }; }
  if (d.op === 'newYear') return newSchoolYear_(d);
  // the teacher page says where this teacher's Practice Results sheet is (used to check Google sign-in passes)
  var pr = String(d.results || '');
  if (/^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(pr) && PropertiesService.getScriptProperties().getProperty('PRACTICE_URL') !== pr)
    PropertiesService.getScriptProperties().setProperty('PRACTICE_URL', pr);
  var reads = d.op === 'results';
  var db = { roster: rows_('roster'), assign: rows_('assign'), library: rows_('library'),
             results: reads ? rows_('results') : [], progress: reads ? rows_('progress') : [] };
  var r = teacherRun(d, db, new Date());
  var w = r.writes || {}, ash = sheet_('assign');
  (w.assignRows || []).forEach(function (x) {
    ash.getRange(x[0], 1, 1, 6).setValues([x[1]]);
    ash.getRange(x[0], 5).insertCheckboxes().setValue(x[1][4] === true);
  });
  (w.assignActive || []).forEach(function (x) { ash.getRange(x[0], 5).setValue(x[1]); });
  if (w.library) {
    var lsh = sheet_('library'), n = TABS.library.headers.length;
    if (lsh.getLastRow() > 1) lsh.getRange(2, 1, lsh.getLastRow() - 1, n).clearContent();
    if (db.library.length) lsh.getRange(2, 1, db.library.length, n).setValues(db.library);
  }
  return r.out;
}

// pure: works on the tabs' rows (db.roster, db.assign, db.library, db.results, db.progress) and says what to write back
function teacherRun(d, db, now) {
  var writes = { assignRows: [], assignActive: [], library: false };
  var DIFF_LABEL = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };
  var str = function (v) { return v instanceof Date ? v.toISOString() : String(v == null ? '' : v); };
  var codeOf = function (r) { var p = parsePuzzleCell(r[2]); return p && p.code ? p.code : ''; };
  var setActive = function (i, on) { db.assign[i][4] = on; writes.assignActive.push([i + 2, on]); };
  // only one whole-period assignment is on at a time in each period
  var offOthers = function (period, keep) {
    db.assign.forEach(function (r, i) {
      if (i !== keep && !String(r[1]).trim() && normPeriod(r[0]) === normPeriod(period) && isActive(r[4])) setActive(i, false);
    });
  };
  var overview = function () {
    return {
      ok: true,
      periods: periodsFrom(db.roster, db.assign),
      roster: db.roster.filter(function (r) { return String(r[1]).trim(); }).map(function (r) { return [String(r[0]).trim(), String(r[1]).trim()]; }),
      assign: db.assign.map(function (r, i) {
        var p = parsePuzzleCell(r[2]); if (!p) return null;
        return { row: i + 2, period: String(r[0]).trim(), student: String(r[1]).trim(), code: p.code || '', list: p.list || '',
                 diff: normDiff(r[3]), active: isActive(r[4]), label: String(r[5] || '').trim() };
      }).filter(Boolean),
      library: db.library.filter(function (r) { return String(r[1]).trim(); }).map(function (r) {
        return { saved: str(r[0]), id: String(r[1]), label: String(r[2]), list: String(r[3]), diff: String(r[4]).toLowerCase(), words: Number(r[5]) || 0,
                 versions: Number(r[6]) || 1, mode: String(r[7]), tl: Number(r[8]) || 0, wb: r[9] === true || r[9] === 'Yes',
                 pcode: String(r[10]), share: (String(r[11]).match(/#p=([\w-]+)/) || [])[1] || '' };
      })
    };
  };
  var op = d.op;
  if (op === 'overview') return { out: overview(), writes: writes };
  if (op === 'results') {
    var C = ['Submitted', 'Period', 'Student', 'Assignment', 'Puzzle', 'Score', 'Grade (%)', 'Difficulty', 'Puzzle code', 'Time',
             'Left page (times)', 'Status', 'Version', 'Teacher mode used'].map(rc_);
    var out = overview();
    out.results = db.results.slice(-3000).map(function (r) { return C.map(function (c) { return str(r[c]); }); });
    out.progress = db.progress.map(function (r) { return [str(r[1]), str(r[2]), str(r[3]), r[9] === true || /^(true|yes)$/i.test(String(r[9])), str(r[11]), str(r[0])]; });
    return { out: out, writes: writes };
  }
  if (op === 'save') {
    var e = d.entry || {}, id = String(e.id || '').replace(/[^\w-]/g, '').slice(0, 20);
    var share = String(e.share || '').replace(/[^\w-]/g, '');
    if (!id || !share) return { out: { ok: false, error: 'Nothing to save.' }, writes: writes };
    var link = String(d.site || '').replace(/[#?].*$/, '').slice(0, 300) + '#p=' + share;
    var at = -1; db.library.forEach(function (r, i) { if (String(r[1]) === id) at = i; });
    var row = [at >= 0 ? db.library[at][0] : now, id, safeCell(e.label, 80), safeCell(e.list, 80), DIFF_LABEL[e.diff] || 'Medium',
               Number(e.words) || 0, Number(e.versions) || 1, safeCell(e.mode, 40), Number(e.tl) || '', e.wb ? 'Yes' : 'No', safeCell(e.pcode, 10), link];
    if (at >= 0) db.library[at] = row; else db.library.push(row);
    writes.library = true;
    return { out: overview(), writes: writes };
  }
  if (op === 'remove') {
    db.library = db.library.filter(function (r) { return String(r[1]) !== String(d.id); });
    writes.library = true;
    return { out: overview(), writes: writes };
  }
  if (op === 'assign') {
    var code = String(d.share || '').replace(/[^\w-]/g, ''), list = String(d.list || '').trim();
    var cell = code ? String(d.site || '').replace(/[#?].*$/, '').slice(0, 300) + '#p=' + code : list;
    if (!cell) return { out: { ok: false, error: 'Nothing to assign.' }, writes: writes };
    (Array.isArray(d.periods) ? d.periods : []).slice(0, 20).forEach(function (period) {
      period = String(period).trim(); if (!period) return;
      var found = -1;
      db.assign.forEach(function (r, i) {
        if (String(r[1]).trim() || normPeriod(r[0]) !== normPeriod(period)) return;
        var p = parsePuzzleCell(r[2]); if (!p) return;
        if (code ? p.code === code : (p.list || '').toLowerCase() === list.toLowerCase() && normDiff(r[3]) === normDiff(d.diff)) found = i;
      });
      offOthers(period, found);
      if (found >= 0) { if (!isActive(db.assign[found][4])) setActive(found, true); return; }
      var row = [period, '', cell, DIFF_LABEL[normDiff(d.diff)], true, safeCell(d.label, 80)];
      var empty = -1;
      for (var i = 0; i < db.assign.length; i++) { var r = db.assign[i]; if (!String(r[0]).trim() && !String(r[1]).trim() && !String(r[2]).trim()) { empty = i; break; } }
      if (empty < 0) { empty = db.assign.length; db.assign.push(row); } else db.assign[empty] = row;
      writes.assignRows.push([empty + 2, row]);
    });
    return { out: overview(), writes: writes };
  }
  if (op === 'active') {
    var k = Number(d.row) - 2;
    if (!(k >= 0 && k < db.assign.length) || !parsePuzzleCell(db.assign[k][2])) return { out: { ok: false, error: 'That row has changed. Refresh and try again.' }, writes: writes };
    if (d.active && !String(db.assign[k][1]).trim()) offOthers(db.assign[k][0], k);
    setActive(k, !!d.active);
    return { out: overview(), writes: writes };
  }
  if (op === 'unassign') {
    var c2 = String(d.share || '');
    db.assign.forEach(function (r, i) { if (c2 && codeOf(r) === c2 && isActive(r[4])) setActive(i, false); });
    return { out: overview(), writes: writes };
  }
  return { out: { ok: false, error: 'Unknown teacher action' }, writes: writes };
}

/* ======================= one-time setup ======================= */

function setup() {
  ensureTabs_();
  updateSummary_();
  SpreadsheetApp.getActive().toast('Assignments, Roster, Results and Summary tabs are ready.', 'Crossword', 5);
}

// run this by hand to redraw the Summary tab (it also redraws itself after every result)
function refreshSummary() {
  ensureTabs_();
  updateSummary_();
  SpreadsheetApp.getActive().toast('Summary updated.', 'Crossword', 3);
}

function updateSummary_() {
  var ss = SpreadsheetApp.getActive(), sh = ss.getSheetByName('Summary');
  if (!sh) sh = ss.insertSheet('Summary', 0);
  var s = summaryData(rows_('results'));
  sh.clear();
  sh.getRange(1, 1).setValue('Class summary').setFontWeight('bold').setFontSize(14);
  sh.getRange(2, 1).setValue('Redraws itself after every result. Each student\'s latest result for an assignment is the one counted. Newest assignments first.').setFontColor('#666666');
  var r = 4;
  sh.getRange(r, 1, 1, s.assignHeaders.length).setValues([s.assignHeaders]).setFontWeight('bold').setBackground('#e8eefc');
  if (s.assignRows.length) sh.getRange(r + 1, 1, s.assignRows.length, s.assignHeaders.length).setValues(s.assignRows);
  r += s.assignRows.length + 3;
  sh.getRange(r - 1, 1).setValue('Most-missed words').setFontWeight('bold').setFontSize(12);
  sh.getRange(r, 1, 1, s.wordHeaders.length).setValues([s.wordHeaders]).setFontWeight('bold').setBackground('#e8eefc');
  if (s.wordRows.length) sh.getRange(r + 1, 1, s.wordRows.length, s.wordHeaders.length).setValues(s.wordRows);
  [220, 220, 95, 80, 110, 110, 150, 100, 420].forEach(function (w, i) { sh.setColumnWidth(i + 1, w); });
  sh.setFrozenRows(0);
}

/* End of the school year (crossword teacher page › My assignments › End of the school year):
   saves a copy of this whole Sheet named for the school year, then empties the student data for next year
   (Results, Progress, Roster, Assignments, Summary). The Puzzles tab (your saved puzzles) and settings are kept. */
var ARCHIVE_TAB = 'About this archive';
function schoolYearLabel_(now) { var y = now.getFullYear(), a = now.getMonth() < 7 ? y - 1 : y; return a + '–' + String(a + 1).slice(2); }
function newSchoolYear_(d) {
  var ss = SpreadsheetApp.getActive();
  if (ss.getSheetByName(ARCHIVE_TAB)) return { ok: false, error: 'This Sheet is an archive copy, so it can’t start a new year.' };
  if (String(d.confirm || '') !== 'NEW YEAR') return { ok: false, error: 'Type NEW YEAR to confirm.' };
  var label = String(d.label || '').trim() || schoolYearLabel_(new Date());
  var name = ss.getName() + ' — ' + label + ' archive', copy = ss.copy(name), url = '';
  try {
    var note = copy.insertSheet(ARCHIVE_TAB, 0);
    note.getRange(1, 1, 3, 1).setValues([['Archive: ' + label + ' school year'], ['Saved ' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'MMMM d, yyyy') + ' from “' + ss.getName() + '”.'],
      ['This copy is for looking things up. The crossword site doesn’t use it: new results go to the original Sheet.']]);
    note.getRange(1, 1).setFontWeight('bold').setFontSize(14); note.setColumnWidth(1, 720);
    url = copy.getUrl();
  } catch (e) {}
  var n = 0;
  ['results', 'progress', 'roster', 'assign'].forEach(function (k) {
    var sh = sheet_(k); if (!sh || sh.getLastRow() < 2) return;
    var body = sh.getRange(2, 1, sh.getLastRow() - 1, Math.max(1, sh.getLastColumn()));
    if (k === 'results') n = sh.getLastRow() - 1;
    body.clearContent(); // keeps the checkboxes
    body.setFontColor(null);
  });
  try { updateSummary_(); } catch (e) {}
  return { ok: true, archive: name, url: url, results: n };
}

function ensureTabs_() {
  var ss = SpreadsheetApp.getActive();
  Object.keys(TABS).forEach(function (k) {
    var t = TABS[k], sh = ss.getSheetByName(t.name);
    if (sh) return;
    sh = ss.insertSheet(t.name);
    sh.getRange(1, 1, 1, t.headers.length).setValues([t.headers]).setFontWeight('bold').setBackground('#e8eefc');
    sh.setFrozenRows(1);
    t.widths.forEach(function (w, i) { sh.setColumnWidth(i + 1, w); });
    if (k === 'assign') {
      sh.getRange(2, 5, 500, 1).insertCheckboxes();
      sh.getRange(2, 4, 500, 1).setDataValidation(SpreadsheetApp.newDataValidation()
        .requireValueInList(['Easy', 'Medium', 'Hard'], true).setAllowInvalid(true).build());
      sh.getRange(2, 1, 2, 4).setValues([
        ['All', '', 'Geometry 1: Basics', 'Medium'],
        ['3', '', '(paste a student link from Teacher > Make a class puzzle)', '']
      ]).setFontColor('#888888');
      sh.getRange(2, 6, 2, 1).setValues([['Example: everyone. Tick Active to use it'], ['Example: one period']]).setFontColor('#888888');
    }
    if (k === 'roster') sh.getRange(2, 3, 500, 1).insertCheckboxes();
    if (k === 'results') sh.getRange('A:A').setNumberFormat('m/d/yyyy h:mm am/pm');
    if (k === 'progress') { sh.getRange('A:A').setNumberFormat('m/d/yyyy h:mm am/pm'); sh.hideSheet(); }
    if (k === 'library') sh.getRange('A:A').setNumberFormat('m/d/yyyy h:mm am/pm');
  });
  migrateResults_(ss);
  upgradeTabs_(ss);
  var first = ss.getSheets()[0];
  if (first.getName() === 'Sheet1' && first.getLastRow() === 0 && ss.getSheets().length > 3) ss.deleteSheet(first);
}

// rearranges a Results tab made by an older version of this script into the current column order,
// matching columns by their header names (any columns you added yourself are kept, at the far right)
function migrateResults_(ss) {
  var t = TABS.results, sh = ss.getSheetByName(t.name);
  if (!sh || sh.getLastColumn() < 1) return;
  var lastCol = sh.getLastColumn(), lastRow = sh.getLastRow();
  var have = sh.getRange(1, 1, 1, lastCol).getValues()[0].map(function (v) { return String(v).trim(); });
  if (t.headers.every(function (hd, i) { return have[i] === hd; })) return; // already current
  if (have.indexOf('Student') < 0 || have.indexOf('Puzzle') < 0) return;   // not a tab this script made
  var data = lastRow > 1 ? sh.getRange(2, 1, lastRow - 1, lastCol).getValues() : [];
  var extras = [];
  have.forEach(function (hd, i) { if (hd && t.headers.indexOf(hd) < 0) extras.push(i); });
  var headers = t.headers.concat(extras.map(function (i) { return have[i]; }));
  var scoreAt = have.indexOf('Score');
  var rows = data.map(function (r) {
    var out = t.headers.map(function (hd) { var i = have.indexOf(hd); return i >= 0 ? r[i] : ''; });
    if (out[rc_('Grade (%)')] === '' && scoreAt >= 0) out[rc_('Grade (%)')] = gradeOf(r[scoreAt]);
    return out.concat(extras.map(function (i) { return r[i]; }));
  });
  var width = Math.max(lastCol, headers.length);
  sh.getRange(1, 1, Math.max(1, lastRow), width).clearContent();
  sh.getRange(1, 1, 1, width).setBackground(null).setFontWeight('normal');
  sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold').setBackground('#e8eefc');
  if (rows.length) sh.getRange(2, 1, rows.length, headers.length).setValues(rows);
  t.widths.forEach(function (w, i) { sh.setColumnWidth(i + 1, w); });
  sh.getRange('A:A').setNumberFormat('m/d/yyyy h:mm am/pm');
}

// adds columns that newer versions of this script use to tabs made by an older version
function upgradeTabs_(ss) {
  // older copies called the Roster's third column "Word bank (IEP)"
  var ro = ss.getSheetByName(TABS.roster.name);
  if (ro && String(ro.getRange(1, 3).getValue()).trim() === 'Word bank (IEP)') ro.getRange(1, 3).setValue('Word bank');
  Object.keys(TABS).forEach(function (k) {
    var t = TABS[k], sh = ss.getSheetByName(t.name);
    if (!sh) return;
    var have = sh.getRange(1, 1, 1, t.headers.length).getValues()[0];
    for (var c = 0; c < t.headers.length; c++) {
      if (String(have[c]).trim()) continue;
      sh.getRange(1, c + 1).setValue(t.headers[c]).setFontWeight('bold').setBackground('#e8eefc');
      sh.setColumnWidth(c + 1, t.widths[c]);
      if (k === 'roster' && c === 2) sh.getRange(2, 3, 500, 1).insertCheckboxes();
    }
  });
}

/* ======================= helpers that touch the Sheet ======================= */

function sheet_(k) { return SpreadsheetApp.getActive().getSheetByName(TABS[k].name); }
function rows_(k) {
  var sh = sheet_(k);
  if (!sh || sh.getLastRow() < 2) return [];
  return sh.getRange(2, 1, sh.getLastRow() - 1, TABS[k].headers.length).getValues();
}
function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// The name isn't on the Roster for that period, but the student signed in with Google: ask this teacher's Practice
// Results sheet (which made the sign-in pass from the Classroom roster) whether the pass is real. If it is, add the
// student to the Roster tab and look again. Without a pass this is the plain lookup.
function lookupSigned_(d) {
  var roster = rows_('roster'), out = lookup(roster, rows_('assign'), d.period, d.name);
  if (out.ok || !d.token || rosterName(roster, d.period, d.name) !== null) return out;
  var who = passCheck_(d.token);
  if (!who || normName(who.n) !== normName(d.name)) return out;
  var per = normPeriod(d.period);
  if (!(who.ps || []).some(function (p) { return normPeriod(p) === per; })) return out;
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(20000)) return out;
  try {
    roster = rows_('roster');
    if (rosterName(roster, d.period, who.n) === null) {
      // use the period's spelling already on the Roster ("5th" stays "5th")
      var label = String(d.period).trim();
      roster.some(function (r) { if (String(r[0]).trim() && normPeriod(r[0]) === per) { label = String(r[0]).trim(); return true; } return false; });
      var sh = sheet_('roster'), at = Math.max(2, sh.getLastRow() + 1);
      sh.getRange(at, 1, 1, 2).setValues([[label, safeCell(who.n, 60)]]);
      sh.getRange(at, 3).insertCheckboxes();
    }
  } finally { lock.releaseLock(); }
  return lookup(rows_('roster'), rows_('assign'), d.period, d.name);
}
function passCheck_(token) {
  var url = PropertiesService.getScriptProperties().getProperty('PRACTICE_URL');
  token = String(token || '').slice(0, 2000);
  if (!url || !/^[\w-]+\.[\w-]+$/.test(token)) return null;
  var cache = CacheService.getScriptCache(), key = 'pass:' + Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, token)).slice(0, 40);
  var hit = cache.get(key); if (hit) return JSON.parse(hit);
  try {
    var r = UrlFetchApp.fetch(url, { method: 'post', contentType: 'text/plain', payload: JSON.stringify({ action: 'whoami', token: token }), muteHttpExceptions: true });
    var o = JSON.parse(r.getContentText());
    if (!o || !o.ok || !o.n) return null;
    var who = { n: String(o.n), ps: (o.ps || []).map(String) };
    cache.put(key, JSON.stringify(who), 3600);
    return who;
  } catch (e) { return null; }
}

/* ======================= pure logic (no Sheet access) ======================= */

// "Period 3", "3", " p3 " all count as the same period
// "5th", "5th hour" and "5th period" count as 5 too
function normPeriod(p) {
  var s = String(p == null ? '' : p).trim().toLowerCase().replace(/^(period|per\.?|p)\s*/, '').replace(/\s+/g, ' ');
  var m = s.match(/^(\d+)\s*(st|nd|rd|th)?(\s*(hour|hr|period|per))?$/);
  return m ? String(Number(m[1])) : s;
}
// "Rivera, Jamie" and "jamie  rivera" match
function normName(s) {
  return String(s == null ? '' : s).toLowerCase().replace(/[^a-z0-9\s'-]/g, ' ').split(/\s+/).filter(Boolean).sort().join(' ');
}
function isActive(v) { return v === true || /^(true|yes|y|x|1)$/i.test(String(v).trim()); }
function isAllPeriod(p) { var n = normPeriod(p); return n === '' || n === 'all'; }

function periodsFrom(rosterRows, assignRows) {
  var seen = {}, out = [];
  var src = rosterRows.filter(function (r) { return String(r[0]).trim() && String(r[1]).trim(); });
  var list = src.length ? src.map(function (r) { return r[0]; })
                        : assignRows.map(function (r) { return r[0]; }).filter(function (p) { return !isAllPeriod(p); });
  list.forEach(function (p) {
    var label = String(p).trim(), k = normPeriod(label);
    if (k && !seen[k]) { seen[k] = 1; out.push(label); }
  });
  return out.sort(function (a, b) {
    var na = parseFloat(normPeriod(a)), nb = parseFloat(normPeriod(b));
    if (!isNaN(na) && !isNaN(nb) && na !== nb) return na - nb;
    return a.localeCompare(b);
  });
}

// is this student ticked for a word bank on the Roster?
function rosterWordBank(rosterRows, period, name) {
  var want = normName(name), per = normPeriod(period);
  return rosterRows.some(function (r) {
    return String(r[1]).trim() && normName(r[1]) === want && (normPeriod(r[0]) === per || isAllPeriod(r[0])) && isActive(r[2]);
  });
}

// returns the roster spelling of the name, or null if a roster exists and the name isn't on it for that period
function rosterName(rosterRows, period, name) {
  var rows = rosterRows.filter(function (r) { return String(r[1]).trim(); });
  var typed = String(name || '').trim().replace(/\s+/g, ' ');
  if (!rows.length) return typed;
  var want = normName(typed), per = normPeriod(period);
  for (var i = 0; i < rows.length; i++) {
    if (normName(rows[i][1]) === want && (normPeriod(rows[i][0]) === per || isAllPeriod(rows[i][0]))) return String(rows[i][1]).trim();
  }
  return null;
}

function parsePuzzleCell(v) {
  var s = String(v == null ? '' : v).trim();
  var m = s.match(/#p=([\w-]+)/);
  if (m) return { code: m[1] };
  if (/^[\w-]{20,}$/.test(s)) return { code: s };
  if (s && s.charAt(0) !== '(') return { list: s };
  return null;
}
function normDiff(v) {
  var s = String(v || '').trim().toLowerCase();
  return s === 'easy' || s === 'hard' ? s : 'medium';
}

// most specific active row wins: this student > their period > everyone ("All"); later rows beat earlier ones
function resolveAssignment(assignRows, period, studentName) {
  var per = normPeriod(period), me = normName(studentName), best = null, bestTier = 0;
  assignRows.forEach(function (r, i) {
    if (!isActive(r[4])) return;
    var puzzle = parsePuzzleCell(r[2]); if (!puzzle) return;
    var rowStudent = normName(r[1]), rowAll = isAllPeriod(r[0]), rowPer = normPeriod(r[0]);
    var tier = 0;
    if (rowStudent) { if (rowStudent === me && (rowAll || rowPer === per)) tier = 3; }
    else if (!rowAll && rowPer === per) tier = 2;
    else if (rowAll) tier = 1;
    if (tier && tier >= bestTier) {
      bestTier = tier;
      best = { row: i + 2, label: String(r[5] || '').trim(), diff: normDiff(r[3]), code: puzzle.code, list: puzzle.list };
    }
  });
  return best;
}

function lookup(rosterRows, assignRows, period, name) {
  if (!String(period || '').trim()) return { ok: false, error: 'Choose your class period.' };
  if (String(name || '').trim().length < 2) return { ok: false, error: 'Type your name.' };
  var real = rosterName(rosterRows, period, name);
  if (real === null) return { ok: false, error: 'That name isn\'t on the class list for ' + period + '. Check the spelling, or ask your teacher.' };
  var a = resolveAssignment(assignRows, period, real), wb = rosterWordBank(rosterRows, period, real);
  if (!a) return { ok: true, found: false, name: real, wordBank: wb };
  return { ok: true, found: true, name: real, code: a.code || '', list: a.list || '', diff: a.diff, label: a.label, wordBank: wb };
}

function safeCell(v, max) {
  var s = String(v == null ? '' : v).slice(0, max || 120);
  return /^[=+\-@]/.test(s) ? "'" + s : s; // never let a student's text run as a formula
}
function mmss(sec) {
  sec = Math.max(0, Math.round(Number(sec) || 0));
  var h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60), s = sec % 60;
  return (h ? h + ':' + (m < 10 ? '0' : '') : '') + m + ':' + (s < 10 ? '0' : '') + s;
}

function resultRow(d, rosterRows, assignRows, now) {
  var real = rosterName(rosterRows, d.period, d.student);
  var studentCell = real === null ? safeCell(d.student, 60) + ' (not on roster)' : safeCell(real, 60);
  var a = resolveAssignment(assignRows, d.period, real === null ? d.student : real);
  var match = 'No assignment';
  if (a) match = a.code ? (a.code === d.share ? 'Yes' : 'No — different puzzle')
                        : (String(a.list).trim().toLowerCase() === String(d.list || '').trim().toLowerCase() ? 'Yes' : 'No — different puzzle');
  var v = {
    'Submitted': now,
    'Period': safeCell(d.period, 20),
    'Student': studentCell,
    'Assignment': safeCell(d.label || (a && a.label) || '', 80),
    'Puzzle': safeCell(d.puzzle, 80),
    'Score': safeCell(d.score || '', 12),
    'Grade (%)': gradeOf(d.score),
    'Difficulty': safeCell(d.diff, 10),
    'Words': Number(d.words) || '',
    'Puzzle code': safeCell(d.code, 10),
    'Time': "'" + mmss(d.timeSec), // the ' keeps it text: otherwise the Sheet reads 5:27 as 5 hours 27 minutes
    'Left page (times)': Number(d.away) || 0,
    'Time away': "'" + mmss(d.awaySec),
    'Attempts on this device': Number(d.attempts) || '',
    'Teacher mode used': d.teacher ? 'Yes' : 'No',
    'Letters revealed': d.revealed ? 'Yes' : 'No',
    'Matches assignment': match,
    'ID': safeCell(d.id, 40),
    'Word bank': d.wordBank ? 'Yes' : 'No',
    'Version': safeCell(d.version || '', 12),
    'Status': d.status === 'Turned in early' || d.status === 'Time ran out' ? d.status : 'Solved',
    'Answers (what the student typed)': answersText(d.words),
    'Word data (used by the Summary tab)': wordData(d),
    'Devices used': Math.max(1, Math.min(99, Math.floor(Number(d.devices) || 1)))
  };
  return TABS.results.headers.map(function (hd) { return v[hd]; });
}
// "9 of 12" -> 75 (a plain number, so it sorts and copies into a gradebook)
function gradeOf(score) {
  var m = String(score || '').match(/(\d+)\s*of\s*(\d+)/);
  return m && +m[2] ? Math.round(+m[1] / +m[2] * 100) : '';
}

/* ---- what the student typed ---- */
// each word arrives as [label like "4A", typed letters with _ for blanks, 1 if right, word number in the list, clue if wrong]
function cleanWords(words) {
  if (!Array.isArray(words)) return [];
  return words.slice(0, 150).filter(function (x) { return Array.isArray(x) && x.length >= 3; }).map(function (x) {
    return [String(x[0]).replace(/[^0-9AD]/g, '').slice(0, 4), String(x[1]).toUpperCase().replace(/[^A-Z_]/g, '').slice(0, 25),
            x[2] ? 1 : 0, Number(x[3]) >= 0 ? Math.floor(Number(x[3])) : -1, String(x[4] || '').slice(0, 70)];
  });
}
function answersText(words) {
  var w = cleanWords(words); if (!w.length) return '';
  var missed = w.filter(function (x) { return !x[2]; }).map(function (x) {
    var typed = /^_+$/.test(x[1]) ? '(blank)' : x[1];
    return x[0] + ' ' + typed + (x[4] ? ' (' + x[4] + ')' : '');
  });
  var right = w.filter(function (x) { return x[2]; }).map(function (x) { return x[1]; });
  return safeCell('Missed: ' + (missed.length ? missed.join('; ') : 'none') + ' | Right: ' + (right.length ? right.join(', ') : 'none'), 4000);
}
function wordData(d) {
  var w = cleanWords(d.words); if (!w.length) return '';
  return safeCell(JSON.stringify({ l: String(d.list || '').slice(0, 80), w: w.map(function (x) { return [x[3], x[2], x[1], x[2] ? '' : x[4]]; }) }), 6000);
}

/* ---- Summary tab (pure: takes the Results rows, returns what to write) ---- */
// a time the Sheet turned into a clock time (rows saved before 2026-11-21): 5:27 came back as 1899-12-31 05:27
function sheetTimeText(t) {
  var m = String(t instanceof Date ? t.toISOString() : t || '').match(/^(1899|1900)-(\d\d)-(\d\d)T(\d\d):(\d\d):(\d\d)/);
  if (!m) return t;
  var days = Math.round((Date.UTC(+m[1], +m[2] - 1, +m[3]) - Date.UTC(1899, 11, 31)) / 864e5), a = days * 24 + +m[4], b = +m[5], c = +m[6];
  return c ? a + ':' + ('0' + b).slice(-2) + ':' + ('0' + c).slice(-2) : a + ':' + ('0' + b).slice(-2);
}
function secondsOf(t) {
  var p = String(sheetTimeText(t) || '').split(':').map(Number);
  if (p.some(isNaN) || !p.length) return null;
  return p.reduce(function (a, b) { return a * 60 + b; }, 0);
}
function summaryData(results) {
  var groups = {}, order = [], answerOf = {};
  var C = { student: rc_('Student'), label: rc_('Assignment'), puzzle: rc_('Puzzle'), code: rc_('Puzzle code'), time: rc_('Time'),
            score: rc_('Score'), status: rc_('Status'), wd: rc_('Word data (used by the Summary tab)') };
  results.forEach(function (r, i) {
    var wd = null; try { wd = r[C.wd] ? JSON.parse(String(r[C.wd]).replace(/^'/, '')) : null; } catch (e) { wd = null; }
    if (wd && wd.w) wd.w.forEach(function (x) { if (x[1] && x[0] >= 0) answerOf[wd.l + '|' + x[0]] = x[2]; });
    var key = (String(r[C.code] || '').trim() || String(r[C.puzzle] || '').trim()) + '|' + String(r[C.label] || '').trim();
    if (!groups[key]) { groups[key] = { label: String(r[C.label] || '').trim(), puzzle: String(r[C.puzzle] || ''), code: String(r[C.code] || ''), by: {}, last: 0 }; order.push(key); }
    var g = groups[key];
    g.by[String(r[C.student]).toLowerCase()] = { row: r, wd: wd };
    g.last = i; // rows are added in time order, so a later row is newer
  });
  var assignRows = [], wordRows = [];
  order.slice().sort(function (a, b) { return groups[b].last - groups[a].last; }).forEach(function (key) {
    var g = groups[key], students = Object.keys(g.by).map(function (k) { return g.by[k]; });
    var pcts = [], all = 0, early = 0, secs = [], words = {};
    students.forEach(function (s) {
      var m = String(s.row[C.score] || '').match(/(\d+)\s*of\s*(\d+)/);
      if (m && +m[2]) { pcts.push(+m[1] / +m[2]); if (+m[1] === +m[2]) all++; }
      if (s.row[C.status] === 'Turned in early' || s.row[C.status] === 'Time ran out') early++;
      var sec = secondsOf(s.row[C.time]); if (sec !== null) secs.push(sec);
      if (s.wd && s.wd.w) s.wd.w.forEach(function (x) {
        var k = s.wd.l + '|' + x[0];
        var o = words[k] = words[k] || { list: s.wd.l, n: x[0], seen: 0, missed: 0, clue: '' };
        o.seen++; if (!x[1]) { o.missed++; if (x[3]) o.clue = x[3]; }
      });
    });
    var ranked = Object.keys(words).map(function (k) { return words[k]; }).filter(function (o) { return o.missed; })
      .sort(function (a, b) { return b.missed / b.seen - a.missed / a.seen || b.missed - a.missed; });
    var nameOf = function (o) { var a = answerOf[o.list + '|' + o.n]; return a || ('"' + o.clue + '" (no one got it yet)'); };
    var avg = function (a) { return a.reduce(function (x, y) { return x + y; }, 0) / a.length; };
    assignRows.push([
      g.label || '(no label)', g.puzzle, g.code, students.length,
      pcts.length ? Math.round(avg(pcts) * 100) + '%' : '',
      all, early, secs.length ? mmss(avg(secs)) : '',
      ranked.slice(0, 3).map(function (o) { return nameOf(o) + ' (' + o.missed + ' of ' + o.seen + ')'; }).join('; ')
    ]);
    ranked.slice(0, 10).forEach(function (o) {
      wordRows.push([g.label || '(no label)', g.code, nameOf(o), o.missed, o.seen, Math.round(o.missed / o.seen * 100) + '%']);
    });
  });
  return {
    assignHeaders: ['Assignment', 'Puzzle', 'Puzzle code', 'Students', 'Average score', 'Got every word', 'Turned in early / time ran out', 'Average time', 'Most-missed words'],
    assignRows: assignRows,
    wordHeaders: ['Assignment', 'Puzzle code', 'Word', 'Missed', 'Out of', '% missed'],
    wordRows: wordRows
  };
}

/* ---- saved progress, so a student can finish on another device ---- */
// one row per student + puzzle; the name is matched the same way as at sign-in
function progressIndex(progRows, rosterRows, period, name, key) {
  var real = rosterName(rosterRows, period, name);
  var who = normName(real === null ? name : real), per = normPeriod(period), k = String(key || '').slice(0, 80);
  for (var i = 0; i < progRows.length; i++) {
    var r = progRows[i];
    if (normPeriod(r[1]) === per && normName(r[2]) === who && String(r[3]) === k) return i;
  }
  return -1;
}
function progressGet(progRows, rosterRows, period, name, key) {
  var i = progressIndex(progRows, rosterRows, period, name, key);
  if (i < 0) return { ok: true, found: false };
  var r = progRows[i];
  return { ok: true, found: true, started: Number(r[4]) || 0, elapsed: Number(r[5]) || 0, letters: String(r[6] || ''),
           away: Number(r[7]) || 0, awaySec: Number(r[8]) || 0, done: r[9] === true || String(r[9]).toUpperCase() === 'TRUE' || r[9] === 'Yes',
           devices: String(r[10] || '').split(',').filter(String), score: String(r[11] || '') };
}
function progressPut(progRows, rosterRows, d, now) {
  var i = progressIndex(progRows, rosterRows, d.period, d.student, d.key), old = i >= 0 ? progRows[i] : null;
  var real = rosterName(rosterRows, d.period, d.student);
  var devices = old ? String(old[10] || '').split(',').filter(String) : [];
  var dev = String(d.device || '').replace(/[^a-z0-9]/gi, '').slice(0, 12);
  if (dev && devices.indexOf(dev) < 0) devices.push(dev);
  var started = Number(d.started) || 0;
  if (old && Number(old[4]) && (!started || Number(old[4]) < started)) started = Number(old[4]); // the first start counts
  var wasDone = old && (old[9] === true || String(old[9]).toUpperCase() === 'TRUE' || old[9] === 'Yes');
  var row = [
    now, safeCell(d.period, 20), safeCell(real === null ? d.student : real, 60), String(d.key || '').slice(0, 80).replace(/^[=+\-@]/, "'"),
    started, Math.max(Number(d.elapsed) || 0, old ? Number(old[5]) || 0 : 0),
    mergeLetters(old && d.merge ? String(old[6] || '') : '', String(d.letters || '').toUpperCase().replace(/[^A-Z.]/g, '').slice(0, 4000)),
    Math.max(Number(d.away) || 0, old ? Number(old[7]) || 0 : 0), Math.max(Number(d.awaySec) || 0, old ? Number(old[8]) || 0 : 0),
    wasDone || !!d.done, devices.slice(0, 20).join(','), safeCell(d.score || (old ? old[11] : '') || '', 12)
  ];
  return { index: i, row: row };
}
// when the device couldn't load saved work first, keep the Sheet's letters wherever the device's square is empty
function mergeLetters(saved, now) {
  if (!saved || saved.length !== now.length) return now;
  var out = '';
  for (var i = 0; i < now.length; i++) out += now.charAt(i) === '.' ? saved.charAt(i) : now.charAt(i);
  return out;
}
