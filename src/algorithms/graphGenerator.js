/**
 * Erdős–Rényi G(n,p) random graph generator.
 * Guarantees connectivity by first building a random spanning tree,
 * then adding additional edges probabilistically.
 *
 * Node labels are real Greek city neighbourhood names drawn from a pool,
 * giving the game its GPS / city-map theme.
 */

// Pool of 30 Greek city neighbourhoods — shuffle and pick n for each game.
const LOCATION_POOL = [
  'Σύνταγμα',    'Μοναστηράκι', 'Ακρόπολη',   'Θησείο',      'Κολωνάκι',
  'Πλάκα',       'Εξάρχεια',    'Γκάζι',       'Κεραμεικός',  'Νέος Κόσμος',
  'Παγκράτι',    'Ζωγράφου',    'Αμπελόκηποι', 'Κυψέλη',      'Καλλιθέα',
  'Πειραιάς',    'Αιγάλεω',     'Περιστέρι',   'Μαρούσι',     'Χαλάνδρι',
  'Βύρωνας',     'Δάφνη',       'Ίλιον',       'Νίκαια',      'Κορυδαλλός',
  'Ηλιούπολη',   'Γλυφάδα',     'Μοσχάτο',     'Άλιμος',      'Βριλήσσια'
];

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min, max) {
  return Math.round((Math.random() * (max - min) + min) * 10) / 10;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * @param {number} n          – vertex count (4–15)
 * @param {number} p          – edge probability (0–1)
 * @param {number} minWeight  – minimum edge weight (≥1)
 * @param {number} maxWeight  – maximum edge weight (≥minWeight)
 * @returns {{ nodes: Array, edges: Array }}
 */
function generateGraph(n, p, minWeight = 1, maxWeight = 20) {
  n = Math.max(4, Math.min(15, n));
  p = Math.max(0.1, Math.min(0.95, p));

  // Pick n unique location names from the pool
  const locationNames = shuffle(LOCATION_POOL).slice(0, n);

  const nodes = Array.from({ length: n }, (_, i) => ({
    id: `v${i}`,
    label: locationNames[i]
  }));

  // Track existing edges as a Set of "i-j" strings (i < j)
  const edgeSet = new Set();
  const edges = [];
  let edgeId = 0;

  function addEdge(i, j) {
    const key = `${Math.min(i, j)}-${Math.max(i, j)}`;
    if (edgeSet.has(key)) return;
    edgeSet.add(key);
    const weight = randFloat(minWeight, maxWeight);
    edges.push({
      id: `e${edgeId++}`,
      source: `v${Math.min(i, j)}`,
      target: `v${Math.max(i, j)}`,
      weight
    });
  }

  // 1. Random spanning tree — guarantees connectivity
  const order = shuffle(Array.from({ length: n }, (_, i) => i));
  for (let k = 1; k < n; k++) {
    const parent = order[randInt(0, k - 1)];
    addEdge(order[k], parent);
  }

  // 2. Additional Erdős–Rényi edges
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (!edgeSet.has(`${i}-${j}`) && Math.random() < p) {
        addEdge(i, j);
      }
    }
  }

  return { nodes, edges };
}

const DIFFICULTY_PRESETS = {
  beginner: { n: 6,  p: 0.55, minWeight: 0.5, maxWeight: 3.0 },
  normal:   { n: 9,  p: 0.50, minWeight: 0.5, maxWeight: 5.0 },
  advanced: { n: 12, p: 0.45, minWeight: 0.3, maxWeight: 7.0 }
};

function getDifficultyParams(difficulty) {
  return DIFFICULTY_PRESETS[difficulty] || DIFFICULTY_PRESETS.normal;
}

module.exports = { generateGraph, getDifficultyParams, DIFFICULTY_PRESETS };
