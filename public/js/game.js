/**
 * game.js – Dijkstra Quest game logic
 * Handles:
 *   • Difficulty selection & graph generation (setup phase)
 *   • Cytoscape rendering + edge click selection (play phase)
 *   • Timer (disabled in training mode)
 *   • Submission & result display
 *   • Dijkstra step-by-step visualisation modal
 *   • Saved-graph loading
 */

'use strict';

// ── Constants ────────────────────────────────────────────────────────────────

const TRAINING = !!window.TRAINING_MODE;

const CY_STYLE = [
  {
    selector: 'node',
    style: {
      label:                   'data(label)',
      'background-color':      '#546e7a',
      color:                   '#1a237e',
      'text-valign':           'bottom',
      'text-halign':           'center',
      'text-margin-y':         7,
      'font-size':             11,
      'font-weight':           '600',
      'text-background-color': '#fff',
      'text-background-opacity': 0.85,
      'text-background-padding': '2px',
      'text-border-radius':    3,
      width: 28, height: 28
    }
  },
  { selector: 'node.source',  style: { 'background-color': '#198754', color: '#1b5e20' } },
  { selector: 'node.dest',    style: { 'background-color': '#dc3545', color: '#b71c1c' } },
  { selector: 'node.cloud',   style: { 'background-color': '#fd7e14', color: '#e65100' } },
  { selector: 'node.current', style: { 'background-color': '#ffc107', color: '#e65100' } },
  {
    selector: 'edge',
    style: {
      label:              'data(weightLabel)',
      width:              2.5,
      'line-color':       '#adb5bd',
      'font-size':        11,
      'text-background-color': '#fff',
      'text-background-opacity': 0.85,
      'text-background-padding': '2px',
      'curve-style':      'bezier',
      'target-arrow-shape': 'none'
    }
  },
  { selector: 'edge.selected', style: { 'line-color': '#1565c0', width: 4 } },
  { selector: 'edge.shortest', style: { 'line-color': '#6f42c1', width: 4 } },
  { selector: 'edge.relaxed',  style: { 'line-color': '#198754', width: 3 } }
];

// ── State ────────────────────────────────────────────────────────────────────

let cy          = null;       // main Cytoscape instance
let dijkCy      = null;       // Dijkstra modal Cytoscape instance
let graphData   = null;       // { nodes, edges, source, destination }
let selectedEdges = new Set();
let timerInterval = null;
let elapsedSec  = 0;
let submitted   = false;

// Dijkstra viz state
let dijkSteps   = [];
let dijkPath    = null;
let dijkIndex   = -1;
let dijkAutoInterval = null;
let dijkPrev    = {};         // prev node map built per step

// ── Bootstrap modal reference ─────────────────────────────────────────────────
let dijkModalEl = null;
let dijkModalBS = null;

// ── Init ─────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
  const me = await requireLogin();
  await buildNav(TRAINING ? 'training' : 'play');
  i18n.apply();

  dijkModalEl = document.getElementById('dijkModal');
  dijkModalBS = new bootstrap.Modal(dijkModalEl);

  setupDifficultyPills();
  await loadSavedGraphs();
  wireButtons();
});

// ── Difficulty pills ──────────────────────────────────────────────────────────

let selectedDiff = 'beginner';

function setupDifficultyPills() {
  document.querySelectorAll('.diff-badge').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.diff-badge').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      selectedDiff = pill.dataset.diff;
      const customParams = document.getElementById('customParams');
      if (customParams) {
        customParams.classList.toggle('d-none', selectedDiff !== 'custom');
      }
    });
  });
}

// ── Saved graphs list ─────────────────────────────────────────────────────────

async function loadSavedGraphs() {
  const container = document.getElementById('savedList');
  if (!container) return;

  const data = await apiGet('/api/game/saved');
  if (!Array.isArray(data) || data.length === 0) {
    container.innerHTML = `<span class="text-muted small">—</span>`;
    return;
  }

  container.innerHTML = data.map(g => `
    <button class="btn btn-sm btn-outline-secondary"
            onclick="loadSavedGraph(${g.id})">
      📂 ${escHtml(g.name)}
    </button>`).join('');
}

async function loadSavedGraph(id) {
  showLoading(true);
  const res = await apiGet(`/api/game/saved/${id}`);
  showLoading(false);
  if (res.error) { showToast(res.error, 'danger'); return; }
  startPlayPhase(res.graph, res.source, res.destination);
}

