/*
const apiBaseUrl = window.LUMINA_API_BASE_URL || 'http://localhost:4000';

const authView = document.getElementById('auth-view');
const dashboardView = document.getElementById('dashboard-view');
const loginForm = document.getElementById('login-form');
const feedbackEl = document.getElementById('login-feedback');
const logoutBtn = document.getElementById('logout-btn');
const loadingIndicator = document.getElementById('loading-indicator');
const errorBanner = document.getElementById('error-banner');
const tableWrapper = document.querySelector('.table-wrapper');
const tableBody = document.querySelector('#bookings-table tbody');
const emptyState = document.getElementById('empty-state');
const statusFilter = document.getElementById('status-filter');
const paymentFilter = document.getElementById('payment-filter');
const emailSearch = document.getElementById('search-email');

let authToken = localStorage.getItem('lumina_admin_token') || '';

function showAuthView() {
  authView.hidden = false;
  dashboardView.hidden = true;
  feedbackEl.textContent = '';
  loginForm.reset();
}

function showDashboard() {
  authView.hidden = true;
  dashboardView.hidden = false;
}

async function request(path, options = {}) {
  const url = `${apiBaseUrl}${path}`;
  const headers = new Headers(options.headers || {});

  if (authToken) {
    headers.set('Authorization', `Bearer ${authToken}`);
  }

  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = `${response.status} ${response.statusText}`;
    try {
      const data = await response.json();
      if (data?.message) message = data.message;
    } catch (_) {
      // ignore
    }
    throw new Error(message);
  }

  if (response.status === 204) return null;

  const contentType = response.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    return response.json();
  }
  return response.text();
}

function renderStatusPill(status) {
  const pill = document.createElement('span');
  pill.className = `status-pill ${status.toLowerCase()}`;
  pill.textContent = status.toLowerCase();
  return pill.outerHTML;
}

function renderRow(booking) {
  const tr = document.createElement('tr');
  const checkIn = new Date(booking.checkIn).toLocaleDateString();
  const checkOut = new Date(booking.checkOut).toLocaleDateString();
  const created = new Date(booking.createdAt).toLocaleString();

  tr.innerHTML = `
    <td data-label="Booking ID">#${booking.id}</td>
    <td data-label="Guest">${booking.customerName || '—'}</td>
    <td data-label="Contact">${booking.customerEmail}<br>${booking.customerPhone || ''}</td>
    <td data-label="Room">${booking.room?.name || 'N/A'}</td>
    <td data-label="Dates">${checkIn} → ${checkOut}</td>
    <td data-label="Guests">${booking.guests || 1}</td>
    <td data-label="Status">${renderStatusPill(booking.status || 'PENDING')}</td>
    <td data-label="Payment">${renderStatusPill(booking.paymentStatus || 'UNPAID')}</td>
    <td data-label="Created">${created}</td>
  `;

  return tr;
}

async function loadBookings() {
  errorBanner.classList.remove('visible');
  loadingIndicator.hidden = false;
  tableWrapper.hidden = true;
  emptyState.hidden = true;
  tableBody.innerHTML = '';

  const query = new URLSearchParams();
  if (statusFilter.value) query.set('status', statusFilter.value);
  if (paymentFilter.value) query.set('paymentStatus', paymentFilter.value);
  if (emailSearch.value) query.set('email', emailSearch.value.trim());

  try {
    const bookings = await request(`/api/v1/admin/bookings?${query.toString()}`);

    if (!bookings.length) {
      emptyState.hidden = false;
      return;
    }

    bookings.forEach((booking) => {
      tableBody.appendChild(renderRow(booking));
    });
    tableWrapper.hidden = false;
  } catch (error) {
    errorBanner.textContent = error.message || 'Unable to load bookings';
    errorBanner.classList.add('visible');
  } finally {
    loadingIndicator.hidden = true;
  }
}

async function handleLogin(event) {
  event.preventDefault();
  const formData = new FormData(loginForm);
  const payload = Object.fromEntries(formData.entries());

  if (!payload.email || !payload.password) {
    feedbackEl.textContent = 'Please provide both email and password.';
    feedbackEl.className = 'feedback error';
    return;
  }

  loginForm.querySelector('button[type="submit"]').disabled = true;
  feedbackEl.textContent = 'Signing in...';
  feedbackEl.className = 'feedback';

  try {
    const data = await request('/api/v1/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    authToken = data.token;
    localStorage.setItem('lumina_admin_token', authToken);
    showDashboard();
    await loadBookings();
  } catch (error) {
    feedbackEl.textContent = error.message || 'Login failed. Please try again.';
    feedbackEl.className = 'feedback error';
  } finally {
    loginForm.querySelector('button[type="submit"]').disabled = false;
  }
}

function handleLogout() {
  authToken = '';
  localStorage.removeItem('lumina_admin_token');
  showAuthView();
}

statusFilter.addEventListener('change', loadBookings);
paymentFilter.addEventListener('change', loadBookings);
emailSearch.addEventListener('input', () => {
  clearTimeout(emailSearch._debounce);
  emailSearch._debounce = setTimeout(loadBookings, 400);
});

loginForm.addEventListener('submit', handleLogin);
logoutBtn.addEventListener('click', handleLogout);

(async function init() {
  if (authToken) {
    try {
      showDashboard();
      await loadBookings();
      return;
    } catch (error) {
      console.warn('Stored token invalid; clearing.', error);
      handleLogout();
    }
  }
  showAuthView();
})();
*/
