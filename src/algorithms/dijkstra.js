/**
 * Dijkstra's shortest-path algorithm.
 * Works on undirected weighted graphs with non-negative weights.
 *
 * Returns:
 *  dist     – map nodeId → shortest distance from source
 *  prev     – map nodeId → predecessor node
 *  prevEdge – map nodeId → edge used to reach node
 *  steps    – ordered array of algorithm steps for visualisation
 *  getPath  – function(targetId) → { nodes, edges, totalWeight } | null
 */
/**
 * @param {Array}  nodes
 * @param {Array}  edges
 * @param {string} sourceId
 * @param {Object} [labelMap]      – optional map nodeId→displayLabel for readable step descriptions
 * @param {string} [destinationId] – if provided, algorithm stops as soon as this node is settled
 */
function dijkstra(nodes, edges, sourceId, labelMap = {}, destinationId = null) {
  const lbl = id => labelMap[id] || id;
  const fmt = d => d === Infinity ? '∞' : `${Math.round(d * 10) / 10} km`;
  // Build adjacency list
  const adj = {};
  nodes.forEach(n => { adj[n.id] = []; });
  edges.forEach(e => {
    adj[e.source].push({ node: e.target, weight: e.weight, edgeId: e.id });
    adj[e.target].push({ node: e.source, weight: e.weight, edgeId: e.id });
  });

  const dist     = {};
  const prev     = {};
  const prevEdge = {};
  const visited  = new Set();
  const steps    = [];

  nodes.forEach(n => {
    dist[n.id]     = Infinity;
    prev[n.id]     = null;
    prevEdge[n.id] = null;
  });
  dist[sourceId] = 0;

  // Initial step: set distances
  steps.push({
    action: 'init',
    source: sourceId,
    dist: { ...dist },
    cloud: [],
    description_el: `Έναρξη: η αφετηρία ${lbl(sourceId)} έχει απόσταση 0 km. Όλες οι υπόλοιπες τοποθεσίες ξεκινούν με απόσταση ∞.`,
    description_en: `Start: source ${lbl(sourceId)} has distance 0 km. All other locations start at ∞.`
  });

  while (visited.size < nodes.length) {
    // Find unvisited node with minimum distance (linear scan — fine for small n)
    let u = null;
    let minDist = Infinity;
    nodes.forEach(n => {
      if (!visited.has(n.id) && dist[n.id] < minDist) {
        minDist = dist[n.id];
        u = n.id;
      }
    });

    if (u === null || dist[u] === Infinity) break;  // remaining nodes unreachable

    visited.add(u);

    // Early termination: destination has been settled — its shortest distance is final
    if (destinationId !== null && u === destinationId) {
      steps.push({
        action: 'done',
        node: u,
        dist: { ...dist },
        cloud: [...visited],
        description_el: `Φτάσαμε στον προορισμό ${lbl(u)} (d = ${fmt(dist[u])}). Ο αλγόριθμος τερματίζει — η συντομότερη διαδρομή έχει βρεθεί!`,
        description_en: `Destination ${lbl(u)} reached (d = ${fmt(dist[u])}). Algorithm terminates — shortest route found!`
      });
      break;
    }

    steps.push({
      action: 'visit',
      node: u,
      dist: { ...dist },
      cloud: [...visited],
      description_el: `Επεξεργαζόμαστε: ${lbl(u)} (d = ${fmt(dist[u])}). Ελέγχουμε όλους τους γειτονικούς δρόμους.`,
      description_en: `Processing: ${lbl(u)} (d = ${fmt(dist[u])}). Checking all neighbouring roads.`
    });

    // Relax neighbours
    adj[u].forEach(({ node: v, weight, edgeId }) => {
      if (visited.has(v)) return;
      const newDist = dist[u] + weight;
      if (newDist < dist[v]) {
        const oldDist = dist[v];
        dist[v]     = newDist;
        prev[v]     = u;
        prevEdge[v] = edgeId;

        steps.push({
          action: 'relax',
          edge: edgeId,
          from: u,
          to: v,
          newDist,
          dist: { ...dist },
          cloud: [...visited],
          description_el: `Βρέθηκε καλύτερη διαδρομή προς ${lbl(v)} μέσω ${lbl(u)}: ${fmt(newDist)} (ήταν ${fmt(oldDist)})`,
          description_en: `Better route to ${lbl(v)} via ${lbl(u)}: ${fmt(newDist)} (was ${fmt(oldDist)})`
        });
      }
    });
  }

  function getPath(targetId) {
    if (dist[targetId] === Infinity) return null;

    const pathNodes = [];
    const pathEdges = [];
    let cur = targetId;

    while (cur !== null) {
      pathNodes.unshift(cur);
      if (prevEdge[cur]) pathEdges.unshift(prevEdge[cur]);
      cur = prev[cur];
    }

    return { nodes: pathNodes, edges: pathEdges, totalWeight: dist[targetId] };
  }

  return { dist, prev, prevEdge, steps, getPath };
}

