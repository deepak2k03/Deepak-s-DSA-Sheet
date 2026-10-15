const path = require('path');
const fs = require('fs');
const express = require('express');
const jwt = require('jsonwebtoken');
const Visualizer = require('../models/Visualizer');
const User = require('../models/User');
const { isR2Configured, getObjectFromR2 } = require('../config/r2');

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
    if (!decoded || !decoded.user || !decoded.user.id) return false;

    const user = await User.findById(decoded.user.id).select('role isActive').lean();
    if (!user || user.isActive === false) return false;

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

// GET /api/visualizers - List all active visualizers
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = { isDeleted: false, isActive: true };

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const visualizers = await Visualizer.find(filter).sort({ order: 1, createdAt: 1 }).lean();
    
    // Attach computed render URL to each item
    const withUrls = visualizers.map((vis) => ({
      ...vis,
      id: String(vis._id),
      renderUrl: `/api/visualizers/render/${vis.slug}`,
    }));

    res.json(withUrls);
  } catch (error) {
    console.error('Error fetching visualizers:', error);
    res.status(500).json({ message: 'Failed to fetch visualizers' });
  }
});

// GET /api/visualizers/:slug - Get single visualizer by slug
router.get('/:slug', async (req, res) => {
  try {
    const slug = req.params.slug.toLowerCase();
    
    // Skip if matching /render
    if (slug === 'render') {
      return res.status(404).json({ message: 'Not found' });
    }

    const visualizer = await Visualizer.findOne({
      slug,
      isDeleted: false,
    }).lean();

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
    const visualizer = await Visualizer.findOne({
      slug,
      isDeleted: false,
    });

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
      "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: https:; sandbox allow-scripts allow-forms allow-modals;"
    );
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

    if (visualizer.status === 'available') {
      res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
    } else {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
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
    const localPath = getLocalFilePath(slug);
    if (localPath && fs.existsSync(localPath)) {
      return fs.createReadStream(localPath).pipe(res);
    }

    // 3. Fallback: return minimal skeleton if file is missing
    return res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${visualizer.name} Visualizer</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: system-ui, sans-serif;
      background-color: #0a0a0a;
      color: #fafafa;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
  </style>
</head>
<body>
  <div id="visualizer-container"></div>
</body>
</html>`);
  } catch (error) {
    console.error('Error rendering visualizer animation:', error);
    res.status(500).send('Internal Server Error rendering visualizer');
  }
});

module.exports = router;
