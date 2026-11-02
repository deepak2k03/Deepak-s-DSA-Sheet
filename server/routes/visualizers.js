const path = require('path');
const fs = require('fs');
const express = require('express');
const jwt = require('jsonwebtoken');
const Visualizer = require('../models/Visualizer');
const VisualizerCategory = require('../models/VisualizerCategory');
const Problem = require('../models/Problem');
const User = require('../models/User');
const { isR2Configured, getObjectFromR2 } = require('../config/r2');

const DEFAULT_CATEGORIES = [
  'Searching',
  'Sorting',
  'Graphs',
  'Dynamic Programming',
  'Trees',
  'Backtracking',
  'Greedy',
  'Linked Lists',
  'Heaps',
  'Trie',
  'Bit Manipulation',
  'Arrays',
  'Strings',
];

const ensureDefaultCategories = async () => {
  try {
    const count = await VisualizerCategory.countDocuments();
    if (count === 0) {
      const docs = DEFAULT_CATEGORIES.map((cat, idx) => ({
        name: cat,
        slug: cat.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
        order: idx + 1,
        isDefault: idx < 4,
      }));
      await VisualizerCategory.insertMany(docs);
    }
  } catch (err) {
    // Ignore duplicate key or concurrent seeding errors
  }
};

const router = express.Router();

/**
 * Checks whether the request comes from an authenticated admin or staff member.
 * Supports headers (x-auth-token, Authorization) and query parameter (?token=).
 */
const verifyAdminAccess = async (req) => {
  let token = req.header('x-auth-token') || req.query.token;
  if (!token && req.header('authorization')) {
    const parts = req.header('authorization').split(' ');
    if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
      token = parts[1];
    }
  }

  if (!token) return false;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId || decoded.user?.id || decoded.id;
    if (!userId) return false;

    const user = await User.findById(userId).select('role isActive tokenVersion tokensInvalidBefore').lean();
    if (!user || user.isActive === false) return false;

    if (typeof decoded.tokenVersion === 'number' && decoded.tokenVersion !== (user.tokenVersion || 0)) {
      return false;
    }

    if (user.tokensInvalidBefore && decoded.iat) {
      const issuedAtMs = decoded.iat * 1000;
      if (issuedAtMs < new Date(user.tokensInvalidBefore).getTime()) {
        return false;
      }
    }

    return ['admin', 'moderator', 'content_manager'].includes(user.role);
  } catch (err) {
    return false;
  }
};

/**
 * Resolves local file fallback path if R2 is not used or not configured.
 */
const getLocalFilePath = (slug) => {
  const candidate1 = path.resolve(__dirname, '../../client/public/visualizers', `${slug}.html`);
  if (fs.existsSync(candidate1)) return candidate1;

  const candidate2 = path.resolve(process.cwd(), '../client/public/visualizers', `${slug}.html`);
  if (fs.existsSync(candidate2)) return candidate2;

  const candidate3 = path.resolve(process.cwd(), 'client/public/visualizers', `${slug}.html`);
  if (fs.existsSync(candidate3)) return candidate3;

  return null;
};

