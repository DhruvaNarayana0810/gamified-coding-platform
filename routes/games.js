const express = require('express');
const { VM } = require('vm2');
const db = require('../db');
const router = express.Router();

// Middleware to check authentication
const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ success: false, error: 'Not authenticated' });
  }
  next();
};

// Get debug challenges
router.get('/debug-challenges', requireAuth, async (req, res) => {
  try {
    const [challenges] = await db.query(
      'SELECT id, title, description, starter_code, points FROM debug_challenges ORDER BY id'
    );
    
    res.json({ success: true, challenges });
  } catch (error) {
    console.error('Error fetching debug challenges:', error);
    res.status(500).json({ success: false, error: 'Error loading challenges' });
  }
});

// Run code in sandbox
router.post('/run', requireAuth, async (req, res) => {
  try {
    const { code, challengeId } = req.body;
    
    if (!code || !challengeId) {
      return res.status(400).json({ success: false, error: 'Code and challengeId required' });
    }
    
    // Get challenge
    const [challenges] = await db.query(
      'SELECT * FROM debug_challenges WHERE id = ?',
      [challengeId]
    );
    
    if (challenges.length === 0) {
      return res.status(404).json({ success: false, error: 'Challenge not found' });
    }
    
    const challenge = challenges[0];
    
    // Execute code in sandbox
    let output = '';
    let isCorrect = false;
    let error = null;
    
    try {
      const vm = new VM({
        timeout: 1000,
        sandbox: {
          console: {
            log: (...args) => {
              output += args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
              ).join(' ') + '\n';
            }
          }
        }
      });
      
      vm.run(code);
      
      // Compare output
      output = output.trim();
      const expectedOutput = challenge.expected_output.trim();
      
      isCorrect = output === expectedOutput;
      
    } catch (err) {
      error = err.message;
      output = '';
    }
    
    res.json({
      success: true,
      isCorrect,
      output,
      expectedOutput: challenge.expected_output,
      error,
      points: isCorrect ? challenge.points : 0
    });
    
  } catch (error) {
    console.error('Error running code:', error);
    res.status(500).json({ success: false, error: 'Error executing code' });
  }
});

// Submit game score
router.post('/score', requireAuth, async (req, res) => {
  try {
    const { game, score } = req.body;
    const userId = req.session.user.id;
    const username = req.session.user.username;

    if (!game || score === undefined || score === null) {
      return res.status(400).json({ success: false, error: 'Game and score are required' });
    }

    // Validate game name
    const validGames = ['code-sprint', 'debug-dash', 'logic-grid', 'logic-circuit'];
    if (!validGames.includes(game)) {
      return res.status(400).json({ success: false, error: 'Invalid game name' });
    }

    // Insert score
    await db.query(
      'INSERT INTO scores (user_id, username, game, score) VALUES (?, ?, ?, ?)',
      [userId, username, game, score]
    );

    // Get user's new rank
    const [rankResult] = await db.query(`
      SELECT COUNT(DISTINCT user_id) + 1 as rank
      FROM (
        SELECT user_id, SUM(score) as total_score
        FROM scores
        GROUP BY user_id
        HAVING total_score > (
          SELECT SUM(score)
          FROM scores
          WHERE user_id = ?
        )
      ) as rankings
    `, [userId]);

    const rank = rankResult[0].rank;

    res.json({ 
      success: true, 
      message: 'Score submitted successfully',
      rank: rank
    });
  } catch (error) {
    console.error('Error submitting score:', error);
    res.status(500).json({ success: false, error: 'Error submitting score' });
  }
});

// Get global leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const [leaderboard] = await db.query(`
      SELECT 
        s.username,
        SUM(s.score) as total_score,
        COUNT(DISTINCT s.game) as games_played,
        MAX(s.created_at) as last_played
      FROM scores s
      GROUP BY s.username
      ORDER BY total_score DESC
      LIMIT 20
    `);

    res.json({ success: true, leaderboard });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ success: false, error: 'Error loading leaderboard' });
  }
});

// Get game-specific leaderboard
router.get('/leaderboard/:game', async (req, res) => {
  try {
    const game = req.params.game;

    const [leaderboard] = await db.query(`
      SELECT 
        username,
        MAX(score) as best_score,
        COUNT(*) as times_played,
        MAX(created_at) as last_played
      FROM scores
      WHERE game = ?
      GROUP BY username
      ORDER BY best_score DESC
      LIMIT 20
    `, [game]);

    res.json({ success: true, game, leaderboard });
  } catch (error) {
    console.error('Error fetching game leaderboard:', error);
    res.status(500).json({ success: false, error: 'Error loading leaderboard' });
  }
});

// Get user's game statistics
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const userId = req.session.user.id;

    const [stats] = await db.query(`
      SELECT 
        game,
        COUNT(*) as times_played,
        MAX(score) as best_score,
        AVG(score) as avg_score,
        SUM(score) as total_score
      FROM scores
      WHERE user_id = ?
      GROUP BY game
    `, [userId]);

    const [totalStats] = await db.query(`
      SELECT 
        COUNT(*) as total_games,
        SUM(score) as total_score,
        AVG(score) as avg_score
      FROM scores
      WHERE user_id = ?
    `, [userId]);

    res.json({ 
      success: true, 
      gameStats: stats,
      totalStats: totalStats[0] || { total_games: 0, total_score: 0, avg_score: 0 }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, error: 'Error loading statistics' });
  }
});

// Get logic circuit puzzles
router.get('/logic-circuits', requireAuth, async (req, res) => {
  try {
    const [circuits] = await db.query(
      'SELECT * FROM logic_circuits ORDER BY id'
    );
    
    // Parse TEXT fields as JSON for frontend
    const parsedCircuits = circuits.map(circuit => ({
      ...circuit,
      available_gates: JSON.parse(circuit.available_gates),
      correct_sequence: JSON.parse(circuit.correct_sequence),
      expected_output: JSON.parse(circuit.expected_output)
    }));
    
    res.json({ success: true, circuits: parsedCircuits });
  } catch (error) {
    console.error('Error fetching logic circuits:', error);
    res.status(500).json({ success: false, error: 'Error loading circuits' });
  }
});

// Validate logic circuit solution
router.post('/validate-circuit', requireAuth, async (req, res) => {
  try {
    const { circuitId, playerSequence } = req.body;
    
    if (!circuitId || !playerSequence) {
      return res.status(400).json({ success: false, error: 'Circuit ID and sequence required' });
    }
    
    // Get circuit
    const [circuits] = await db.query(
      'SELECT * FROM logic_circuits WHERE id = ?',
      [circuitId]
    );
    
    if (circuits.length === 0) {
      return res.status(404).json({ success: false, error: 'Circuit not found' });
    }
    
    const circuit = circuits[0];
    
    // Parse TEXT fields as JSON
    const correctSequence = JSON.parse(circuit.correct_sequence);
    const expectedOutput = JSON.parse(circuit.expected_output);
    
    // Check if sequence matches
    const isCorrect = JSON.stringify(playerSequence) === JSON.stringify(correctSequence);
    
    res.json({
      success: true,
      isCorrect,
      expectedOutput,
      points: isCorrect ? circuit.points : 0
    });
    
  } catch (error) {
    console.error('Error validating circuit:', error);
    res.status(500).json({ success: false, error: 'Error validating solution' });
  }
});

module.exports = router;