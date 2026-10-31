---
description: Backend development guidelines for Express 5, Node.js, routing, and controller logic
globs: server/**/*
---

# Backend Development Rules

These rules apply whenever developing, debugging, or maintaining server code in `server/`.

## 1. Modular Routing & Controller Structure
- Mount route modules in `server/index.js` using RESTful path prefixes (`/api/auth`, `/api/problems`, `/api/topics`, `/api/visualizers`, `/api/admin`).
- Do not mix public endpoints with administrative endpoints. Route all admin controls through `server/routes/admin.js` protected by `auth` and `adminOnly` middleware.
- Always use Express 5 asynchronous error handling or explicit `try / catch` blocks for every async route controller.

## 2. Model Serialization
- Never return raw Mongoose documents containing internal or sensitive fields (e.g. passwords, reset tokens, version keys).
- In `server/routes/admin.js`, use the dedicated serializers (`serializeProblem`, `serializeTopic`) and ensure newly added schema fields (like `hasVisualizer`, `visualizerSlug`, `approaches`, `isDeleted`) are explicitly included.

## 3. In-Memory Caching & Invalidation
- The server maintains in-memory problem caching (`server/utils/problemCache.js`) and leaderboard caching (`server/utils/leaderboardCache.js`).
- Call `clearProblemsCache()` immediately after any write operation on problems (create, update, delete, reorder, or visualizer attachment).
- Call `clearLeaderboardCache()` when user solve counts change or leaderboard settings are updated.

## 4. Environment & Secrets
- Never hardcode MongoDB URIs, JWT secrets, R2 credentials, or API keys. Access all configuration strictly via `process.env`.
- Ensure fallback behavior exists for local development when optional third-party credentials (like Cloudflare R2 or Resend) are omitted.

## 5. Verification Checklist
- Run automated server test suite: `npm --prefix server test`
- Verify server health endpoint: `GET /api/health` returns `{ status: 'ok' }`.