// ── Wire buttons ──────────────────────────────────────────────────────────────

function wireButtons() {
  document.getElementById('generateBtn').addEventListener('click', generateGraph);

  // These buttons exist only after play phase renders:
  document.addEventListener('click', e => {
    const t = e.target;
    if (t.id === 'submitBtn')  handleSubmit();
    if (t.id === 'resetBtn')   resetSelection();
    if (t.id === 'newGameBtn') backToSetup();
    if (t.id === 'replayBtn')  replayGraph();
    if (t.id === 'saveBtn')    toggleSaveForm();
    if (t.id === 'confirmSaveBtn') confirmSave();
  });

  // Dijkstra modal controls
  if (dijkModalEl) {
    dijkModalEl.addEventListener('show.bs.modal', loadDijkSteps);
    dijkModalEl.addEventListener('hide.bs.modal', stopDijkAuto);
  }
}

// ── Generate graph ────────────────────────────────────────────────────────────

async function generateGraph() {
  const body = { difficulty: selectedDiff, training: TRAINING };

  if (selectedDiff === 'custom') {
    body.n         = parseInt(document.getElementById('paramN')?.value)    || 6;
    body.p         = parseFloat(document.getElementById('paramP')?.value)  || 0.5;
    body.minWeight = parseInt(document.getElementById('paramWMin')?.value) || 1;
    body.maxWeight = parseInt(document.getElementById('paramWMax')?.value) || 20;
  }

  showLoading(true);
  const res = await apiPost('/api/game/generate', body);
  showLoading(false);

  if (res.error) { showToast(res.error, 'danger'); return; }
  startPlayPhase(res.graph, res.source, res.destination);
}

// ── Play phase ────────────────────────────────────────────────────────────────

function startPlayPhase(graph, source, destination) {
  graphData = { ...graph, source, destination };
  selectedEdges.clear();
  submitted = false;
  elapsedSec = 0;

  // Switch views
  document.getElementById('setupPhase').classList.add('d-none');
  document.getElementById('playPhase').classList.remove('d-none');

  // Update HUD badges with location names
  document.getElementById('srcBadge').textContent = labelOf(source);
  document.getElementById('dstBadge').textContent = labelOf(destination);
  document.getElementById('weightSum').textContent = '0';
  document.getElementById('edgeList').innerHTML = '<span class="text-muted small">—</span>';

  // Hide result / Dijkstra panels
  document.getElementById('resultPanel').classList.add('d-none');
  document.getElementById('dijkBtnWrap').classList.add('d-none');
  const saveForm = document.getElementById('saveForm');
  if (saveForm) saveForm.classList.add('d-none');

  // Timer (skip in training)
  clearInterval(timerInterval);
  const timerDisplay = document.getElementById('timerDisplay');
  if (timerDisplay && !TRAINING) {
    timerDisplay.innerHTML = `0<small class="fs-6 ms-1">${i18n.t('sec')}</small>`;
    timerInterval = setInterval(() => {
      elapsedSec++;
      timerDisplay.innerHTML = `${elapsedSec}<small class="fs-6 ms-1">${i18n.t('sec')}</small>`;
    }, 1000);
  }

  renderGraph();
}

// ── Cytoscape rendering ───────────────────────────────────────────────────────

function renderGraph() {
  const { nodes, edges, source, destination } = graphData;

  if (cy) { cy.destroy(); cy = null; }

  const cyNodes = nodes.map(n => ({
    data:    { id: n.id, label: n.label || n.id },
    classes: (n.id === source ? 'source' : n.id === destination ? 'dest' : '')
  }));

  const cyEdges = edges.map(e => ({
    data: { id: e.id, source: e.source, target: e.target, weight: e.weight, weightLabel: e.weight + ' km' }
  }));

  cy = cytoscape({
    container: document.getElementById('cy'),
    elements:  [...cyNodes, ...cyEdges],
    style:     CY_STYLE,
    layout:    { name: 'cose', animate: true, animationDuration: 400, randomize: true }
  });

  // ── Edge click: select / deselect ──────────────────────────────────────────
  cy.on('tap', 'edge', evt => {
    if (submitted) return;
    const edge   = evt.target;
    const edgeId = edge.id();

    if (selectedEdges.has(edgeId)) {
      selectedEdges.delete(edgeId);
      edge.removeClass('selected');
    } else {
      selectedEdges.add(edgeId);
      edge.addClass('selected');
    }
    updateWeightSumDisplay();
  });
}

