/**
 * Erdős–Rényi G(n,p) random graph generator.
 * Guarantees connectivity by first building a random spanning tree,
 * then adding additional edges probabilistically.
 *
 * Node labels are fictional location names drawn from a pool,
 * giving the game a fantasy city-map theme.
 */

// Pool of 30 fictional location names — shuffle and pick n for each game.
const LOCATION_POOL = [
  'Αλκαντρώ',    'Βορεάλη',     'Γλαυκίδα',    'Δαιδαλία',    'Ελυσία',
  'Ζεφυρία',     'Ηλιόδρομος',  'Θαλερία',     'Ιθάκαρα',     'Καλυδώνα',
  'Λαβυρίνθια',  'Μεγαλίδα',    'Νεφελία',     'Ξανθαρία',    'Ορθόλιθος',
  'Πελαγόνη',    'Ροδανθία',    'Σελαναρία',   'Ταυροχώρι',   'Υπερίωνα',
  'Φαλανθίδα',   'Χαλκεδώ',     'Ψαλτήρι',     'Ωκεανίδα',    'Αμφιόχη',
  'Βλαχώνα',     'Κρονίδεια',   'Δρακοχώρι',   'Νεκταρόπολη', 'Αστεροχώρι'
];
const LOCATION_POOL_EN = [
  'Alkantro',    'Voreali',     'Glaukida',    'Daidalia',    'Elysia',
  'Zefiria',     'Iliodromos',  'Thaleria',    'Ithakara',    'Kalydona',
  'Lavyrinthia', 'Megalida',    'Nefelia',     'Xantharia',   'Ortholythos',
  'Pelagoni',    'Rodanthia',   'Selanaria',   'Tavrochori',  'Yperiona',
  'Falanthida',  'Chalcedo',    'Psaltiri',    'Okeanida',    'Amfiochi',
  'Vlachona',    'Kronideia',   'Drakochori',  'Nektaropoli', 'Asterochori'
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

  // Pick n unique location indices from the pool (same index → both el + en match)
  const indices = shuffle(Array.from({ length: LOCATION_POOL.length }, (_, i) => i)).slice(0, n);

  const nodes = Array.from({ length: n }, (_, i) => ({
    id: `v${i}`,
    label:    LOCATION_POOL[indices[i]],
    label_en: LOCATION_POOL_EN[indices[i]]
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
