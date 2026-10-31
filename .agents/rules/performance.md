---
description: Performance optimization rules, caching patterns, bundle limits, and query efficiency
globs: server/**/*.{js,json}, client/src/**/*.{ts,tsx}
---

# Performance & Caching Rules

These rules maximize client responsiveness and minimize server load and database overhead.

## 1. Client-Side Rendering Efficiency
- **In-Memory Catalog Filtering**: Load the full problem bank on initial Admin mount (`limit: 5000`) to enable instant, zero-latency topic switching and media filtering without repeated network waterfalls.
- **Memoized Calculations**: Use `useMemo` for derived datasets (`filteredProblems`, `pillarGroups`, `paginatedProblems`).
- **Iframe Isolation**: Ensure HTML5 animations render in isolated iframes so heavy Canvas/WebGL visualizers do not degrade React UI performance.

## 2. Server-Side Caching
- **Problem Catalog Cache**: `server/utils/problemCache.js` maintains in-memory caching of public problems. Always serve from cache if available.
- **Leaderboard Cache**: `server/utils/leaderboardCache.js` caches calculated rankings with configurable TTL (`Settings.leaderboard_settings.cacheDurationSeconds`, default 30s).
- **Proactive Invalidation**: Invalidate caches only when mutations occur (`clearProblemsCache()`, `clearLeaderboardCache()`).

## 3. Database Query Optimization
- Use `.lean()` for read-only operations to avoid Mongoose document instantiation overhead.
- Use `.select()` to retrieve only required fields (e.g. `select('topic')` when computing counts).
- Use `countDocuments()` rather than loading arrays into memory to measure length.

## 4. Asset Delivery & Cloudflare R2
- Store large interactive HTML visualizer bundles in Cloudflare R2 object storage.
- Serve visualizer assets with `ETag` headers derived from `fileChecksum` to enable browser-level caching.

