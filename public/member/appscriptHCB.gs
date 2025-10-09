
/**
 * Hourly CSV import from:
 * https://hcb.hackclub.com/donations/export.csv?event=austin-ieee-ras
 *
 * Auth via cookie header: SESSION_TOKEN=<value>
 * - Stores URL & cookie in a "HCBImportConfig" sheet (A1:B*)
 * - If server returns a new SESSION_TOKEN in Set-Cookie, updates the sheet
 * - ETag/Last-Modified used to skip unchanged downloads
 *
 * After pasting this, run fetchAndImport() once to create the HCBImportConfig sheet.
 * Then paste your token into HCBImportConfig!B2. Finally, add an hourly time trigger.
 */

function fetchAndImport() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const cfg = ensureConfig_(ss);

  const sheetName = cfg.sheetName || 'Import';
  const url = cfg.url;
  const cookieName = cfg.cookieName || 'SESSION_TOKEN';
  const cookieValue = cfg.cookieValue || '';

  if (!url) throw new Error('HCBImportConfig!B1 (CSV_URL) is empty.');
  if (!cookieValue) throw new Error('HCBImportConfig!B2 (SESSION_TOKEN) is empty. Paste your token there.');

  const props = PropertiesService.getScriptProperties();
  const etagKey = 'ETAG_' + url;
  const lmKey   = 'LAST_MODIFIED_' + url;
  const prevEtag = props.getProperty(etagKey);
  const prevLM   = props.getProperty(lmKey);

  const headers = {
    'Cookie': cookieName + '=' + cookieValue,
    'Accept': 'text/csv, */*;q=0.8',
    ...(prevEtag ? {'If-None-Match': prevEtag} : {}),
    ...(prevLM   ? {'If-Modified-Since': prevLM} : {}),
  };

  const res = UrlFetchApp.fetch(url, {
    method: 'get',
    headers,
    muteHttpExceptions: true,
    followRedirects: false,
    validateHttpsCertificates: true,
  });

  const code = res.getResponseCode();
  console.log('Response code: ' + code);
  if (code === 304) {
    console.log('Not modified; skipped.');
    return;
  }
  if (code < 200 || code >= 300) {
    throw new Error('HTTP ' + code + ': ' + safePreview_(res.getContentText()));
  }

  // Cache validators
  const h = res.getHeaders() || {};
  const etag = h['ETag'];
  const lastMod = h['Last-Modified'];
  if (etag) props.setProperty(etagKey, etag);
  if (lastMod) props.setProperty(lmKey, lastMod);

  // If server sent a new session cookie, update HCBImportConfig!B2
  const setCookie = h['Set-Cookie'] || '';
  const newToken = extractCookie_(setCookie, cookieName);
  if (newToken) {
    const updated = updateConfigCookie_(ss, newToken);
    if (updated) console.log('SESSION_TOKEN updated from Set-Cookie.');
  }

  // Get CSV text (assume UTF-8)
  const contentType = String(h['Content-Type'] || '').toLowerCase();
  const csvText = contentType.includes('application/octet-stream')
    ? Utilities.newBlob(res.getContent()).getDataAsString('UTF-8')
    : res.getContentText('UTF-8');

  // Parse CSV and write it
  const rows = Utilities.parseCsv(csvText);
  const sheet = getOrCreateSheet_(ss, sheetName);
  sheet.clearContents();
  if (rows.length) {
    const [header, ...data] = rows;
    const flipped = [header, ...data.reverse()];

    const width = Math.max(...flipped.map(r => r.length));
    const norm = flipped.map(r => r.concat(Array(Math.max(0, width - r.length)).fill('')));

    sheet.getRange(1, 1, norm.length, width).setValues(norm);
    sheet.setFrozenRows(1);
  }
  console.log(`Imported ${rows.length} rows @ ${new Date().toISOString()}`);
}

/** Create/ensure the Config sheet with sane defaults and read values */
function ensureConfig_(ss) {
  let cfg = ss.getSheetByName('HCBImportConfig');
  if (!cfg) {
    cfg = ss.insertSheet('HCBImportConfig');
    cfg.getRange('A1').setValue('CSV_URL');
    cfg.getRange('B1').setValue('https://hcb.hackclub.com/donations/export.csv?event=austin-ieee-ras');

    cfg.getRange('A2').setValue('SESSION_TOKEN');
    // Paste your token in B2 after first run
    cfg.getRange('B2').setValue('<< paste your SESSION_TOKEN here >>');

    cfg.getRange('A3').setValue('SHEET_NAME');
    cfg.getRange('B3').setValue('Import');

    cfg.getRange('A4').setValue('COOKIE_NAME');
    cfg.getRange('B4').setValue('SESSION_TOKEN');

    cfg.autoResizeColumns(1, 2);
  }
  const url = cfg.getRange('B1').getDisplayValue().trim();
  const cookieValue = cfg.getRange('B2').getDisplayValue().trim();
  const sheetName = cfg.getRange('B3').getDisplayValue().trim() || 'Import';
  const cookieName = cfg.getRange('B4').getDisplayValue().trim() || 'SESSION_TOKEN';
  return { url, cookieValue, sheetName, cookieName };
}

/** Update Config!B2 with a new SESSION_TOKEN value */
function updateConfigCookie_(ss, value) {
  const cfg = ss.getSheetByName('HCBImportConfig');
  if (!cfg) return false;
  const old = cfg.getRange('B2').getDisplayValue();
  if (old !== value) {
    cfg.getRange('B2').setValue(value);
    return true;
  }
  return false;
}

/** Extract specific cookie value from a Set-Cookie header blob */
function extractCookie_(setCookieHeader, name) {
  if (!setCookieHeader) return '';
  // Apps Script may coalesce multiple Set-Cookie headers into one string.
  // Find "name=...;" non-greedily.
  const m = new RegExp('(?:^|,\\s*)' + name.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&') + '=([^;]+)').exec(setCookieHeader);
  return m ? m[1] : '';
}

function getOrCreateSheet_(ss, name) {
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  return sh;
}

function safePreview_(s, max = 300) {
  if (!s) return '';
  s = String(s).replace(/\s+/g, ' ').trim();
  return s.length <= max ? s : (s.slice(0, max) + '…');
}

// hourly trigger

/** Optional: run once instead of using the UI */
function createHourlyTrigger() {
  ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === 'fetchAndImport')
    .forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('fetchAndImport').timeBased().everyHours(1).create();
}