const express = require('express');
const db = require('../db');
const router = express.Router();

// Middleware to check authentication
const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ success: false, error: 'Not authenticated' });
  }
  next();
};

// Profile data
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.session.user.id;

    // Get updated user info
    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
    const user = users[0];

    // Update session with latest XP
    req.session.user.xp = user.xp;

    // Get total game score
    const [gameScore] = await db.query(
      'SELECT COALESCE(SUM(score), 0) as total_score FROM scores WHERE user_id = ?',
      [userId]
    );

    // Get completed games count
    const [gamesCount] = await db.query(
      'SELECT COUNT(DISTINCT game) as count FROM scores WHERE user_id = ?',
      [userId]
    );

    // Get recent game submissions
    const [recentSubmissions] = await db.query(`
      SELECT 
        s.created_at as submitted_at,
        1 as is_correct,
        s.game as title,
        'Medium' as difficulty,
        s.score as xp_reward
      FROM scores s
      WHERE s.user_id = ?
      ORDER BY s.created_at DESC
      LIMIT 10
    `, [userId]);

    // Calculate level based on total score (game score only)
    const totalScore = gameScore[0].total_score;
    const level = Math.floor(totalScore / 100) + 1;
    const xpForNextLevel = level * 100;
    const xpProgress = totalScore % 100;

    // Get user rank based on game scores
    const [rankResult] = await db.query(`
      SELECT COUNT(DISTINCT user_id) + 1 as rank
      FROM (
        SELECT user_id, SUM(score) as total_score
        FROM scores
        GROUP BY user_id
        HAVING total_score > ?
      ) as rankings
    `, [totalScore]);

    const rank = rankResult[0].rank;

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        xp: totalScore
      },
      level,
      xpForNextLevel,
      xpProgress,
      rank,
      completedChallenges: gamesCount[0].count,
      recentSubmissions
    });
  } catch (error) {
    console.error('Error loading profile:', error);
    res.status(500).json({ success: false, error: 'Error loading profile' });
  }
});

module.exports = router;