# API Reference

This document provides a comprehensive specification of all REST endpoints exposed by the DSA Sheet Express server.

All endpoints are prefixed with `/api`. Protected routes require an `Authorization: Bearer <jwt_token>` header.

---

## 1. Authentication & User Profile (`/api/auth`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/signup` | Public | Register with `name`, `email`, and `password`. |
| `POST` | `/api/auth/login` | Public | Authenticate with `email` and `password`. Returns JWT and user payload. |
| `POST` | `/api/auth/google` | Public | Verify Google OAuth ID token and authenticate or register user. |
| `POST` | `/api/auth/request-password-reset` | Public | Request a reset token delivered via Resend email. |
| `POST` | `/api/auth/reset-password/:token` | Public | Reset account password using verified token. |
| `POST` | `/api/auth/request-email-verification`| Auth | Trigger email verification link. |
| `POST` | `/api/auth/verify-email` | Auth | Verify user email address with code. |
| `GET` | `/api/auth/me` | Auth | Fetch currently authenticated user profile and solved progress. |
| `GET` | `/api/auth/leaderboard` | Public | Retrieve cached global rankings, levels, and solved stats. |

---

## 2. Problems & Progress Tracking (`/api/problems`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/problems/all` | Public | Fetch all non-deleted problems. Uses in-memory caching. |
| `GET` | `/api/problems/single/:id` | Public | Fetch a single problem by ID or problemNumber. |
| `GET` | `/api/problems/potd` | Public | Fetch the active Problem of the Day challenge. |
| `GET` | `/api/problems/:topic` | Public | Fetch problems belonging to a canonical topic slug. |
| `POST` | `/api/problems/sync` | Auth | Toggle problem solved status, recalculating XP, level, and streak. |
| `POST` | `/api/problems/sync-revision` | Auth | Toggle problem revision bookmark. |
| `POST` | `/api/problems/sync-note` | Auth | Save personal user notes/markdown for a specific problem. |

---

## 3. Topics & Taxonomy (`/api/topics`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/topics` | Public | List all active topics sorted by display order with canonical slugs. |

---

## 4. Visualizers (`/api/visualizers`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/visualizers` | Public | List published visualizers with optional `topic`, `difficulty`, `tag` filters. |
| `GET` | `/api/visualizers/stats` | Public | Retrieve high-level visualizer metrics (total count, views, categories). |
| `GET` | `/api/visualizers/categories`| Public | Fetch visualizer taxonomy categories. |
| `GET` | `/api/visualizers/:slug` | Public | Fetch visualizer metadata by slug and increment view count. |
| `GET` | `/api/visualizers/render/:slug` | Public | Stream or proxy the sandboxed HTML code for the visualizer. |

---

## 5. Admin Control Center (`/api/admin`)

*All admin endpoints require an authenticated user with `role: "admin"` or `role: "superadmin"`.*

### 5.1 Platform Overview & Auditing
- `GET /api/admin/overview`: Aggregate counts of users, topics, problems, visualizers, and submission metrics.
- `GET /api/admin/audit-logs`: Paginated audit logs with actor info, action type, and JSON difference payload.

### 5.2 Topic Management
- `GET /api/admin/topics`: Retrieve all topics including hidden and soft-deleted items.
- `POST /api/admin/topics`: Create a new topic (`name`, `slug`, `description`, `icon`, `difficulty`).
- `PUT /api/admin/topics/reorder`: Update display ordering array.
- `PUT /api/admin/topics/:topicId`: Update topic details and live status.
- `DELETE /api/admin/topics/:topicId`: Soft-delete topic.
- `POST /api/admin/topics/:topicId/restore`: Restore soft-deleted topic.

### 5.3 Problem Bank Management
- `GET /api/admin/problems`: Retrieve problems with pagination, topic, difficulty, status, and media filters.
- `GET /api/admin/problems/list-minimal`: Lightweight problem ID and title list for linking visualizers and POTD.
- `POST /api/admin/problems`: Create a new problem. Automatically invalidates problem cache.
- `PUT /api/admin/problems/reorder`: Update problem order indices.
- `PUT /api/admin/problems/:problemId`: Update problem details (links, difficulty, topic, visualizer slug).
- `DELETE /api/admin/problems/:problemId`: Soft-delete problem (`isDeleted: true`).
- `POST /api/admin/problems/:problemId/restore`: Restore problem to active catalog.

### 5.4 Visualizer Management
- `GET /api/admin/visualizers`: List visualizers with full metadata and R2 storage status.
- `POST /api/admin/visualizers`: Create visualizer via file upload (HTML/JS) or code payload.
- `PUT /api/admin/visualizers/:id`: Update visualizer metadata, topic association, and problem number.
- `PATCH /api/admin/visualizers/:id/status`: Toggle publishing status (`draft`, `published`, `archived`).
- `GET /api/admin/visualizers/:id/code`: Retrieve raw HTML/JavaScript code from storage or database.
- `PUT /api/admin/visualizers/:id/code`: Update raw visualizer code directly.
- `DELETE /api/admin/visualizers/:id`: Soft-delete or archive visualizer.
- `GET /api/admin/visualizers/r2-status`: Healthcheck connection to Cloudflare R2 bucket.

### 5.5 User & Access Management
- `GET /api/admin/users`: Search and list registered users with pagination, role filters, and lockout states.
- `PATCH /api/admin/users/:userId`: Update user role (`user`, `admin`, `superadmin`) or unlock locked account.

### 5.6 POTD & Leaderboard Settings
- `POST /api/admin/potd`: Schedule or assign Problem of the Day for a given date.
- `GET /api/admin/leaderboard/settings`: Get current leaderboard scoring parameters.
- `PUT /api/admin/leaderboard/settings`: Update scoring weights and formulas.
- `POST /api/admin/leaderboard/refresh`: Force clear leaderboard in-memory cache and recompute rankings.

