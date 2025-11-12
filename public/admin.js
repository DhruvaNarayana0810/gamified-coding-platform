// Client-side admin dashboard script
let currentAdmin = null;

async function checkAuthAndInit() {
  try {
    const resp = await fetch('/api/auth/check', { credentials: 'same-origin' });
    const data = await resp.json();

    if (!data.authenticated) {
      // Not logged in
      window.location.href = '/login';
      return;
    }

    currentAdmin = data.user;

    // Ensure admin role
    if (currentAdmin.role !== 'admin') {
      // Not an admin — redirect to challenges
      window.location.href = '/profile';
      return;
    }

    populateAuthLinks(currentAdmin);
    await Promise.all([loadStats(), loadUsers(), loadDebugChallenges(), loadCircuits()]);
  } catch (err) {
    console.error('Auth check failed:', err);
    window.location.href = '/login';
  }
}

function populateAuthLinks(user) {
  const authLinks = document.getElementById('authLinks');
  if (!authLinks) return;
  authLinks.innerHTML = `
    <li><a href="/profile">Profile</a></li>
    <li><span class="xp-badge">${user.xp || 0} XP</span></li>
    <li><a href="#" onclick="logout(event)" class="btn btn-small">Logout</a></li>
  `;
  // Ensure admin link present in nav (for pages that render generic nav)
  const navLinks = document.getElementById('navLinks');
  if (navLinks && !document.querySelector('a[href="/admin"]')) {
    const li = document.createElement('li');
    li.innerHTML = '<a href="/admin">Admin</a>';
    navLinks.insertBefore(li, navLinks.firstChild);
  }
}

async function loadStats() {
  try {
    const resp = await fetch('/api/admin/stats', { credentials: 'same-origin' });
    const data = await resp.json();
    if (data.success && data.stats) {
      document.getElementById('totalUsers').textContent = data.stats.totalUsers;
      document.getElementById('totalAdmins').textContent = data.stats.totalAdmins;
      document.getElementById('debugCount').textContent = data.stats.debugChallenges;
      document.getElementById('circuitCount').textContent = data.stats.logicCircuits;
    }
  } catch (err) {
    console.error('Failed to load stats', err);
  }
}

async function loadUsers() {
  try {
    const resp = await fetch('/api/admin/users', { credentials: 'same-origin' });
    const data = await resp.json();
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;
    if (!data.success || !Array.isArray(data.users)) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Error loading users</td></tr>';
      return;
    }

    if (data.users.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No users found</td></tr>';
      return;
    }

    tbody.innerHTML = '';
    data.users.forEach(user => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${user.id}</td>
        <td>${user.username}</td>
        <td>${user.email}</td>
        <td>${user.role}</td>
        <td>${user.xp || 0}</td>
        <td>${new Date(user.created_at).toLocaleDateString()}</td>
        <td>
          ${user.role !== 'admin' ? `<button class="btn btn-small" onclick="promoteUser(${user.id})">Promote</button>` : `<button class="btn btn-small" onclick="demoteUser(${user.id})">Demote</button>`}
          ${user.id !== currentAdmin.id ? `<button class="btn btn-small btn-danger" onclick="deleteUser(${user.id})">Delete</button>` : ''}
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error('Error loading users', err);
  }
}

async function promoteUser(id) {
  if (!confirm('Promote this user to admin?')) return;
  try {
    const resp = await fetch(`/api/admin/users/${id}/promote`, { method: 'POST', credentials: 'same-origin' });
    const data = await resp.json();
    if (data.success) loadUsers();
  } catch (err) { console.error(err); }
}

async function demoteUser(id) {
  if (!confirm('Demote this admin to user?')) return;
  try {
    const resp = await fetch(`/api/admin/users/${id}/demote`, { method: 'POST', credentials: 'same-origin' });
    const data = await resp.json();
    if (data.success) loadUsers();
    else alert(data.error || 'Failed');
  } catch (err) { console.error(err); }
}

async function deleteUser(id) {
  if (!confirm('Delete this user? This action cannot be undone.')) return;
  try {
    const resp = await fetch(`/api/admin/users/${id}`, { method: 'DELETE', credentials: 'same-origin' });
    const data = await resp.json();
    if (data.success) loadUsers();
    else alert(data.error || 'Failed');
  } catch (err) { console.error(err); }
}

async function loadDebugChallenges() {
  try {
    const resp = await fetch('/api/admin/debug-challenges', { credentials: 'same-origin' });
    const data = await resp.json();
    const tbody = document.getElementById('debugTableBody');
    if (!data.success) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Error loading</td></tr>';
      return;
    }
    tbody.innerHTML = '';
    data.challenges.forEach(c => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${c.id}</td>
        <td>${c.title}</td>
        <td>${c.points}</td>
        <td><button class="btn btn-small btn-danger" onclick="deleteDebug(${c.id})">Delete</button></td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) { console.error(err); }
}

