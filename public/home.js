// Homepage specific JavaScript
document.addEventListener('DOMContentLoaded', async () => {
  await checkAuthForHome();
  addScrollAnimations();
});

// Check authentication and update buttons
async function checkAuthForHome() {
  try {
  const response = await fetch('/api/auth/check', { credentials: 'same-origin' });
    const data = await response.json();
    
    const heroButtons = document.getElementById('heroButtons');
    const ctaButtons = document.getElementById('ctaButtons');
    
    if (data.authenticated) {
      // Logged in user
      const loggedInHTML = `
        <a href="/profile" class="btn btn-secondary">My Profile</a>
      `;
      heroButtons.innerHTML = loggedInHTML;
      ctaButtons.innerHTML = loggedInHTML;
    } else {
      // Guest user
      const guestHTML = `
        <a href="/register" class="btn btn-primary">Get Started Free</a>
        <a href="/login" class="btn btn-secondary">Login</a>
      `;
      heroButtons.innerHTML = guestHTML;
      ctaButtons.innerHTML = guestHTML;
    }
  } catch (error) {
    console.error('Error checking auth:', error);
  }
}

// Add scroll animations
function addScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  // Observe feature cards
  document.querySelectorAll('.feature-card-modern').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'opacity 0.6s, transform 0.6s';
    observer.observe(card);
  });

  // Observe step cards
  document.querySelectorAll('.step-card').forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = `opacity 0.6s ${index * 0.2}s, transform 0.6s ${index * 0.2}s`;
    observer.observe(card);
  });
}