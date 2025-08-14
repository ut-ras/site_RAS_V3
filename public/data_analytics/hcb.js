// hcb.js: Hack Club Bank OAuth, fetch, and SQLite storage
const HCB_API_BASE = "https://hcb.hackclub.com/api/v4";
const HCB_AUTHORIZE_URL = `${HCB_API_BASE}/oauth/authorize`;
const HCB_TOKEN_URL = `${HCB_API_BASE}/oauth/token`;
const HCB_CLIENT_ID = "yt8JHmPDmmYYLUmoEiGtocYwg5fSOGCrcIY3G-vkMRs";
const HCB_REDIRECT_URI = "hcb://";
const HCB_SCOPE = "read";
const HCB_TOKEN_KEY = 'hcb_access_token';

// In-memory storage for HCB user data
let hcbUserData = null;

// Initialize HCB OAuth and bind UI
function initHCB() {
  document.getElementById('hcb-login-btn').addEventListener('click', startHCBOAuth);
  document.getElementById('hcb-logout-btn').addEventListener('click', logoutHCB);
  document.getElementById('hcb-process-btn').addEventListener('click', processHCBCallback);
  document.getElementById('hcb-sync-donations-btn').addEventListener('click', syncHCBDonations);
  updateHCBUI();
  // if already have token, fetch user info
  if (localStorage.getItem(HCB_TOKEN_KEY)) fetchHCBUser();
}

// Update UI elements based on token presence
function updateHCBUI() {
  const token = localStorage.getItem(HCB_TOKEN_KEY);
  if (token) {
    document.getElementById('hcb-login-btn').classList.add('hidden');
    document.getElementById('hcb-logout-btn').classList.remove('hidden');
    document.getElementById('hcb-paste-pane').classList.add('hidden');
    document.getElementById('hcb-api-buttons').classList.remove('hidden');
  } else {
    document.getElementById('hcb-login-btn').classList.remove('hidden');
    document.getElementById('hcb-logout-btn').classList.add('hidden');
    document.getElementById('hcb-paste-pane').classList.remove('hidden');
    document.getElementById('hcb-api-buttons').classList.add('hidden');
    document.getElementById('hcb-user-info').classList.add('hidden');
  }
}

// PKCE helpers
function base64url(buf) {
  return btoa(String.fromCharCode.apply(null, new Uint8Array(buf)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function randomString(len = 64) {
  const arr = new Uint8Array(len);
  crypto.getRandomValues(arr);
  return base64url(arr);
}
async function sha256(str) {
  const bytes = new TextEncoder().encode(str);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return base64url(digest);
}

// OAuth flow
async function startHCBOAuth() {
  const codeVerifier = randomString();
  const codeChallenge = await sha256(codeVerifier);
  sessionStorage.setItem('pkce_verifier', codeVerifier);
  const state = crypto.randomUUID();
  sessionStorage.setItem('oauth_state', state);

  const url = `${HCB_AUTHORIZE_URL}?client_id=${encodeURIComponent(HCB_CLIENT_ID)}` +
    `&redirect_uri=${encodeURIComponent(HCB_REDIRECT_URI)}` +
    `&response_type=code&scope=${encodeURIComponent(HCB_SCOPE)}` +
    `&state=${encodeURIComponent(state)}` +
    `&code_challenge=${encodeURIComponent(codeChallenge)}` +
    `&code_challenge_method=S256`;
  window.open(url, '_blank');
}

function logoutHCB() {
  localStorage.removeItem(HCB_TOKEN_KEY);
  updateHCBUI();
}

function processHCBCallback() {
  const url = document.getElementById('hcb-redirect-input').value;
  const params = new URLSearchParams(url.split('?')[1] || '');
  if (params.get('state') !== sessionStorage.getItem('oauth_state')) return alert('State mismatch');
  exchangeHCBToken(params.get('code'));
}

async function exchangeHCBToken(code) {
  const verifier = sessionStorage.getItem('pkce_verifier');
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: HCB_CLIENT_ID,
    code,
    redirect_uri: HCB_REDIRECT_URI,
    code_verifier: verifier
  });
  const res = await fetch(HCB_TOKEN_URL, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
  if (!res.ok) throw new Error('HCB token error');
  const json = await res.json();
  localStorage.setItem(HCB_TOKEN_KEY, json.access_token);
  updateHCBUI();
  fetchHCBUser();
}

// Fetch user info
async function fetchHCBUser() {
  const token = localStorage.getItem(HCB_TOKEN_KEY);
  if (!token) return;
  try {
    const res = await fetch(`${HCB_API_BASE}/user`, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error(`Fetch user failed: ${res.status} ${res.statusText}`);
    const userData = await res.json();
    // store in memory and update UI
    hcbUserData = userData;
    document.getElementById('hcb-user-info').classList.remove('hidden');
    document.getElementById('hcb-user-name').textContent = userData.name;
    document.getElementById('hcb-user-email').textContent = userData.email || '';
    if (userData.avatar) document.getElementById('hcb-user-pic').src = userData.avatar;
    updateHCBUI();
    document.getElementById('hcb-output').innerHTML = `<pre>${JSON.stringify({ name: userData.name, email: userData.email, avatar_url: userData.avatar_url }, null, 2)}</pre>`;
  } catch (e) {
    console.error(e);
    document.getElementById('hcb-output').innerHTML = `<div style="color:red;font-weight:bold;">Something went wrong.</div>`;
  }
}

async function syncHCBDonations() {
  const duesMsgRegex = /\bdues\s+([A-Za-z0-9]{2,9})\b/i;
  try {
    document.getElementById('hcb-output').textContent = 'Fetching HCB transactions...';
    const token = localStorage.getItem(HCB_TOKEN_KEY);
    const org = document.getElementById('hcb-org-input').value.trim();
    const maxPages = +document.getElementById('hcb-max-pages-input').value;
    const donations = await fetchHCBTransactions(org, maxPages);
    donations.forEach(tx => {
      if (!tx.donation) return;
      const d = tx.donation;
      const match = duesMsgRegex.exec(d.message || '');
      const eid = match
        ? match[1].toLowerCase()
        : null;

      console.log('Donation EID:', match, eid, d.message);
      // insert into DB
      db.run(
        `INSERT OR REPLACE INTO hcb_donations VALUES (?,?,?,?,?,?,?)`,
        [tx.id, d.donated_at || tx.date, d.donor?.name || '', d.donor?.email || '', tx.amount_cents, d.message || '', eid]
      );
    });
    if (window.saveDb) window.saveDb();
    document.getElementById('hcb-output').textContent = `Synced ${donations.length} donations`;
  } catch (e) {
    console.error(e);
    document.getElementById('hcb-output').innerHTML = `<div style="color:red;font-weight:bold;">Something went wrong.</div>`;
  }
}


// Fetch paginated transactions
async function fetchHCBTransactions(org, maxPages) {
  const token = localStorage.getItem(HCB_TOKEN_KEY);
  let all = [], lastId = null;
  for (let p = 1; p <= maxPages; p++) {
    const params = new URLSearchParams({ type: 'donation' });
    if (lastId) params.set('after', lastId);
    const url = `${HCB_API_BASE}/organizations/${org}/transactions?${params}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (!data.data.length) break;

    // Show progress: number fetched this page and total so far
    const pageCount = data.data.length;
    all.push(...data.data);
    const totalCount = all.length;
    document.getElementById('hcb-output').textContent =
      `Fetched ${pageCount} transactions on page ${p} (total so far: ${totalCount})`;

    lastId = data.data[data.data.length - 1].id;
    if (!data.has_more) break;
  }
  return all;
}

export { initHCB };