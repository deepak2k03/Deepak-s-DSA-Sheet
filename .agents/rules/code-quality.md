---
description: Code quality, typing discipline, linting, formatting, and module boundary conventions
globs: **/*
---

# Code Quality & Standards

These rules define codebase-wide quality, typing, formatting, and architecture boundaries across both client and server packages.

## 1. Module Systems & File Boundaries
- **Client (`client/`)**: Pure ECMAScript Modules (ESM) + TypeScript (`.ts`, `.tsx`).
  - Use `import` and `export`. Never use `require()` or `module.exports`.
  - Vite handles asset and style bundling.
- **Server (`server/`)**: Pure Node.js CommonJS (`.js`).
  - Use `const x = require('x')` and `module.exports = ...`. Never use ESM `import` or `export default` in server code.
  - Native Node.js test runner uses `node --test tests/**/*.test.js`.

## 2. TypeScript Discipline (Client)
- **No Unchecked `any`**: Explicitly type props, state, API payloads, and utility inputs.
- **Nullable Defense**: Always defensively guard access on optional API fields using optional chaining (`?.`) or nullish coalescing (`??`).
- **Defensive String/Array Handling**: Guard `.toLowerCase()`, `.includes()`, `.filter()`, and `.map()` calls with safe fallbacks:
  ```typescript
  const title = (problem.title ?? '').toLowerCase();
  const tags = problem.tags ?? [];
  ```
- **Type Colocation**: Place API response types in `client/src/types/` or co-locate component-specific types directly in the component file when not reused globally.

## 3. Server-Side Robustness (Server)
- **Explicit Parameter Validation**: Always validate `req.body`, `req.params`, and `req.query` before querying Mongoose. Check for missing required fields and return `400 Bad Request` early.
- **Pagination Safety**: Ensure `page` and `limit` are parsed safely with defaults (`Math.max(1, parseInt(req.query.page) || 1)`) and clamp maximum limits to prevent denial of service through memory exhaustion.
- **Idempotent Updates**: Ensure mutations (PATCH, PUT, DELETE) leave database records in a consistent state and invalidate relevant in-memory caches.

## 4. Naming Conventions
- **Components & Pages**: PascalCase (e.g., `AdminProblemsTab.tsx`, `VisualizerFrame.tsx`).
- **Hooks**: camelCase prefixed with `use` (e.g., `useAuth.ts`, `useTheme.ts`).
- **Utility Functions**: camelCase (e.g., `getCanonicalTopicSlug`, `serializeProblem`, `calculateLevel`).
- **Constants & Enums**: UPPER_SNAKE_CASE (e.g., `CACHE_TTL_MS`, `DEFAULT_PAGE_SIZE`, `ALLOWED_ROLES`).
- **Mongoose Models**: PascalCase singular (e.g., `Problem.js`, `Topic.js`, `User.js`, `AuditLog.js`).

## 5. Clean Code & Hygiene
- **No Dead Code**: Remove unused imports, dead commented-out logic, and temporary debug `console.log` statements before finalizing code.
- **Preserve Documentation**: Retain all existing docstrings, explanatory comments, and mathematical derivations (e.g., progressive level formula).
- **Descriptive Error Messages**: Provide actionable error messages in catch blocks and API error responses so frontend users and logs pinpoint the exact issue.

