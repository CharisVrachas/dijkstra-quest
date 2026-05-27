const express = require('express');
const router  = express.Router();
const db      = require('../db/database');
const { generateGraph, getDifficultyParams } = require('../algorithms/graphGenerator');
const { dijkstra, checkAnswer }              = require('../algorithms/dijkstra');

// ── Auth guard ────────────────────────────────────────────────────────────────
function requireAuth(req, res, next) {
  if (!req.session.userId)
    return res.status(401).json({ error: 'Login required.' });
  next();
}

// ── POST /api/game/generate ───────────────────────────────────────────────────
router.post('/generate', requireAuth, (req, res) => {
  try {
    let { n, p, minWeight, maxWeight, difficulty, training } = req.body;

    if (difficulty && difficulty !== 'custom') {
      const preset = getDifficultyParams(difficulty);
      n         = preset.n;
      p         = preset.p;
      minWeight = preset.minWeight;
      maxWeight = preset.maxWeight;
    }

    // Sanitise params
    n         = Math.max(4, Math.min(15, parseInt(n)            || 6));
    p         = Math.max(0.1, Math.min(0.95, parseFloat(p)      || 0.5));
    minWeight = Math.max(0.1, Math.min(50,  parseFloat(minWeight) || 0.5));
    maxWeight = Math.max(minWeight, Math.min(100, parseFloat(maxWeight) || 5.0));

    // Minimum SP edges required for this difficulty (keeps the puzzle interesting)
    const minPathEdges = (difficulty === 'beginner' || difficulty === 'custom') ? 1 : 3;

    let graph, source, destination;
    let attempts = 0;

    do {
      graph = generateGraph(n, p, minWeight, maxWeight);
      const nodeIds = graph.nodes.map(nd => nd.id);
      let tries = 0;
      do {
        source      = nodeIds[Math.floor(Math.random() * nodeIds.length)];
        destination = nodeIds[Math.floor(Math.random() * nodeIds.length)];
      } while (source === destination && ++tries < 50);

      const { dist, getPath } = dijkstra(graph.nodes, graph.edges, source);
      if (dist[destination] === Infinity) { attempts++; continue; }

      const path = getPath(destination);
      if (path && path.edges.length >= minPathEdges) break;

      attempts++;
    } while (attempts < 6);

    req.session.currentGame = {
      nodes:       graph.nodes,
      edges:       graph.edges,
      source,
      destination,
      difficulty:  difficulty || 'custom',
      training:    !!training,
      params:      { n, p, minWeight, maxWeight }
    };

    return res.json({ graph, source, destination });
  } catch (err) {
    console.error('[generate]', err);
    return res.status(500).json({ error: 'Graph generation failed.' });
  }
});

// ── POST /api/game/submit ─────────────────────────────────────────────────────
router.post('/submit', requireAuth, (req, res) => {
  try {
    const { selectedEdges, timeSeconds } = req.body;
    const game = req.session.currentGame;

    if (!game) return res.status(400).json({ error: 'No active game found.' });

    const { nodes, edges, source, destination, difficulty, training } = game;

    const labelMap = {};
    nodes.forEach(n => { labelMap[n.id] = n.label || n.id; });
    const result = checkAnswer(nodes, edges, source, destination, selectedEdges || [], labelMap);

    let points = 0;
    if (result.correct && !training) {
      // score = (n + |E|) * 100 / max(1, time)  — matches Sarris formula family
      points = Math.max(10, Math.round(
        (nodes.length + edges.length) * 100 / Math.max(1, timeSeconds)
      ));

      db.prepare(`
        INSERT INTO scores (user_id, username, graph_n, graph_edges, time_seconds, points, difficulty)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        req.session.userId,
        req.session.username,
        nodes.length,
        edges.length,
        timeSeconds,
        points,
        difficulty
      );
    }

    // Keep game in session so the player can load the Dijkstra visualisation
    // but mark it as submitted so they can't submit again
    req.session.currentGame = { ...game, submitted: true };

    return res.json({
      correct:       result.correct,
      reason:        result.reason || null,
      points,
      shortestPath:  result.shortestPath,
      shortestWeight: result.shortestPath ? result.shortestPath.totalWeight : null,
      steps:         result.steps
    });
  } catch (err) {
    console.error('[submit]', err);
    return res.status(500).json({ error: 'Submission failed.' });
  }
});

// ── GET /api/game/dijkstra-steps ──────────────────────────────────────────────
// Re-runs Dijkstra on the current game graph for the visualisation panel.
router.get('/dijkstra-steps', requireAuth, (req, res) => {
  try {
    const game = req.session.currentGame;
    if (!game) return res.status(400).json({ error: 'No active game.' });

    const { nodes, edges, source, destination } = game;
    const labelMap = {};
    nodes.forEach(n => { labelMap[n.id] = n.label || n.id; });
    const { steps, getPath } = dijkstra(nodes, edges, source, labelMap);
    const path = getPath(destination);

    return res.json({ steps, shortestPath: path });
  } catch (err) {
    console.error('[dijkstra-steps]', err);
    return res.status(500).json({ error: 'Could not compute steps.' });
  }
});

// ── GET /api/game/saved ───────────────────────────────────────────────────────
router.get('/saved', requireAuth, (req, res) => {
  const rows = db
    .prepare('SELECT id, name, created_at FROM saved_graphs WHERE user_id = ? ORDER BY created_at DESC')
    .all(req.session.userId);
  return res.json(rows);
});

// ── POST /api/game/save ───────────────────────────────────────────────────────
router.post('/save', requireAuth, (req, res) => {
  const game = req.session.currentGame;
  if (!game) return res.status(400).json({ error: 'No active game to save.' });

  const { name } = req.body;
  const label = (name || '').trim() || `Graph ${new Date().toLocaleDateString('el-GR')}`;

  db.prepare('INSERT INTO saved_graphs (user_id, name, graph_data) VALUES (?, ?, ?)')
    .run(req.session.userId, label, JSON.stringify(game));

  return res.json({ success: true });
});

// ── GET /api/game/saved/:id ───────────────────────────────────────────────────
router.get('/saved/:id', requireAuth, (req, res) => {
  const row = db
    .prepare('SELECT * FROM saved_graphs WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.session.userId);

  if (!row) return res.status(404).json({ error: 'Graph not found.' });

  const gameData = JSON.parse(row.graph_data);
  // Reset submitted flag so the player can replay
  gameData.submitted = false;
  req.session.currentGame = gameData;

  return res.json({
    graph:       { nodes: gameData.nodes, edges: gameData.edges },
    source:      gameData.source,
    destination: gameData.destination,
    name:        row.name
  });
});

// ── DELETE /api/game/saved/:id ────────────────────────────────────────────────
router.delete('/saved/:id', requireAuth, (req, res) => {
  db.prepare('DELETE FROM saved_graphs WHERE id = ? AND user_id = ?')
    .run(req.params.id, req.session.userId);
  return res.json({ success: true });
});

module.exports = router;
