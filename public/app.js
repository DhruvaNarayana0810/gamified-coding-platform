// Check authentication and update navbar
async function checkAuth() {
  try {
  const response = await fetch('/api/auth/check', { credentials: 'same-origin' });
    const data = await response.json();
    
    const authLinks = document.getElementById('authLinks');
    const heroButtons = document.getElementById('heroButtons');
    
    if (data.authenticated) {
      if (authLinks) {
        authLinks.innerHTML = `
          <li><a href="/profile">Profile</a></li>
          <li><span class="xp-badge">${data.user.xp} XP</span></li>
          <li><a href="#" onclick="logout(event)" class="btn btn-small">Logout</a></li>
        `;
      }

      // Adjust main nav: admins shouldn't see Games hub, but need Admin link
      const navLinks = document.getElementById('navLinks');
      if (navLinks) {
        // remove any existing /games links for admins
        if (data.user.role === 'admin') {
          navLinks.querySelectorAll('a[href="/games"], a[href="/games.html"]').forEach(a => {
            const li = a.closest('li'); if (li) li.remove();
          });
          // ensure admin link exists
          if (!navLinks.querySelector('a[href="/admin"]')) {
            const li = document.createElement('li');
            li.innerHTML = '<a href="/admin">Admin</a>';
            // insert admin link near the start (after Challenges)
            const first = navLinks.querySelector('li');
            if (first) navLinks.insertBefore(li, first.nextSibling);
            else navLinks.appendChild(li);
          }
        } else {
          // non-admin users: ensure Games link is present and remove Admin link if present
          if (!navLinks.querySelector('a[href="/games"], a[href="/games.html"]')) {
            const authLi = document.getElementById('authLinks');
            const li = document.createElement('li');
            li.innerHTML = '<a href="/games">Games</a>';
            if (authLi) navLinks.insertBefore(li, authLi);
            else navLinks.appendChild(li);
          }
          // remove admin link if present
          navLinks.querySelectorAll('a[href="/admin"]').forEach(a => { const li = a.closest('li'); if (li) li.remove(); });
        }
      }
      
      if (heroButtons) {
        heroButtons.innerHTML = `
          <a href="/profile" class="btn btn-secondary">My Profile</a>
        `;
      }
    } else {
      if (authLinks) {
        authLinks.innerHTML = `
          <li><a href="/login">Login</a></li>
          <li><a href="/register" class="btn btn-small btn-primary">Sign Up</a></li>
        `;
      }

      if (heroButtons) {
        heroButtons.innerHTML = `
          <a href="/register" class="btn btn-primary">Get Started</a>
          <a href="/login" class="btn btn-secondary">Login</a>
        `;
      }
    }
  } catch (error) {
    console.error('Error checking auth:', error);
  }
}

// Logout function
async function logout(event) {
  event.preventDefault();
  
  try {
    const response = await fetch('/api/auth/logout', {
      method: 'POST'
    });
    
    if (response.ok) {
      window.location.href = '/';
    }
  } catch (error) {
    console.error('Error logging out:', error);
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', checkAuth);