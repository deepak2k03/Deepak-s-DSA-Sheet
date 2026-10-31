---
name: feature-development
description: End-to-end procedure for planning, implementing, and verifying full-stack features in the DSA Sheet platform
---

# Feature Development Skill

Use this skill when implementing a new user-facing feature, adding an administrative capability, or introducing new API endpoints.

## 1. Pre-Implementation Checklist
1. **Analyze Requirements**: Determine which layers are touched (Client UI, Express Routes, Mongoose Models, Caches, or Third-Party Services).
2. **Consult Existing Rules**:
   - If touching client: Refer to `.agents/rules/frontend.md` and `.agents/rules/ui-ux.md`.
   - If touching server: Refer to `.agents/rules/backend.md` and `.agents/rules/api-design.md`.
   - If modifying database: Refer to `.agents/rules/database.md`.
3. **Check Naming & Normalization**:
   - For topic or category slugs, use `getCanonicalTopicSlug` / `server/utils/topics.js`.

---

## 2. Implementation Steps

### Step 1: Database Schema (if applicable)
- Edit or create model in `server/models/`.
- Ensure soft deletion fields (`isDeleted`, `deletedAt`) are included if the entity supports administrative deletion.
- Define appropriate indexes (e.g. `{ slug: 1, isDeleted: 1 }`).

### Step 2: Backend API & Route Handlers
- Implement endpoint in `server/routes/`.
- Apply authentication (`middleware/auth.js`) and administrative authorization (`middleware/admin.js`) as required.
- Add input validation early with `400 Bad Request` responses for invalid payloads.
- If data modifications affect problem lists or leaderboards, call `clearProblemsCache()` or `clearLeaderboardCache()`.
- If an admin performs the mutation, record the change via `server/utils/audit.js`.

### Step 3: Frontend Client Integration
- If new endpoints are added, create type definitions in `client/src/types/` or the relevant component.
- In `client/src/contexts/` or the target page in `client/src/pages/`, invoke the API using `fetch` with the `Authorization: Bearer <token>` header when authenticated.
- Match existing Dark Theme design tokens:
  - Surface: `bg-[#0B0F17]` (page) and `bg-[#111827]` (card/panel).
  - Borders: `border-slate-800` or `border-slate-800/80`.
  - Brand accents: `emerald-400` / `emerald-500` / `emerald-500/10`.
- Wrap asynchronous calls in try/catch and present user-friendly error banners or toast feedback.

---

## 3. Verification & Quality Gate
1. **Run Backend Tests**:
   ```bash
   npm --prefix server test
   ```
2. **Run Frontend Tests**:
   ```bash
   npm --prefix client test
   ```
3. **Verify Build**:
   ```bash
   npm --prefix client run build
   ```
4. **Update Documentation**:
   - If new routes were created, update `docs/api-reference.md`.
   - If schema changed, update `docs/database-schema.md`.