async function deleteDebug(id) {
  if (!confirm('Delete this challenge?')) return;
  try {
    const resp = await fetch(`/api/admin/debug-challenges/${id}`, { method: 'DELETE', credentials: 'same-origin' });
    const data = await resp.json();
    if (data.success) loadDebugChallenges();
  } catch (err) { console.error(err); }
}

async function loadCircuits() {
  try {
    const resp = await fetch('/api/admin/logic-circuits', { credentials: 'same-origin' });
    const data = await resp.json();
    const tbody = document.getElementById('circuitTableBody');
    if (!data.success) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Error loading</td></tr>';
      return;
    }
    tbody.innerHTML = '';
    data.circuits.forEach(c => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${c.id}</td>
        <td>${c.title}</td>
        <td>${c.points}</td>
        <td><button class="btn btn-small btn-danger" onclick="deleteCircuit(${c.id})">Delete</button></td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) { console.error(err); }
}

async function deleteCircuit(id) {
  if (!confirm('Delete this circuit?')) return;
  try {
    const resp = await fetch(`/api/admin/logic-circuits/${id}`, { method: 'DELETE', credentials: 'same-origin' });
    const data = await resp.json();
    if (data.success) loadCircuits();
  } catch (err) { console.error(err); }
}

async function resetLeaderboard() {
  if (!confirm('Reset leaderboard? This will delete all scores.')) return;
  try {
    const resp = await fetch('/api/admin/leaderboard/reset', { method: 'POST', credentials: 'same-origin' });
    const data = await resp.json();
    if (data.success) alert('Leaderboard reset');
  } catch (err) { console.error(err); }
}

// Logout helper used by the nav
async function logout(event) {
  if (event) event.preventDefault();
  try {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
  } catch (err) { /* ignore */ }
  window.location.href = '/';
}

// Modal helpers for adding debug challenges
function showAddDebugModal() {
  const modal = document.getElementById('debugModal');
  if (!modal) return;
  modal.style.display = 'flex';
}

function closeDebugModal() {
  const modal = document.getElementById('debugModal');
  if (!modal) return;
  modal.style.display = 'none';
}

async function addDebugChallenge(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  const payload = {
    title: formData.get('title'),
    description: formData.get('description'),
    starter_code: formData.get('starter_code'),
    expected_output: formData.get('expected_output'),
    points: parseInt(formData.get('points'), 10) || 15
  };

  try {
    const resp = await fetch('/api/admin/debug-challenges', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await resp.json();
    if (data.success) {
      closeDebugModal();
      form.reset();
      await loadDebugChallenges();
      alert('Challenge added successfully');
    } else {
      alert(data.error || 'Failed to add challenge');
    }
  } catch (err) {
    console.error('Error adding challenge', err);
    alert('An error occurred while adding the challenge');
  }
}

// Modal helpers for adding logic circuits
function showAddCircuitModal() {
  const modal = document.getElementById('circuitModal');
  if (!modal) return;
  modal.style.display = 'flex';
}

function closeCircuitModal() {
  const modal = document.getElementById('circuitModal');
  if (!modal) return;
  modal.style.display = 'none';
}

async function addLogicCircuit(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  // available_gates and correct_sequence are simple text inputs (comma-separated or JSON)
  // Normalize inputs: allow JSON or comma-separated values for arrays
  function parseMaybeArray(input) {
    if (!input) return [];
    input = input.trim();
    if (!input) return [];
    try {
      const parsed = JSON.parse(input);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (e) {
      // not JSON; fall back to comma-separated
      return input.split(',').map(s => s.trim()).filter(Boolean);
    }
  }

  const rawGates = formData.get('available_gates') || '';
  const rawSeq = formData.get('correct_sequence') || '';
  const rawExpected = formData.get('expected_output') || '';

  const payload = {
    title: formData.get('title'),
    description: formData.get('description'),
    available_gates: parseMaybeArray(rawGates),
    correct_sequence: parseMaybeArray(rawSeq),
    expected_output: (function() {
      // try JSON first
      try { return JSON.parse(rawExpected); } catch (e) { return rawExpected; }
    })(),
    points: parseInt(formData.get('points'), 10) || 20
  };

  try {
    const resp = await fetch('/api/admin/logic-circuits', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await resp.json();
    if (data.success) {
      closeCircuitModal();
      form.reset();
      await loadCircuits();
      alert('Logic circuit added successfully');
    } else {
      alert(data.error || 'Failed to add circuit');
    }
  } catch (err) {
    console.error('Error adding circuit', err);
    alert('An error occurred while adding the circuit');
  }
}

document.addEventListener('DOMContentLoaded', checkAuthAndInit);