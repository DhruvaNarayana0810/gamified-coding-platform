let currentUser = null;

// Check authentication
async function checkAuth() {
  try {
  const response = await fetch('/api/auth/check', { credentials: 'same-origin' });
    const data = await response.json();
    
    const authLinks = document.getElementById('authLinks');
    
    if (data.authenticated) {
      currentUser = data.user;
      authLinks.innerHTML = `
        <li><a href="/profile">Profile</a></li>
        <li><a href="#" onclick="logout(event)" class="btn btn-small">Logout</a></li>
      `;
      loadUserStats();
    } else {
      authLinks.innerHTML = `
        <li><a href="/login">Login</a></li>
        <li><a href="/register" class="btn btn-small btn-primary">Sign Up</a></li>
      `;
    }
    
    loadGlobalLeaderboard();
  } catch (error) {
    console.error('Error checking auth:', error);
  }
}

// Logout
async function logout(event) {
  event.preventDefault();
  const response = await fetch('/api/auth/logout', { method: 'POST' });
  if (response.ok) window.location.href = '/';
}

// Load user stats
async function loadUserStats() {
  try {
    const response = await fetch('/api/games/stats');
    const data = await response.json();
    
    if (data.success) {
      const statsSection = document.getElementById('userStats');
      const statsGrid = document.getElementById('statsGrid');
      
      if (data.totalStats.total_games > 0) {
        statsSection.style.display = 'block';
        
        statsGrid.innerHTML = `
          <div class="stat-card-mini">
            <div class="stat-label-mini">Total Games</div>
            <div class="stat-value-mini">${data.totalStats.total_games}</div>
          </div>
          <div class="stat-card-mini">
            <div class="stat-label-mini">Total Score</div>
            <div class="stat-value-mini">${data.totalStats.total_score}</div>
          </div>
          <div class="stat-card-mini">
            <div class="stat-label-mini">Average Score</div>
            <div class="stat-value-mini">${Math.round(data.totalStats.avg_score)}</div>
          </div>
        `;
      }
    }
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

// Load global leaderboard
async function loadGlobalLeaderboard() {
  try {
    const response = await fetch('/api/games/leaderboard');
    const data = await response.json();
    
    if (data.success) {
      const leaderboardDiv = document.getElementById('globalLeaderboard');
      
      if (data.leaderboard.length === 0) {
        leaderboardDiv.innerHTML = '<p style="text-align: center; padding: 2rem;">No scores yet. Be the first to play!</p>';
        return;
      }
      
      let html = `
        <table class="leaderboard-table-games">
          <thead>
            <tr>
              <th class="rank-col">Rank</th>
              <th>Player</th>
              <th>Total Score</th>
              <th>Games Played</th>
              <th>Last Played</th>
            </tr>
          </thead>
          <tbody>
      `;
      
      data.leaderboard.forEach((player, index) => {
        const isCurrentUser = currentUser && player.username === currentUser.username;
        let rankDisplay;
        
        if (index === 0) rankDisplay = '<span class="rank-medal">🥇</span>';
        else if (index === 1) rankDisplay = '<span class="rank-medal">🥈</span>';
        else if (index === 2) rankDisplay = '<span class="rank-medal">🥉</span>';
        else rankDisplay = index + 1;
        
        const lastPlayed = new Date(player.last_played).toLocaleDateString();
        
        html += `
          <tr class="${isCurrentUser ? 'current-user-row' : ''}">
            <td class="rank-col">${rankDisplay}</td>
            <td>
              ${player.username}
              ${isCurrentUser ? '<span class="you-badge-games">(You)</span>' : ''}
            </td>
            <td><strong>${player.total_score}</strong></td>
            <td>${player.games_played}</td>
            <td>${lastPlayed}</td>
          </tr>
        `;
      });
      
      html += `
          </tbody>
        </table>
      `;
      
      leaderboardDiv.innerHTML = html;
    }
  } catch (error) {
    console.error('Error loading leaderboard:', error);
    document.getElementById('globalLeaderboard').innerHTML = 
      '<p style="text-align: center; padding: 2rem;">Error loading leaderboard.</p>';
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', checkAuth);