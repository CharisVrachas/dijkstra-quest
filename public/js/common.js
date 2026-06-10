/**
 * common.js – shared utilities loaded on every page.
 * Depends on: i18n.js (loaded before this file)
 */

// ── Auth helpers ──────────────────────────────────────────────────────────────

async function getMe() {
  try {
    const r = await fetch('/api/auth/me');
    return await r.json();
  } catch { return { loggedIn: false }; }
}

async function requireLogin() {
  const me = await getMe();
  if (!me.loggedIn) { window.location.href = '/login.html'; }
  return me;
}

async function redirectIfLoggedIn() {
  const me = await getMe();
  if (me.loggedIn) { window.location.href = '/dashboard.html'; }
}

async function logout() {
  await fetch('/api/auth/logout', { method: 'POST' });
  window.location.href = '/index.html';
}

// ── Navbar builder ────────────────────────────────────────────────────────────
// Each page calls buildNav(activePage) after DOM ready.

async function buildNav(activePage = '') {
  const me = await getMe();
  const nav = document.getElementById('mainNav');
  if (!nav) return;

  const link = (href, key, page) =>
    `<li class="nav-item">
       <a class="nav-link${activePage === page ? ' active' : ''}"
          href="${href}" data-i18n="${key}"></a>
     </li>`;

  let items = '';
  if (me.loggedIn) {
    items += link('/dashboard.html', 'nav.dashboard', 'dashboard');
    items += `<li class="nav-item">
                <span class="nav-link text-muted">@${me.username}</span>
              </li>`;
    items += `<li class="nav-item">
                <button class="btn btn-sm btn-outline-danger ms-2 my-1"
                        onclick="logout()" data-i18n="nav.logout"></button>
              </li>`;
  } else {
    items += link('/index.html',       'nav.dashboard',   'home');
    items += link('/leaderboard.html', 'nav.leaderboard', 'leaderboard');
    items += `<li class="nav-item">
                <a class="btn btn-sm btn-outline-primary ms-2 my-1"
                   href="/login.html" data-i18n="nav.login"></a>
              </li>`;
    items += `<li class="nav-item">
                <a class="btn btn-sm btn-primary ms-1 my-1"
                   href="/register.html" data-i18n="nav.register"></a>
              </li>`;
  }

  // Language toggle
  items += `<li class="nav-item">
              <button class="btn btn-sm btn-outline-secondary ms-2 my-1"
                      id="langToggle" data-i18n="nav.lang"
                      onclick="i18n.toggle()"></button>
            </li>`;

  nav.innerHTML = `
    <div class="container-fluid">
      <a class="navbar-brand fw-bold text-primary" href="/index.html"
         data-i18n="nav.title">Dijkstra Quest</a>
      <button class="navbar-toggler" type="button"
              data-bs-toggle="collapse" data-bs-target="#navMenu">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navMenu">
        <ul class="navbar-nav ms-auto align-items-center">${items}</ul>
      </div>
    </div>`;

  i18n.apply();
}

// ── Toast notifications ───────────────────────────────────────────────────────

function showToast(msg, type = 'success') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    container.style.zIndex = 9999;
    document.body.appendChild(container);
  }

  const id = `toast-${Date.now()}`;
  container.insertAdjacentHTML('beforeend', `
    <div id="${id}" class="toast align-items-center text-bg-${type} border-0"
         role="alert" aria-live="assertive">
      <div class="d-flex">
        <div class="toast-body">${msg}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto"
                data-bs-dismiss="toast"></button>
      </div>
    </div>`);

  const el   = document.getElementById(id);
  const toast = new bootstrap.Toast(el, { delay: 3500 });
  toast.show();
  el.addEventListener('hidden.bs.toast', () => el.remove());
}

// ── Utility ───────────────────────────────────────────────────────────────────

function fmtTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function apiPost(url, body) {
  return fetch(url, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body)
  }).then(r => r.json());
}

function apiGet(url) {
  return fetch(url).then(r => r.json());
}
