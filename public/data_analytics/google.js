// google.js: Google Sheets OAuth, fetch, and SQLite storage
// Configuration
const CLIENT_ID      = '870859736141-55te8a4l8sgib6rebsjdtbdm5r49id2i.apps.googleusercontent.com';
const SCOPES         = 'https://www.googleapis.com/auth/spreadsheets.readonly https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile';
const SPREADSHEET_ID = '1v96ZcdqsoDt3PHxwbSESGz9hcXn30nmuy2LNpLgCd0o';
const RANGE          = 'RawFormData!A:ZZ';
// Local storage keys
const TOKEN_KEY      = 'sheets_access_token';
const EXPIRY_KEY     = 'sheets_token_expiry';

let tokenClient;
let accessToken = null;
let chart;

// Initialize Google OAuth client and bind UI
function initApp() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: resp => {
      if (resp.error) return console.error(resp);
      accessToken = resp.access_token;
      const expiry = Date.now() + resp.expires_in * 1000;
      localStorage.setItem(TOKEN_KEY, accessToken);
      localStorage.setItem(EXPIRY_KEY, expiry);
      updateUI(true);
      fetchGoogleUserInfo();
    }
  });

  // Try existing token
  const savedToken = localStorage.getItem(TOKEN_KEY);
  const savedExpiry = localStorage.getItem(EXPIRY_KEY);
  if (savedToken && savedExpiry && Date.now() < parseInt(savedExpiry, 10)) {
    accessToken = savedToken;
    updateUI(true);
    fetchGoogleUserInfo();
  }

  document.getElementById('signin').onclick = () => tokenClient.requestAccessToken({ prompt: 'consent' });
  document.getElementById('signout').onclick = signOut;
  document.getElementById('load').onclick = fetchSheet;
}

// Show/hide buttons based on sign-in state
function updateUI(signedIn) {
  document.getElementById('signin').hidden = signedIn;
  document.getElementById('signout').hidden = !signedIn;
  document.getElementById('load').disabled = !signedIn;
}

// Sign out user
function signOut() {
  if (accessToken) {
    google.accounts.oauth2.revoke(accessToken, () => {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(EXPIRY_KEY);
      accessToken = null;
      updateUI(false);
      document.getElementById('table-container').innerHTML = '';
      document.getElementById('google-user-info').classList.add('hidden');
      if (chart) chart.destroy();
    });
  }
}

// Fetch Google user profile
async function fetchGoogleUserInfo() {
  if (!accessToken) return;
  try {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (!response.ok) throw new Error('Failed to fetch Google user info');
    const data = await response.json();
    document.getElementById('google-user-info').classList.remove('hidden');
    document.getElementById('google-user-name').textContent =
      `${data.name || 'Google User'} (${data.email || 'No email'})`;
    if (data.picture) {
      document.getElementById('google-user-pic').src = data.picture;
    }
  } catch (e) {
    console.error('Error fetching Google user info:', e);
  }
}

// Fetch spreadsheet values and store in SQLite
// Tables are pre-created in sqlite.js
function fetchSheet() {
  if (!accessToken) return;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(RANGE)}`;
  fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } })
    .then(res => res.json())
    .then(data => {
      const rows = data.values || [];
      storeDataInDb(rows);
     if (window.saveDb) window.saveDb();
    })
    .catch(console.error);
}

// Store sheet rows into user_info, resumes, attendance tables
function storeDataInDb(rows) {
  if (!rows.length) return;
  // optional: const headers = rows[0];
  rows.slice(1).forEach(row => {
    const timestamp = row[0] || '';
    const eid = row[1] || '';
    const firstname = row[3] || '';
    const resumelink = row[20] || '';
    const column17 = row[17] || '';
    const dateOfAttendance = row[18] || '';

    // User info - if has first name
    if (firstname.trim()) {
      const lastname = row[4] || '';
      const email = row[5] || '';
      const dues = (row[6] || '').toLowerCase() === 'yes';
      const discord = (row[7] || '').toLowerCase() === 'yes';
      const waiver = (row[8] || '').toLowerCase() === 'yes';
      const committeeInterest = row[9] || '';
      const major = row[10] || '';
      const minor = row[11] || '';
      const gradSemRaw = row[13] || '';
      const gender = row[14] || '';
      const hispanicLatino = (row[15] || '').toLowerCase() === 'yes';
      const race = row[16] || '';

      // Parse graduation semester
      let gradSem = null;
      if (/^\d{4}$/.test(gradSemRaw)) {
        gradSem = parseFloat(gradSemRaw) + 0.9;
      } else if (/^Fa(\d{2})$/.test(gradSemRaw)) {
        gradSem = 2000 + parseFloat(RegExp.$1) + 0.9;
      } else if (/^Sp(\d{2})$/.test(gradSemRaw)) {
        gradSem = 2000 + parseFloat(RegExp.$1) + 0.2;
      }

      db.run(`INSERT OR REPLACE INTO user_info VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [
        eid, timestamp, firstname, lastname, email, dues, discord, waiver,
        committeeInterest, major, minor, gradSem, gender, hispanicLatino, race
      ]);
    }

    // Resumes - if has resume link
    if (resumelink.trim()) {
      db.run(`INSERT OR REPLACE INTO resumes VALUES (?,?,?)`, [eid, timestamp, resumelink]);
    }

    // Attendance - if has column 17
    if (column17.trim()) {
      const event = column17.trim();
      const attendanceDate = dateOfAttendance.trim();
      db.run(`INSERT OR REPLACE INTO attendance VALUES (?,?,?,?)`, [eid, timestamp, event, attendanceDate]);
    }
  });
}

// Execute a SQL query and return result
function runQuery(sql) {
  try { return db.exec(sql); } catch (e) { console.error(e); return null; }
}

export { initApp };