// ── Weight sum ────────────────────────────────────────────────────────────────

function updateWeightSumDisplay() {
  let sum = 0;
  const edgeMap = {};
  graphData.edges.forEach(e => { edgeMap[e.id] = e; });

  const items = [];
  for (const eid of selectedEdges) {
    const e = edgeMap[eid];
    if (e) {
      sum += e.weight;
      items.push(`<div class="edge-item">
        <span>${labelOf(e.source)} – ${labelOf(e.target)}</span>
        <span class="fw-bold">${e.weight} km</span>
      </div>`);
    }
  }

  document.getElementById('weightSum').textContent = sum;
  document.getElementById('edgeList').innerHTML = items.length
    ? items.join('')
    : '<span class="text-muted small">—</span>';
}

// ── Reset selection ───────────────────────────────────────────────────────────

function resetSelection() {
  selectedEdges.clear();
  cy && cy.edges().removeClass('selected');
  updateWeightSumDisplay();
}

// ── Submit ────────────────────────────────────────────────────────────────────

async function handleSubmit() {
  if (submitted) { showToast('Έχεις ήδη υποβάλει!', 'warning'); return; }
  if (selectedEdges.size === 0) {
    showToast(i18n.getLang() === 'el'
      ? 'Επέλεξε τουλάχιστον μία ακμή.'
      : 'Select at least one edge.', 'warning');
    return;
  }

  clearInterval(timerInterval);
  submitted = true;

  showLoading(true);
  const res = await apiPost('/api/game/submit', {
    selectedEdges: [...selectedEdges],
    timeSeconds:   TRAINING ? 0 : elapsedSec
  });
  showLoading(false);

  if (res.error) { showToast(res.error, 'danger'); submitted = false; return; }

  showResult(res);
}

// ── Show result ───────────────────────────────────────────────────────────────

function showResult(res) {
  const panel = document.getElementById('resultPanel');
  const msg   = document.getElementById('resultMsg');

  panel.classList.remove('d-none', 'result-correct', 'result-wrong');
  panel.classList.add(res.correct ? 'result-correct' : 'result-wrong');

  msg.textContent = i18n.t(res.correct ? 'res.correct' : 'res.wrong');

  // Points (not in training)
  const pointsRow = document.getElementById('pointsRow');
  if (pointsRow) {
    if (res.correct && !TRAINING) {
      pointsRow.classList.remove('d-none');
      document.getElementById('pointsEarned').textContent = res.points;
    } else {
      pointsRow.classList.add('d-none');
    }
  }

  // Shortest path info
  document.getElementById('spWeight').textContent =
    res.shortestPath ? res.shortestPath.totalWeight : '—';

  const spNodesEl = document.getElementById('spNodes');
  if (res.shortestPath && res.shortestPath.nodes) {
    spNodesEl.innerHTML = res.shortestPath.nodes
      .map((n, i, a) => `<span class="badge bg-secondary">${labelOf(n)}</span>${i < a.length - 1 ? ' → ' : ''}`)
      .join('');
    // Highlight correct path on graph
    highlightShortestPath(res.shortestPath.edges, res.correct);
  }

  // Show Dijkstra button
  document.getElementById('dijkBtnWrap').classList.remove('d-none');

  if (res.correct) showToast(`+${res.points} πόντοι! Μπράβο! 🎉`, 'success');
}

// ── Highlight shortest path on main graph ─────────────────────────────────────

function highlightShortestPath(spEdgeIds, wasCorrect) {
  if (!cy || !spEdgeIds) return;
  const spSet = new Set(spEdgeIds);
  cy.edges().forEach(e => {
    if (spSet.has(e.id())) {
      e.removeClass('selected').addClass('shortest');
    }
  });
}

// ── Replay same graph ─────────────────────────────────────────────────────────

function replayGraph() {
  startPlayPhase(
    { nodes: graphData.nodes, edges: graphData.edges },
    graphData.source,
    graphData.destination
  );
}

// ── Back to setup ─────────────────────────────────────────────────────────────

function backToSetup() {
  clearInterval(timerInterval);
  document.getElementById('playPhase').classList.add('d-none');
  document.getElementById('setupPhase').classList.remove('d-none');
  loadSavedGraphs();
}

