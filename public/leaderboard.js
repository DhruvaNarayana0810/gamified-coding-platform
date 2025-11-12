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
        <li><span class="xp-badge">${data.user.xp} XP</span></li>
        <li><a href="#" onclick="logout(event)" class="btn btn-small">Logout</a></li>
      `;
    } else {
      authLinks.innerHTML = `
        <li><a href="/login">Login</a></li>
        <li><a href="/register" class="btn btn-small btn-primary">Sign Up</a></li>
      `;
    }
    
    loadLeaderboard();
  } catch (error) {
    console.error('Error checking auth:', error);
    loadLeaderboard();
  }
}

// Logout
async function logout(event) {
  event.preventDefault();
  const response = await fetch('/api/auth/logout', { method: 'POST' });
  if (response.ok) window.location.href = '/';
}

// Load global leaderboard
async function loadLeaderboard() {
  try {
    // The server-mounted combined leaderboard is at /api/leaderboard
    const response = await fetch('/api/leaderboard');
    const data = await response.json();

    if (data.success) {
      const leaderboardDiv = document.getElementById('globalLeaderboard');

      const rows = data.leaderboard || data.users || [];
      if (rows.length === 0) {
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

      rows.forEach((player, index) => {
        const isCurrentUser = currentUser && player.username === currentUser.username;
        let rankDisplay;

        if (index === 0) rankDisplay = '<span class="rank-medal">🥇</span>';
        else if (index === 1) rankDisplay = '<span class="rank-medal">🥈</span>';
        else if (index === 2) rankDisplay = '<span class="rank-medal">🥉</span>';
        else rankDisplay = index + 1;

        const lastPlayed = player.last_played ? new Date(player.last_played).toLocaleDateString() : '-';

        html += `
          <tr class="${isCurrentUser ? 'current-user-row' : ''}">
            <td class="rank-col">${rankDisplay}</td>
            <td>
              ${player.username}
              ${isCurrentUser ? '<span class="you-badge-games">(You)</span>' : ''}
            </td>
            <td><strong>${player.total_score || player.total_score === 0 ? player.total_score : (player.game_score || 0) + (player.challenge_xp || 0)}</strong></td>
            <td>${player.games_played || 0}</td>
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