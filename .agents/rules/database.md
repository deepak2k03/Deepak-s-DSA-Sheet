---
description: Database guidelines for MongoDB, Mongoose schemas, indexing, and data safety
globs: server/models/**/*, server/routes/**/*, server/config/db.js
---

# Database Operations & Schema Rules

These rules govern all database operations, queries, and schema definitions with MongoDB and Mongoose.

## 1. Schema Conventions
- Define all schemas with `{ timestamps: true }` so `createdAt` and `updatedAt` are tracked automatically.
- Primary models:
  - `User`: Accounts, auth credentials, solve history array, revision array, problem notes, role, lock state.
  - `Problem`: Numerical `id`, `title`, `link`, `difficulty`, `topic`, `visualizerSlug`, `hasVisualizer`, `approaches` array, `order`, `isDeleted`.
  - `Topic`: `name`, unique `slug`, `description`, `difficulty`, `iconKey`, `order`, `isActive`, `isDeleted`.
  - `POTD`: Unique `date` (YYYY-MM-DD), `problem` ObjectId reference, custom metadata.
  - `Visualizer`: Unique `slug`, `type` (`algorithm` | `data-structure` | `problem`), `problemId` (Number), `category`, `status`, `r2Key`, `storageType`.
  - `VisualizerCategory`: `name`, unique `slug`, `order`, `isDefault`.
  - `AuditLog`: `actorId`, `actorEmail`, `action`, `entityType`, `entityId`, `metadata`, `ip`, `userAgent`.
  - `Settings`: Dynamic key-value configuration (`leaderboard_settings`, etc.).

## 2. Indexing Strategy
- Explicitly index fields used in high-frequency queries and sorting:
  - `Problem.index({ order: 1, id: 1 })`
  - `Problem.index({ topic: 1 })`
  - `Visualizer.index({ type: 1, category: 1 })`
  - `Visualizer.index({ problemId: 1 })`
  - `AuditLog.index({ createdAt: -1 })`
  - `AuditLog.index({ action: 1, createdAt: -1 })`

## 3. Query & Soft-Delete Practices
- Never perform destructive `deleteOne` or `deleteMany` on curriculum entities (`Topic`, `Problem`, `Visualizer`).
- Set `isDeleted: true` and `deletedAt: new Date()`.
- Public queries must always filter `{ isDeleted: { $ne: true } }` (or `{ isActive: true, isDeleted: { $ne: true } }`).
- Administrative queries must support status filtering (`'all'`, `'live'`, `'deleted'`).

## 4. Topic Name Normalization
- Problems may have historical topic variations (`'basics'`, `'basic'`, `'arrays'`, `'linked lists'`, `'dp'`).
- In MongoDB queries, query with flexible regex or canonical slug filters (`getCanonicalTopicSlug()`) to ensure no problem is omitted due to string casing or pluralization.