// ── Save graph ────────────────────────────────────────────────────────────────

function toggleSaveForm() {
  const form = document.getElementById('saveForm');
  if (form) form.classList.toggle('d-none');
}

async function confirmSave() {
  const name = document.getElementById('saveNameInput')?.value.trim() || '';
  const res  = await apiPost('/api/game/save', { name });
  if (res.success) {
    showToast(i18n.getLang() === 'el' ? 'Αποθηκεύτηκε!' : 'Saved!', 'success');
    document.getElementById('saveForm').classList.add('d-none');
  } else {
    showToast(res.error || i18n.t('error.generic'), 'danger');
  }
}

// ════════════════════════════════════════════════════════════════════════════
// DIJKSTRA STEP-BY-STEP VISUALISATION
// ════════════════════════════════════════════════════════════════════════════

async function loadDijkSteps() {
  // Fetch steps from server
  const res = await apiGet('/api/game/dijkstra-steps');
  if (res.error) { showToast(res.error, 'danger'); return; }

  dijkSteps = res.steps  || [];
  dijkPath  = res.shortestPath || null;
  dijkIndex = -1;
  dijkPrev  = {};   // will be built step by step

  document.getElementById('stepTotal').textContent = dijkSteps.length;
  document.getElementById('stepCur').textContent   = 0;
  document.getElementById('stepProgress').style.width = '0%';
  document.getElementById('stepDesc').textContent  = '—';

  initDijkCy();
  renderDistTable(null, {});
}

// Initialise mini Cytoscape inside modal
function initDijkCy() {
  const { nodes, edges, source, destination } = graphData;
  if (dijkCy) { dijkCy.destroy(); dijkCy = null; }

  dijkCy = cytoscape({
    container: document.getElementById('dijkCy'),
    elements: [
      ...nodes.map(n => ({
        data:    { id: n.id, label: n.label || n.id },
        classes: n.id === source ? 'source' : n.id === destination ? 'dest' : ''
      })),
      ...edges.map(e => ({
        data: { id: e.id, source: e.source, target: e.target, weight: e.weight, weightLabel: e.weight + ' km' }
      }))
    ],
    style:  CY_STYLE,
    layout: { name: 'cose', animate: false, randomize: false }
  });
  // Sync positions with main cy if available
  if (cy) {
    cy.nodes().forEach(n => {
      const pos = n.position();
      dijkCy.getElementById(n.id()).position({ x: pos.x, y: pos.y });
    });
    dijkCy.fit();
  }
}

// Advance one step
function dijkStep(direction = 1) {
  dijkIndex = Math.max(-1, Math.min(dijkSteps.length - 1, dijkIndex + direction));

  if (dijkIndex < 0) {
    // Reset to initial state
    dijkCy && dijkCy.elements().removeClass('cloud current relaxed source dest');
    dijkCy && dijkCy.nodes().forEach(n => {
      const src = graphData.source, dst = graphData.destination;
      n.addClass(n.id() === src ? 'source' : n.id() === dst ? 'dest' : '');
    });
    dijkCy && dijkCy.edges().removeClass('selected shortest relaxed');
    document.getElementById('stepDesc').textContent  = '—';
    document.getElementById('stepCur').textContent   = 0;
    document.getElementById('stepProgress').style.width = '0%';
    renderDistTable(null, {});
    return;
  }

  const step = dijkSteps[dijkIndex];

  // Update step counter & progress bar
  document.getElementById('stepCur').textContent = dijkIndex + 1;
  document.getElementById('stepProgress').style.width =
    `${Math.round(((dijkIndex + 1) / dijkSteps.length) * 100)}%`;

  // Description
  document.getElementById('stepDesc').textContent =
    i18n.getLang() === 'el' ? step.description_el : step.description_en;

  // Update dijkPrev from step dist data (rebuild for backward nav)
  // We rebuild prev map by replaying steps 0..dijkIndex
  rebuildPrevMap();

  // Update Cytoscape
  applyStepToCy(step);

  // Distance table
  renderDistTable(step.dist, dijkPrev, step.node || step.to);
}

function rebuildPrevMap() {
  dijkPrev = {};
  const { nodes } = graphData;
  const dist = {};
  nodes.forEach(n => { dist[n.id] = Infinity; });
  dist[graphData.source] = 0;

  for (let i = 0; i <= dijkIndex; i++) {
    const s = dijkSteps[i];
    if (s.action === 'relax' && s.newDist < (dist[s.to] ?? Infinity)) {
      dist[s.to] = s.newDist;
      dijkPrev[s.to] = s.from;
    }
  }
}

