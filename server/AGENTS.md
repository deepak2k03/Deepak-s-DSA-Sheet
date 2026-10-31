# Server (Backend) Agent Instructions

This directory houses the Node.js + Express 5 + MongoDB backend for **DSA Sheet**.

## Key Directories & Responsibilities
- `index.js`: Server entrypoint, middleware mounting, database connection, default topic and visualizer seeding, port listener.
- `config/`: `db.js` (Mongoose connection), `r2.js` (AWS SDK S3 client configured for Cloudflare R2).
- `models/`: Mongoose schemas (`User`, `Problem`, `Topic`, `POTD`, `Visualizer`, `VisualizerCategory`, `AuditLog`, `Settings`).
- `routes/`: Express route modules (`auth.js`, `problems.js`, `topics.js`, `visualizers.js`, `admin.js`).
- `middleware/`: `auth.js` (JWT verification & token decoding), `admin.js` (admin role check).
- `utils/`: `audit.js`, `email.js`, `leaderboardCache.js`, `leaderboardService.js`, `problemCache.js`, `rateLimiter.js`, `tokenSecurity.js`, `topics.js`, `userAccess.js`.
- `tests/`: Automated unit tests executed with the native Node.js test runner (`node --test tests/**/*.test.js`).

## Rules & Coding Standards
1. **Strict CommonJS**: Always use `require()` and `module.exports`.
2. **Serialization Completeness**: When returning model data from admin endpoints, ensure all essential fields (`visualizerSlug`, `hasVisualizer`, `approaches`, `isDeleted`, `order`) are included in serializer helper functions.
3. **Canonical Topic Matching**: Always normalize topic queries using `getCanonicalTopicSlug(topic)`. When querying MongoDB, use flexible regex matching or canonical comparisons to account for DB variations.
4. **Cache Invalidation**: Call `clearProblemsCache()` when problems are created, updated, or reordered; call `clearLeaderboardCache()` when user solves are registered or admin settings update.
5. **Security & Hashing**:
   - Never store plain text passwords, reset tokens, or email verification tokens.
   - Use `hashToken()` (SHA-256) for verification tokens and `bcrypt.hash()` for passwords.
   - Enforce `auth` and `adminOnly` on all administrative routes.
6. **Audit Trails**: Record significant changes via `writeAuditLog(req, { action, entityType, entityId, metadata })`.
7. **Verification**: After editing server code, run:
   - `npm --prefix server test`