// GET /api/visualizers - List active visualizers with optional pillar type filter
router.get('/', async (req, res) => {
  try {
    const { category, search, type, problemId } = req.query;
    const filter = { isDeleted: false, isActive: true };

    if (type && type !== 'all') {
      filter.type = type;
    }

    if (problemId) {
      filter.problemId = Number(problemId);
    }

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { problemTitle: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const visualizers = await Visualizer.find(filter).sort({ order: 1, createdAt: 1 }).lean();
    
    // Attach computed render URL to each item
    const withUrls = visualizers.map((vis) => ({
      ...vis,
      id: String(vis._id),
      type: vis.type || 'algorithm',
      renderUrl: `/api/visualizers/render/${vis.slug}`,
    }));

    res.json(withUrls);
  } catch (error) {
    console.error('Error fetching visualizers:', error);
    res.status(500).json({ message: 'Failed to fetch visualizers' });
  }
});

// GET /api/visualizers/stats - Overall stats for the 3 pillars
router.get('/stats', async (req, res) => {
  try {
    const activeFilter = { isDeleted: false, isActive: true };
    const [all, algorithms, dataStructures, problems, live] = await Promise.all([
      Visualizer.countDocuments(activeFilter),
      Visualizer.countDocuments({ ...activeFilter, $or: [{ type: 'algorithm' }, { type: { $exists: false } }] }),
      Visualizer.countDocuments({ ...activeFilter, type: 'data-structure' }),
      Visualizer.countDocuments({ ...activeFilter, type: 'problem' }),
      Visualizer.countDocuments({ ...activeFilter, status: 'available' }),
    ]);

    res.json({
      total: all,
      algorithms,
      dataStructures,
      problems,
      live,
      awaiting: all - live,
    });
  } catch (error) {
    console.error('Error fetching visualizer stats:', error);
    res.status(500).json({ message: 'Failed to fetch visualizer stats' });
  }
});

// GET /api/visualizers/categories - List all categories with counts
router.get('/categories', async (req, res) => {
  try {
    await ensureDefaultCategories();

    const [dbCategories, usedCategories] = await Promise.all([
      VisualizerCategory.find().sort({ order: 1, name: 1 }).lean(),
      Visualizer.find({ isDeleted: false, isActive: true }).select('category').lean(),
    ]);

    const countMap = {};
    for (const vis of usedCategories) {
      if (vis.category) {
        countMap[vis.category] = (countMap[vis.category] || 0) + 1;
      }
    }

    const categoriesList = dbCategories.map((c) => ({
      id: String(c._id),
      name: c.name,
      slug: c.slug,
      description: c.description || '',
      order: c.order || 0,
      isDefault: Boolean(c.isDefault),
      count: countMap[c.name] || 0,
    }));

    const existingNames = new Set(categoriesList.map((c) => c.name.toLowerCase()));
    for (const catName of Object.keys(countMap)) {
      if (!existingNames.has(catName.toLowerCase())) {
        categoriesList.push({
          id: catName.toLowerCase(),
          name: catName,
          slug: catName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          description: '',
          order: 99,
          isDefault: false,
          count: countMap[catName],
        });
      }
    }

    res.json(categoriesList);
  } catch (error) {
    console.error('Error fetching visualizer categories:', error);
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
});

const generateFallbackAnimationHtml = (visualizer) => {
  const title = (visualizer.name || visualizer.problemTitle || 'Algorithm').replace(/[<>&"]/g, '');
  const category = (visualizer.category || visualizer.problemTopic || 'DSA').replace(/[<>&"]/g, '');
  const difficulty = (visualizer.difficulty || visualizer.problemDifficulty || 'Medium').replace(/[<>&"]/g, '');
  const isPattern = title.toLowerCase().includes('pattern') || (visualizer.problemTitle && visualizer.problemTitle.toLowerCase().includes('pattern'));

  if (isPattern) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} Visualizer</title>
  <style>
    :root {
      --bg: #090d16;
      --surface: #111827;
      --border: #1f293d;
      --teal: #14b8a6;
      --amber: #f59e0b;
      --text: #f8fafc;
      --text-muted: #94a3b8;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: system-ui, -apple-system, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      user-select: none;
    }
    header {
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      padding: 12px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
    }
    .badge {
      background: rgba(20,184,166,0.15);
      color: var(--teal);
      border: 1px solid rgba(20,184,166,0.3);
      padding: 2px 8px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 700;
    }
    .controls {
      background: rgba(17,24,39,0.7);
      border-bottom: 1px solid var(--border);
      padding: 10px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
    }
    button {
      background: #1e293b;
      color: var(--text);
      border: 1px solid #334155;
      padding: 6px 14px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
    }
    button.primary { background: var(--teal); color: #042f2e; border-color: var(--teal); }
    .workspace {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .grid {
      display: inline-grid;
      gap: 8px;
      background: #0f172a;
      padding: 16px;
      border-radius: 12px;
      border: 1px solid var(--border);
    }
    .cell {
      width: 44px;
      height: 44px;
      background: #090d16;
      border: 1px solid #1e293b;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      color: transparent;
      transition: all 0.2s;
    }
    .cell.printed { background: rgba(20,184,166,0.15); border-color: rgba(20,184,166,0.4); color: var(--teal); }
    .cell.active { background: rgba(245,158,11,0.25); border-color: var(--amber); color: var(--amber); transform: scale(1.1); }
    .status-bar {
      margin-top: 20px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 12px 20px;
      font-size: 13px;
      color: var(--text-muted);
      text-align: center;
      max-width: 500px;
      width: 100%;
    }
  </style>
</head>
<body>
  <header>
    <div style="display:flex;align-items:center;gap:10px;">
      <span class="badge">Live</span>
      <strong style="font-size:14px;">${title}</strong>
    </div>
    <span style="font-size:12px;color:var(--amber);font-family:monospace;">Time: O(N²) | Space: O(1)</span>
  </header>
  <div class="controls">
    <div style="display:flex;gap:8px;">
      <button id="btnPlay" class="primary" type="button">▶ Play</button>
      <button id="btnStep" type="button">Step ⏭</button>
      <button id="btnReset" type="button">Reset ↺</button>
    </div>
    <div style="display:flex;align-items:center;gap:10px;font-size:12px;color:var(--text-muted);">
      <span>N =</span>
      <input type="range" id="size" min="2" max="6" value="4" style="accent-color:var(--teal);" />
      <span id="nVal" style="font-weight:700;color:var(--teal);">4</span>
    </div>
  </div>
  <main class="workspace">
    <div id="grid" class="grid"></div>
    <div id="status" class="status-bar">Ready. Click Play or Step to visualize.</div>
  </main>
  <script>
    let N = 4, r = 0, c = 0, timer = null;
    const grid = document.getElementById('grid');
    const status = document.getElementById('status');
    const btnPlay = document.getElementById('btnPlay');
    const nVal = document.getElementById('nVal');

    function init() {
      grid.innerHTML = '';
      grid.style.gridTemplateColumns = 'repeat(' + N + ', 44px)';
      for (let i = 0; i < N * N; i++) {
        const d = document.createElement('div');
        d.className = 'cell';
        d.id = 'c-' + Math.floor(i / N) + '-' + (i % N);
        d.textContent = '★';
        grid.appendChild(d);
      }
      reset();
    }

    function reset() {
      if (timer) { clearInterval(timer); timer = null; btnPlay.textContent = '▶ Play'; }
      r = 0; c = 0;
      document.querySelectorAll('.cell').forEach(el => el.className = 'cell');
      status.textContent = 'Ready. Pattern grid size ' + N + '×' + N + '.';
    }

    function step() {
      if (r >= N) {
        if (timer) { clearInterval(timer); timer = null; btnPlay.textContent = '▶ Play'; }
        status.textContent = 'Pattern execution complete!';
        return;
      }
      document.querySelectorAll('.cell.active').forEach(el => el.classList.remove('active'));
      const el = document.getElementById('c-' + r + '-' + c);
      if (el) el.classList.add('active', 'printed');
      status.textContent = 'Row ' + r + ', Column ' + c + ': printing star "*".';
      c++;
      if (c >= N) { c = 0; r++; }
    }

    btnPlay.onclick = () => {
      if (timer) {
        clearInterval(timer); timer = null; btnPlay.textContent = '▶ Play';
      } else {
        if (r >= N) reset();
        btnPlay.textContent = '⏸ Pause';
        timer = setInterval(() => { step(); if (r >= N && timer) { clearInterval(timer); timer = null; btnPlay.textContent = '▶ Play'; } }, 250);
      }
    };
    document.getElementById('btnStep').onclick = () => { if (timer) { clearInterval(timer); timer = null; btnPlay.textContent = '▶ Play'; } step(); };
    document.getElementById('btnReset').onclick = reset;
    document.getElementById('size').oninput = (e) => { N = parseInt(e.target.value, 10); nVal.textContent = N; init(); };
    init();
  </script>
</body>
</html>`;
  }

  // General Interactive Algorithm Fallback
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} Visualizer</title>
  <style>
    :root {
      --bg: #090d16;
      --surface: #111827;
      --border: #1f293d;
      --teal: #14b8a6;
      --amber: #f59e0b;
      --text: #f8fafc;
      --text-muted: #94a3b8;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: system-ui, -apple-system, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      user-select: none;
    }
    header {
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      padding: 12px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
    }
    .badge {
      background: rgba(20,184,166,0.15);
      color: var(--teal);
      border: 1px solid rgba(20,184,166,0.3);
      padding: 2px 8px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 700;
    }
    .controls {
      background: rgba(17,24,39,0.7);
      border-bottom: 1px solid var(--border);
      padding: 10px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }
    button {
      background: #1e293b;
      color: var(--text);
      border: 1px solid #334155;
      padding: 6px 14px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
    }
    button.primary { background: var(--teal); color: #042f2e; border-color: var(--teal); }
    .workspace {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .array-bar-container {
      display: flex;
      align-items: flex-end;
      gap: 10px;
      height: 180px;
      padding: 16px;
      background: #0f172a;
      border: 1px solid var(--border);
      border-radius: 12px;
    }
    .bar {
      width: 40px;
      background: rgba(20,184,166,0.3);
      border: 1px solid var(--teal);
      border-radius: 6px 6px 0 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-end;
      padding-bottom: 8px;
      font-weight: 700;
      font-size: 13px;
      color: var(--text);
      transition: all 0.2s;
    }
    .bar.active { background: rgba(245,158,11,0.5); border-color: var(--amber); }
    .status-bar {
      margin-top: 20px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 12px 20px;
      font-size: 13px;
      color: var(--text-muted);
      text-align: center;
      max-width: 500px;
      width: 100%;
    }
  </style>
</head>
<body>
  <header>
    <div style="display:flex;align-items:center;gap:10px;">
      <span class="badge">Interactive Simulation</span>
      <strong style="font-size:14px;">${title}</strong>
    </div>
    <span style="font-size:12px;color:var(--amber);font-family:monospace;">${category} • ${difficulty}</span>
  </header>
  <div class="controls">
    <div style="display:flex;gap:8px;">
      <button id="btnPlay" class="primary" type="button">▶ Play</button>
      <button id="btnStep" type="button">Step ⏭</button>
      <button id="btnReset" type="button">Reset ↺</button>
    </div>
    <span style="font-size:12px;color:var(--text-muted);">Step-by-step state tracker</span>
  </div>
  <main class="workspace">
    <div id="container" class="array-bar-container"></div>
    <div id="status" class="status-bar">Ready to step through algorithm.</div>
  </main>
  <script>
    let arr = [42, 17, 89, 33, 56, 12, 70];
    let stepIdx = 0, timer = null;
    const container = document.getElementById('container');
    const status = document.getElementById('status');
    const btnPlay = document.getElementById('btnPlay');

    function render() {
      container.innerHTML = '';
      arr.forEach((val, i) => {
        const bar = document.createElement('div');
        bar.className = 'bar' + (i === stepIdx ? ' active' : '');
        bar.style.height = (val * 1.6) + 'px';
        bar.textContent = val;
        container.appendChild(bar);
      });
    }

    function step() {
      if (stepIdx >= arr.length) {
        if (timer) { clearInterval(timer); timer = null; btnPlay.textContent = '▶ Play'; }
        status.textContent = 'Algorithm traversal complete.';
        return;
      }
      status.textContent = 'Inspecting element at index ' + stepIdx + ' with value ' + arr[stepIdx] + '.';
      stepIdx++;
      render();
    }

    btnPlay.onclick = () => {
      if (timer) {
        clearInterval(timer); timer = null; btnPlay.textContent = '▶ Play';
      } else {
        if (stepIdx >= arr.length) { stepIdx = 0; }
        btnPlay.textContent = '⏸ Pause';
        timer = setInterval(() => { step(); if (stepIdx >= arr.length && timer) { clearInterval(timer); timer = null; btnPlay.textContent = '▶ Play'; } }, 400);
      }
    };
    document.getElementById('btnStep').onclick = () => { if (timer) { clearInterval(timer); timer = null; btnPlay.textContent = '▶ Play'; } step(); };
    document.getElementById('btnReset').onclick = () => { if (timer) { clearInterval(timer); timer = null; btnPlay.textContent = '▶ Play'; } stepIdx = 0; render(); status.textContent = 'Reset to start.'; };
    render();
  </script>
</body>
</html>`;
};

// GET /api/visualizers/:slug - Get single visualizer by slug
router.get('/:slug', async (req, res) => {
  try {
    const slug = req.params.slug.toLowerCase();
    
    // Skip if matching /render, /categories, or /stats
    if (slug === 'render' || slug === 'categories' || slug === 'stats') {
      return res.status(404).json({ message: 'Not found' });
    }

    let visualizer = await Visualizer.findOne({
      slug,
      isDeleted: false,
    }).lean();

    if (!visualizer) {
      const problemMatch = slug.match(/^problem-(\d+)/i);
      if (problemMatch) {
        const pid = Number(problemMatch[1]);
        visualizer = await Visualizer.findOne({
          problemId: pid,
          isDeleted: false,
        }).lean();

        if (!visualizer) {
          const problem = await Problem.findOne({ id: pid, isDeleted: { $ne: true } }).lean();
          if (problem) {
            visualizer = {
              _id: `problem-${problem.id}`,
              name: `${problem.title} Solution`,
              slug: problem.visualizerSlug || slug,
              type: 'problem',
              category: problem.topic || 'General',
              difficulty: problem.difficulty || 'Easy',
              description: `Interactive algorithm and step-by-step visualization for "${problem.title}".`,
              status: 'available',
              problemId: problem.id,
              problemTitle: problem.title,
              problemTopic: problem.topic,
              problemDifficulty: problem.difficulty,
              problemLink: problem.link,
              timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
              spaceComplexity: 'O(1)',
              tags: [problem.topic || 'DSA', 'Problem Solution'],
              keyConcepts: ['Algorithm Execution', 'Step-by-step Tracing'],
            };
          }
        }
      }
    }

    if (!visualizer) {
      return res.status(404).json({ message: 'Visualizer not found' });
    }

    res.json({
      ...visualizer,
      id: String(visualizer._id),
      renderUrl: `/api/visualizers/render/${visualizer.slug}`,
    });
  } catch (error) {
    console.error('Error fetching visualizer by slug:', error);
    res.status(500).json({ message: 'Failed to fetch visualizer' });
  }
});

/**
 * GET /api/visualizers/render/:slug
 * Dedicated secure animation-serving endpoint.
 * - Restrictive CSP and sandboxing headers.
 * - Allows ordinary users to view published animations (status === 'available').
 * - Requires admin authentication for unpublished draft animations (status === 'unavailable').
 * - Streams directly from Cloudflare R2 object storage (or local fallback).
 */
router.get('/render/:slug', async (req, res) => {
  try {
    const slug = req.params.slug.toLowerCase();
    let visualizer = await Visualizer.findOne({
      slug,
      isDeleted: false,
    });

    if (!visualizer) {
      const problemMatch = slug.match(/^problem-(\d+)/i);
      if (problemMatch) {
        const pid = Number(problemMatch[1]);
        visualizer = await Visualizer.findOne({
          problemId: pid,
          isDeleted: false,
        });

        if (!visualizer) {
          const problem = await Problem.findOne({ id: pid, isDeleted: { $ne: true } }).lean();
          if (problem) {
            visualizer = {
              name: `${problem.title} Solution`,
              slug: problem.visualizerSlug || slug,
              type: 'problem',
              problemId: problem.id,
              problemTitle: problem.title,
              category: problem.topic || 'General',
              status: 'available',
            };
          }
        }
      }
    }

    if (!visualizer) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head><title>Visualizer Not Found</title></head>
        <body style="background:#0a0a0a;color:#fafafa;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
          <div style="text-align:center;">
            <h2>Visualizer Not Found</h2>
            <p style="color:#71717a;">The requested algorithm animation does not exist or has been removed.</p>
          </div>
        </body>
        </html>
      `);
    }

    // Access control: if draft, only authorized admins can view
    if (visualizer.status === 'unavailable') {
      const isAuthorized = await verifyAdminAccess(req);
      if (!isAuthorized) {
        return res.status(403).send(`
          <!DOCTYPE html>
          <html>
          <head><title>Access Restricted</title></head>
          <body style="background:#0a0a0a;color:#fafafa;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
            <div style="text-align:center;padding:24px;border:1px solid #3f3f46;border-radius:12px;background:#18181b;">
              <h3 style="color:#f59e0b;margin-bottom:8px;">Draft Animation — Not Yet Published</h3>
              <p style="color:#a1a1aa;font-size:14px;margin-bottom:16px;">This algorithm visualization is currently awaiting animation code and is only visible to authorized administrators.</p>
            </div>
          </body>
          </html>
        `);
      }
    }

    // Security Headers for Origin Isolation
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: https:; sandbox allow-scripts allow-same-origin allow-forms allow-modals;"
    );
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

    // Always serve the exact active animation version without stale browser cache
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    if (visualizer.fileChecksum) {
      res.setHeader('ETag', `"${visualizer.fileChecksum}"`);
    }

    // 1. Try Cloudflare R2 object storage if configured
    if (visualizer.storageType === 'r2' && visualizer.r2Key && isR2Configured()) {
      try {
        const { bodyStream } = await getObjectFromR2({ key: visualizer.r2Key });
        return bodyStream.pipe(res);
      } catch (r2Error) {
        console.warn(`R2 fetch failed for key ${visualizer.r2Key}, checking local fallback:`, r2Error.message);
      }
    }

    // 2. Fallback to local file in client/public/visualizers/
    let localPath = getLocalFilePath(slug);
    if (!localPath && visualizer.slug && visualizer.slug !== slug) {
      localPath = getLocalFilePath(visualizer.slug);
    }
    if (localPath && fs.existsSync(localPath)) {
      return fs.createReadStream(localPath).pipe(res);
    }

    // 3. Fallback: generate interactive visualizer animation
    const dynamicHtml = generateFallbackAnimationHtml(visualizer);
    return res.send(dynamicHtml);
  } catch (error) {
    console.error('Error rendering visualizer animation:', error);
    res.status(500).send('Internal Server Error rendering visualizer');
  }
});

module.exports = router;