function applyStepToCy(step) {
  if (!dijkCy) return;
  const { source, destination } = graphData;

  // Reset all classes then re-apply cloud
  dijkCy.nodes().forEach(n => {
    n.removeClass('cloud current source dest');
    n.addClass(n.id() === source ? 'source' : n.id() === destination ? 'dest' : '');
  });
  dijkCy.edges().removeClass('relaxed shortest');

  // Re-colour cloud (all visited nodes up to this step)
  const cloud = step.cloud || [];
  cloud.forEach(nid => {
    const node = dijkCy.getElementById(nid);
    if (node.length) {
      node.removeClass('source dest');
      node.addClass('cloud');
    }
  });

  if (step.action === 'visit' && step.node) {
    const cur = dijkCy.getElementById(step.node);
    cur.removeClass('cloud source dest').addClass('current');
  }

  if (step.action === 'relax' && step.edge) {
    dijkCy.getElementById(step.edge).addClass('relaxed');
  }

  // Highlight shortest path if we're at the last step
  if (dijkIndex === dijkSteps.length - 1 && dijkPath) {
    dijkPath.edges.forEach(eid => {
      dijkCy.getElementById(eid).removeClass('relaxed').addClass('shortest');
    });
  }
}

// Render distance table
function renderDistTable(distMap, prevMap, highlightNode) {
  const tbody = document.getElementById('distBody');
  if (!tbody || !graphData) return;

  const { nodes } = graphData;

  if (!distMap) {
    // Initial state
    const src = graphData.source;
    tbody.innerHTML = nodes.map(n => `
      <tr>
        <td>${labelOf(n.id)}</td>
        <td>${n.id === src ? '0 km' : '∞'}</td>
        <td>—</td>
      </tr>`).join('');
    return;
  }

  tbody.innerHTML = nodes.map(n => {
    const d    = distMap[n.id];
    const dStr = (d === undefined || d === Infinity) ? '∞' : d + ' km';
    const p    = prevMap[n.id] ? labelOf(prevMap[n.id]) : '—';
    const hl   = n.id === highlightNode ? 'table-warning fw-bold' : '';
    const cl   = (dijkSteps[dijkIndex]?.cloud || []).includes(n.id) ? 'table-warning' : '';
    return `<tr class="${hl || cl}"><td>${labelOf(n.id)}</td><td>${dStr}</td><td>${p}</td></tr>`;
  }).join('');
}

// Dijkstra modal button wiring
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('dijkNextBtn')?.addEventListener('click', () => dijkStep(1));
  document.getElementById('dijkPrevBtn')?.addEventListener('click', () => dijkStep(-1));
  document.getElementById('dijkAutoBtn')?.addEventListener('click', startDijkAuto);
  document.getElementById('dijkStopBtn')?.addEventListener('click', stopDijkAuto);
});

function startDijkAuto() {
  if (dijkAutoInterval) return;
  document.getElementById('dijkAutoBtn').classList.add('d-none');
  document.getElementById('dijkStopBtn').classList.remove('d-none');
  dijkAutoInterval = setInterval(() => {
    if (dijkIndex >= dijkSteps.length - 1) {
      stopDijkAuto();
      return;
    }
    dijkStep(1);
  }, 900);
}

function stopDijkAuto() {
  clearInterval(dijkAutoInterval);
  dijkAutoInterval = null;
  document.getElementById('dijkAutoBtn').classList.remove('d-none');
  document.getElementById('dijkStopBtn').classList.add('d-none');
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function showLoading(show) {
  let ov = document.getElementById('loadingOverlay');
  if (show && !ov) {
    ov = document.createElement('div');
    ov.id = 'loadingOverlay';
    ov.innerHTML = '<div class="spinner-border text-primary" role="status"></div>';
    document.body.appendChild(ov);
  } else if (!show && ov) {
    ov.remove();
  }
}

// Returns the display label (city name) for a node ID
function labelOf(nodeId) {
  if (!graphData || !graphData.nodes) return nodeId;
  const n = graphData.nodes.find(nd => nd.id === nodeId);
  return n ? (n.label || nodeId) : nodeId;
}

function escHtml(s) {
  return String(s).replace(/[&<>"']/g, c =>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
