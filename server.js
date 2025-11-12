require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('./config/passport');
const path = require('path');
const authRoutes = require('./routes/auth');
const leaderboardRoutes = require('./routes/leaderboard');
const profileRoutes = require('./routes/profile');
const gamesRoutes = require('./routes/games');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'codequest-secret-key-2025',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Set view engine (for backward compatibility if needed)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/games', gamesRoutes);
// Admin API routes (protected)
app.use('/api/admin', adminRoutes);

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'API is working!' });
});

// Serve HTML files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});



app.get('/leaderboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'leaderboard.html'));
});

app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'profile.html'));
});

app.get('/games', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'games.html'));
});

app.get('/games/code-sprint', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'games', 'code-sprint.html'));
});

app.get('/games/debug-dash', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'games', 'debug-dash.html'));
});

app.get('/games/logic-grid', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'games', 'logic-grid.html'));
});

app.get('/games/logic-circuit', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'games', 'logic-circuit.html'));
});

// Serve admin dashboard
app.get('/admin', (req, res) => {
  // Protect admin dashboard route: only allow logged-in admins
  if (!req.session || !req.session.user || req.session.user.role !== 'admin') {
    // Not authorized — redirect to challenges
    return res.redirect('/challenges');
  }
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// 404 handler
app.use((req, res) => {
  res.status(404).send('Page not found');
});

// Start server
app.listen(PORT, () => {
  console.log(`CodeQuest server running on http://localhost:${PORT}`);
});