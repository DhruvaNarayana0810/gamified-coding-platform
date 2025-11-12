const express = require('express');
const db = require('../db');
const router = express.Router();

// Global leaderboard (Games Only)
router.get('/', async (req, res) => {
  try {
    const [users] = await db.query(`
      SELECT 
        u.id,
        u.username,
        COALESCE(SUM(s.score), 0) as total_score,
        COUNT(DISTINCT s.game) as games_played
      FROM users u
      LEFT JOIN scores s ON u.id = s.user_id
      GROUP BY u.id, u.username
      HAVING total_score > 0
      ORDER BY total_score DESC
      LIMIT 50
    `);

    res.json({ success: true, users });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ success: false, error: 'Error loading leaderboard' });
  }
});

module.exports = router;