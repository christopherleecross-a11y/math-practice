/**
 * Crossword class sheet — STARTER (leave this file as it is)
 *
 * This short script loads the real script from Mr. Cross's site every time it runs, so updates arrive by
 * themselves: no pasting, no redeploying. It checks the site at most every 10 minutes and keeps a backup copy
 * of the last good version here, so it keeps working if the site can't be reached.
 * Menu: Crossword > Check for updates now (uses the newest copy right away and shows which version is running).
 *
 * The real script's instructions and settings are in the file on the site:
 *   https://christopherleecross-a11y.github.io/math-practice/scripts/crossword-sheet.gs
 */
var STARTER_SRC = 'https://christopherleecross-a11y.github.io/math-practice/scripts/crossword-sheet.gs';
var STARTER_MARK = 'Crossword class sheet'; // only a file with this in it is used
var STARTER_MINUTES = 10;

function starterZip_(s) { return Utilities.base64Encode(Utilities.gzip(Utilities.newBlob(s, 'text/plain')).getBytes()); }
function starterUnzip_(z) { return Utilities.ungzip(Utilities.newBlob(Utilities.base64Decode(z), 'application/x-gzip')).getDataAsString('UTF-8'); }
// keep a copy that started cleanly, for when the site can't be reached (Script properties hold 9 KB per value)
function starterSaveBackup_(z) {
  try {
    var props = PropertiesService.getScriptProperties();
    var hash = Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, z));
    if (props.getProperty('starter:hash') === hash) return;
    var parts = {}, n = Math.ceil(z.length / 8000);
    for (var i = 0; i < n; i++) parts['starter:' + i] = z.slice(i * 8000, (i + 1) * 8000);
    parts['starter:n'] = String(n); parts['starter:hash'] = hash; parts['starter:saved'] = new Date().toISOString();
    props.setProperties(parts);
  } catch (e) {}
}
function starterBackup_() {
  var props = PropertiesService.getScriptProperties(), n = Number(props.getProperty('starter:n')) || 0, z = '';
  for (var i = 0; i < n; i++) z += props.getProperty('starter:' + i) || '';
  return n ? starterUnzip_(z) : '';
}
// the newest good copy: from the 10-minute cache, else the site, else the backup kept in Script properties
function starterCode_(fresh) {
  var cache = CacheService.getScriptCache(), z = fresh ? null : cache.get('starter:code');
  if (z) return { code: starterUnzip_(z), from: 'cache' };
  var code = '', why = '';
  try {
    var r = UrlFetchApp.fetch(STARTER_SRC + '?t=' + Math.floor(Date.now() / 60000), { muteHttpExceptions: true });
    var t = r.getResponseCode() === 200 ? r.getContentText() : '';
    if (!t) why = 'the site answered ' + r.getResponseCode();
    else if (t.indexOf(STARTER_MARK) < 0) why = 'the file on the site doesn’t look right';
    else { new Function(t); code = t; } // a copy with a typo in it is never used
  } catch (e) { why = String(e && e.message || e); }
  if (code) {
    z = starterZip_(code);
    try { cache.put('starter:code', z, STARTER_MINUTES * 60); } catch (e) {}
    return { code: code, z: z, from: 'site' };
  }
  var b = starterBackup_();
  if (!b) throw new Error('Couldn’t load the script (' + why + ') and there is no backup copy yet.');
  try { cache.put('starter:code', starterZip_(b), 300); } catch (e) {} // try the site again in 5 minutes
  return { code: b, from: 'backup (' + why + ')' };
}

// Placeholders: the real script replaces every one of these when it loads.
function starterDown_(name) {
  var msg = 'Crossword class sheet couldn’t load (' + (STARTER_ERROR || 'unknown problem') + '), so "' + name + '" can’t run right now. Try again in a few minutes.';
  try { SpreadsheetApp.getActive().toast(msg, 'Script', 10); } catch (e) {}
  throw new Error(msg);
}
function doGet(e) { return ContentService.createTextOutput(JSON.stringify({ ok: false, error: 'The Sheet’s script couldn’t load: ' + STARTER_ERROR })).setMimeType(ContentService.MimeType.JSON); }
function doPost(e) { return doGet(e); }
function onOpen() { SpreadsheetApp.getUi().createMenu('Crossword').addItem('Check for updates now', 'checkForUpdatesNow').addToUi(); }
function connectTeacherPage() { return starterDown_('connectTeacherPage'); }
function refreshSummary() { return starterDown_('refreshSummary'); }
function setup() { return starterDown_('setup'); }

function checkForUpdatesNow() {
  var msg;
  try {
    CacheService.getScriptCache().remove('starter:code');
    var r = starterCode_(true), m = r.code.match(/var SCRIPT_BUILD = '([^']+)'/);
    msg = 'Using version ' + (m ? m[1] : '?') + ' (from ' + r.from + ').' + (r.from === 'site' ? ' This is the newest copy.' : '');
  } catch (e) { msg = 'Couldn’t check: ' + (e && e.message || e); }
  try { SpreadsheetApp.getUi().alert(msg); } catch (e) { Logger.log(msg); }
}

// Load the real script into this one. (0, eval) runs it as if it were pasted here.
var STARTER_ERROR = '';
(function () {
  var r;
  try { r = starterCode_(false); } catch (e) { STARTER_ERROR = String(e && e.message || e); return; }
  try { (0, eval)(r.code); if (r.z) starterSaveBackup_(r.z); }
  catch (e) { // the newest copy failed while starting: use the backup instead, and don't keep the bad copy cached
    STARTER_ERROR = String(e && e.message || e);
    try { CacheService.getScriptCache().put('starter:code', starterZip_(starterBackup_() || r.code), 300); } catch (e3) {}
    try { var b = starterBackup_(); if (b && b !== r.code) { (0, eval)(b); STARTER_ERROR = ''; } } catch (e2) {}
  }
})();
