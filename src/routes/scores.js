const express = require('express');
const router  = express.Router();
const db      = require('../db/database');

function requireAuth(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ error: 'Login required.' });
  next();
}

// ── GET /api/scores/leaderboard ───────────────────────────────────────────────
// Top-10 players by total points — requires login
router.get('/leaderboard', requireAuth, (req, res) => {
  const rows = db.prepare(`
    SELECT
      username,
      SUM(points)   AS total_points,
      MAX(points)   AS best_score,
      COUNT(*)      AS games_played,
      MIN(time_seconds) AS best_time
    FROM scores
    GROUP BY username
    ORDER BY total_points DESC
    LIMIT 10
  `).all();
  return res.json(rows);
});

// ── GET /api/scores/mine ──────────────────────────────────────────────────────
router.get('/mine', (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ error: 'Login required.' });

  const scores = db.prepare(`
    SELECT id, graph_n, graph_edges, time_seconds, points, difficulty, created_at
    FROM scores
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 30
  `).all(req.session.userId);

  const summary = db.prepare(`
    SELECT
      SUM(points)   AS total_points,
      MAX(points)   AS best_score,
      COUNT(*)      AS games_played,
      MIN(time_seconds) AS best_time
    FROM scores
    WHERE user_id = ?
  `).get(req.session.userId);

  return res.json({ scores, summary });
});

module.exports = router;
