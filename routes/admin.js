const express = require('express');
const db = require('../db');
const router = express.Router();

// Admin middleware
const ensureAdmin = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ success: false, error: 'Not authenticated' });
  }
  if (req.session.user.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Access denied. Admin only.' });
  }
  next();
};

// Get all users
router.get('/users', ensureAdmin, async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, username, email, role, xp, created_at FROM users ORDER BY created_at DESC'
    );
    res.json({ success: true, users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, error: 'Error loading users' });
  }
});

// Promote user to admin
router.post('/users/:id/promote', ensureAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    await db.query("UPDATE users SET role = 'admin' WHERE id = ?", [userId]);
    res.json({ success: true, message: 'User promoted to admin' });
  } catch (error) {
    console.error('Error promoting user:', error);
    res.status(500).json({ success: false, error: 'Error promoting user' });
  }
});

// Demote admin to user
router.post('/users/:id/demote', ensureAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Prevent demoting yourself
    if (parseInt(userId) === req.session.user.id) {
      return res.status(400).json({ success: false, error: 'Cannot demote yourself' });
    }
    
    await db.query("UPDATE users SET role = 'user' WHERE id = ?", [userId]);
    res.json({ success: true, message: 'Admin demoted to user' });
  } catch (error) {
    console.error('Error demoting user:', error);
    res.status(500).json({ success: false, error: 'Error demoting user' });
  }
});

// Delete user
router.delete('/users/:id', ensureAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Prevent deleting yourself
    if (parseInt(userId) === req.session.user.id) {
      return res.status(400).json({ success: false, error: 'Cannot delete yourself' });
    }
    
    await db.query('DELETE FROM users WHERE id = ?', [userId]);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ success: false, error: 'Error deleting user' });
  }
});

// Get all debug challenges
router.get('/debug-challenges', ensureAdmin, async (req, res) => {
  try {
    const [challenges] = await db.query(
      'SELECT * FROM debug_challenges ORDER BY id'
    );
    res.json({ success: true, challenges });
  } catch (error) {
    console.error('Error fetching debug challenges:', error);
    res.status(500).json({ success: false, error: 'Error loading challenges' });
  }
});

// Add debug challenge
router.post('/debug-challenges', ensureAdmin, async (req, res) => {
  try {
    const { title, description, starter_code, expected_output, points } = req.body;
    
    await db.query(
      'INSERT INTO debug_challenges (title, description, starter_code, expected_output, points) VALUES (?, ?, ?, ?, ?)',
      [title, description, starter_code, expected_output, points || 15]
    );
    
    res.json({ success: true, message: 'Challenge added successfully' });
  } catch (error) {
    console.error('Error adding challenge:', error);
    res.status(500).json({ success: false, error: 'Error adding challenge' });
  }
});

// Delete debug challenge
router.delete('/debug-challenges/:id', ensureAdmin, async (req, res) => {
  try {
    const challengeId = req.params.id;
    await db.query('DELETE FROM debug_challenges WHERE id = ?', [challengeId]);
    res.json({ success: true, message: 'Challenge deleted successfully' });
  } catch (error) {
    console.error('Error deleting challenge:', error);
    res.status(500).json({ success: false, error: 'Error deleting challenge' });
  }
});

// Get all logic circuits
router.get('/logic-circuits', ensureAdmin, async (req, res) => {
  try {
    const [circuits] = await db.query(
      'SELECT * FROM logic_circuits ORDER BY id'
    );
    res.json({ success: true, circuits });
  } catch (error) {
    console.error('Error fetching circuits:', error);
    res.status(500).json({ success: false, error: 'Error loading circuits' });
  }
});

// Add logic circuit
router.post('/logic-circuits', ensureAdmin, async (req, res) => {
  try {
    const { title, description, available_gates, correct_sequence, expected_output, points } = req.body;
    
    await db.query(
      'INSERT INTO logic_circuits (title, description, available_gates, correct_sequence, expected_output, points) VALUES (?, ?, ?, ?, ?, ?)',
      [title, description, JSON.stringify(available_gates), JSON.stringify(correct_sequence), JSON.stringify(expected_output), points || 20]
    );
    
    res.json({ success: true, message: 'Circuit added successfully' });
  } catch (error) {
    console.error('Error adding circuit:', error);
    res.status(500).json({ success: false, error: 'Error adding circuit' });
  }
});

// Delete logic circuit
router.delete('/logic-circuits/:id', ensureAdmin, async (req, res) => {
  try {
    const circuitId = req.params.id;
    await db.query('DELETE FROM logic_circuits WHERE id = ?', [circuitId]);
    res.json({ success: true, message: 'Circuit deleted successfully' });
  } catch (error) {
    console.error('Error deleting circuit:', error);
    res.status(500).json({ success: false, error: 'Error deleting circuit' });
  }
});

// Get leaderboard stats
router.get('/leaderboard-stats', ensureAdmin, async (req, res) => {
  try {
    const [stats] = await db.query(`
      SELECT 
        COUNT(DISTINCT user_id) as total_players,
        COUNT(*) as total_games_played,
        SUM(score) as total_points,
        AVG(score) as avg_score
      FROM scores
    `);
    
    res.json({ success: true, stats: stats[0] });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, error: 'Error loading stats' });
  }
});

// Reset leaderboard
router.post('/leaderboard/reset', ensureAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM scores');
    res.json({ success: true, message: 'Leaderboard reset successfully' });
  } catch (error) {
    console.error('Error resetting leaderboard:', error);
    res.status(500).json({ success: false, error: 'Error resetting leaderboard' });
  }
});

// Get platform stats
router.get('/stats', ensureAdmin, async (req, res) => {
  try {
    const [userCount] = await db.query('SELECT COUNT(*) as count FROM users');
    const [adminCount] = await db.query("SELECT COUNT(*) as count FROM users WHERE role = 'admin'");
    const [debugCount] = await db.query('SELECT COUNT(*) as count FROM debug_challenges');
    const [circuitCount] = await db.query('SELECT COUNT(*) as count FROM logic_circuits');
    const [scoreCount] = await db.query('SELECT COUNT(*) as count FROM scores');
    
    res.json({
      success: true,
      stats: {
        totalUsers: userCount[0].count,
        totalAdmins: adminCount[0].count,
        debugChallenges: debugCount[0].count,
        logicCircuits: circuitCount[0].count,
        totalScores: scoreCount[0].count
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, error: 'Error loading stats' });
  }
});

module.exports = router;