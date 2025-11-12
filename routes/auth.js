const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const db = require('../db');
const router = express.Router();

// Google OAuth routes
router.get('/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    prompt: 'select_account'
  })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication
    req.session.user = {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      xp: req.user.xp,
      role: req.user.role || 'user'
    };
    // Redirect admins to the admin dashboard
    if (req.user.role === 'admin') {
      return res.redirect('/admin');
    }
    res.redirect('/games');
  }
);

// Register handler
router.post('/register', async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  try {
    // Validation
    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, error: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
    }

    // Check if user exists
    const [existingUsers] = await db.query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ success: false, error: 'Username or email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const [result] = await db.query(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );

    // Set session
    req.session.user = {
      id: result.insertId,
      username,
      email,
      xp: 0,
      role: 'user'
    };

    res.json({ success: true, user: req.session.user });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, error: 'An error occurred during registration' });
  }
});

// Login handler
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  console.log('Login attempt for username:', username);

  try {
    if (!username || !password) {
      console.log('Missing credentials');
      return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    // Find user
    const [users] = await db.query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, username]
    );

    console.log('Users found:', users.length);

    if (users.length === 0) {
      console.log('User not found');
      return res.status(400).json({ success: false, error: 'Invalid credentials' });
    }

    const user = users[0];
    console.log('User found:', user.username);

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    console.log('Password valid:', validPassword);

    if (!validPassword) {
      console.log('Invalid password');
      return res.status(400).json({ success: false, error: 'Invalid credentials' });
    }

    // Set session
    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      xp: user.xp,
      role: user.role || 'user'
    };

    console.log('Session set successfully');

    res.json({ success: true, user: req.session.user });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'An error occurred during login: ' + error.message });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// Check session
router.get('/check', (req, res) => {
  if (req.session.user) {
    res.json({ authenticated: true, user: req.session.user });
  } else {
    res.json({ authenticated: false });
  }
});

module.exports = router;