/**
 * Checks whether the player's selected edge set equals the shortest path.
 * Handles graphs with multiple shortest paths of equal weight:
 *   — accepts any edge set whose total weight equals the Dijkstra distance
 *     AND that forms a simple path from source to destination.
 */
function checkAnswer(nodes, edges, source, destination, selectedEdgeIds, labelMap = {}) {
  const { dist, steps, getPath } = dijkstra(nodes, edges, source, labelMap, destination);
  const shortestPath = getPath(destination);

  if (!shortestPath) {
    return { correct: false, reason: 'no_path', shortestPath: null, steps };
  }

  // Build edge lookup
  const edgeMap = {};
  edges.forEach(e => { edgeMap[e.id] = e; });

  // Validate player's edge set:
  // 1. Total weight must equal the shortest path weight
  // 2. Must form a connected path from source to destination
  const selSet = new Set(selectedEdgeIds);
  const expectedWeight = shortestPath.totalWeight;

  // Compute player's total weight
  let playerWeight = 0;
  for (const eid of selSet) {
    if (!edgeMap[eid]) return { correct: false, reason: 'invalid_edge', shortestPath, steps };
    playerWeight += edgeMap[eid].weight;
  }

  if (Math.abs(playerWeight - expectedWeight) > 0.001) {
    return { correct: false, reason: 'wrong_weight', shortestPath, steps };
  }

  // Check that the selected edges form a valid path source→destination
  if (!formsPath(nodes, edgeMap, selSet, source, destination)) {
    return { correct: false, reason: 'not_a_path', shortestPath, steps };
  }

  return { correct: true, shortestPath, shortestWeight: expectedWeight, steps };
}

/** Returns true if the edge subset forms a simple path from src to dst. */
function formsPath(nodes, edgeMap, selSet, src, dst) {
  if (selSet.size === 0) return src === dst;

  // Build adjacency from selected edges
  const adj = {};
  nodes.forEach(n => { adj[n.id] = []; });
  for (const eid of selSet) {
    const e = edgeMap[eid];
    adj[e.source].push(e.target);
    adj[e.target].push(e.source);
  }

  // Every node in the path must have degree 1 (endpoints) or 2 (intermediate)
  for (const nid of Object.keys(adj)) {
    const deg = adj[nid].length;
    if (deg === 0) continue;
    if (nid === src || nid === dst) {
      if (deg !== 1) return false;
    } else {
      if (deg !== 2) return false;
    }
  }

  // BFS from src — must reach dst
  const visited = new Set([src]);
  const queue = [src];
  while (queue.length) {
    const cur = queue.shift();
    for (const nb of adj[cur]) {
      if (!visited.has(nb)) {
        visited.add(nb);
        queue.push(nb);
      }
    }
  }
  return visited.has(dst);
}

module.exports = { dijkstra, checkAnswer };
