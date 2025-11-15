// Check authentication
async function checkAuth() {
  try {
  const response = await fetch('/api/auth/check', { credentials: 'same-origin' });
    const data = await response.json();
    
    const authLinks = document.getElementById('authLinks');
    
    if (data.authenticated) {
      authLinks.innerHTML = `
        <li><a href="/profile">Profile</a></li>
        <li><a href="#" onclick="logout(event)" class="btn btn-small">Logout</a></li>
      `;
      loadProfile();
    } else {
      window.location.href = '/login';
    }
  } catch (error) {
    console.error('Error checking auth:', error);
    window.location.href = '/login';
  }
}

// Logout
async function logout(event) {
  event.preventDefault();
  const response = await fetch('/api/auth/logout', { method: 'POST' });
  if (response.ok) window.location.href = '/';
}

// Load profile
async function loadProfile() {
  try {
    const response = await fetch('/api/profile');
    const data = await response.json();
    
    if (data.success) {
      renderProfile(data);
    }
  } catch (error) {
    console.error('Error loading profile:', error);
    document.getElementById('profileContent').innerHTML = 
      '<p style="text-align: center;">Error loading profile.</p>';
  }
}

// Render profile
function renderProfile(data) {
  const contentDiv = document.getElementById('profileContent');
  
  let html = `
    <div class="profile-header">
      <div class="profile-avatar">
        ${data.user.username.charAt(0).toUpperCase()}
      </div>
      <div class="profile-info">
        <h1>${data.user.username}</h1>
        <p class="profile-email">${data.user.email}</p>
        <p class="profile-rank">Rank: #${data.rank}</p>
      </div>
    </div>

    <div class="profile-stats">
      <div class="stat-card">
        <div class="stat-value">${data.user.xp}</div>
        <div class="stat-label">Total XP</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${data.level}</div>
        <div class="stat-label">Level</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${data.completedChallenges}</div>
        <div class="stat-label">Games Completed</div>
      </div>
    </div>

    <div class="progress-section">
      <h3>Level Progress</h3>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${data.xpProgress}%;"></div>
      </div>
      <p class="progress-text">${data.xpProgress} / 100 XP to Level ${data.level + 1}</p>
    </div>

  `;
  
  html += '</div>';
  
  contentDiv.innerHTML = html;
}

// Initialize
document.addEventListener('DOMContentLoaded', checkAuth);

