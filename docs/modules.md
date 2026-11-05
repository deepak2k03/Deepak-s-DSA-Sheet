# Application Modules

This document breaks down the major functional modules within the client and server codebases, explaining their responsibilities and interactions.

## 1. Client Modules (`client/src/`)

### 1.1 Contexts & Global State
- **`contexts/AuthContext.tsx`**:
  - Manages authenticated user session, JWT storage in `localStorage`, login, logout, profile updates, and real-time solved problems tracking.
  - Automatically calculates progressive level ($\text{Level} = \lfloor\sqrt{\text{totalSolved} \times 0.45}\rfloor + 1$) and exposes synchronization methods for solved problem IDs.

### 1.2 Top-Level Route Pages (`pages/`)
- **`Topics.tsx`**: The main curriculum dashboard displaying topic cards grouped by category, showing completion progress, total problems count, and difficulty badges.
- **`TopicPage.tsx`**: Detailed list of problems under a selected topic with search, difficulty filtering, completion checkboxes, personal notes drawer, and direct links to code/video tutorials and interactive visualizers.
- **`POTDPage.tsx`**: Daily challenge interface showing the Problem of the Day, streak counters, historical participation, and solution submission status.
- **`VisualizersPage.tsx` & `VisualizerDetailPage.tsx`**: Interactive algorithm visualizer hub. Embeds standalone visualizers inside `components/VisualizerFrame.tsx` with iframe sandboxing.
- **`LeaderboardPage.tsx`**: Global competitive rankings displaying user scores, solved counts, levels, streaks, and platform badges. Clicking any learner opens `components/UserSolvedProblemsModal.tsx` showing their detailed profile and compact 2-column topic-wise solved problems.
- **`ProfilePage.tsx`**: User profile management supporting both personal view (`/profile`) and public profile views (`/profile/:username`). Features a balanced top dashboard (Solved Progress & Difficulty breakdown alongside a 52-week Activity Heatmap) and a dual-pane Master-Detail Curriculum & Solved Problems Explorer with topic navigation, responsive horizontal pill scrolling on mobile, live search, difficulty filters, compact 2-column problem cards, and pagination.
- **`LoginPage.tsx`, `RegisterPage.tsx`, `ForgotPasswordPage.tsx`, `ResetPasswordPage.tsx`**: Authentication screens supporting email/password and Google OAuth.
- **`SupportCreatorPage.tsx`**: Platform donation and community support page.

### 1.3 Admin Control Center (`pages/admin/`)
- **`AdminPage.tsx`**: Parent control shell managing active tab state, global notification banners, and responsive layout.
- **`AdminOverviewTab.tsx`**: High-level platform health metrics (total users, active topics, total problems, visualizers, daily submissions).
- **`AdminTopicsTab.tsx`**: Topic catalog CRUD, order re-arrangement, icon selection, and status toggles (Live/Hidden/Deleted).
- **`AdminProblemsTab.tsx`**: Sheet problem bank management with dual views (Problem Bank tabular view and Topic Hub accordion/pillar view), advanced filters (difficulty, status, visualizer availability), and modal editing.
- **`AdminVisualizersTab.tsx`**: Visualizer catalog management, Cloudflare R2 asset link configuration, topic assignment, and iframe testing.
- **`AdminUsersTab.tsx`**: User management table with role assignment (user, admin, superadmin), password reset triggers, and account lockout status.
- **`AdminPOTDTab.tsx`**: Daily challenge scheduler, manual problem assignment, and participation metrics.
- **`AdminLeaderboardTab.tsx`**: Scoring rules, XP multipliers, and ranking cache invalidation.
- **`AdminAuditTab.tsx`**: Read-only timeline of administrative actions with JSON change diffs, IP logging, and actor identification.

---

## 2. Server Modules (`server/`)

### 2.1 Route Handlers (`server/routes/`)
- **`routes/auth.js`**:
  - Handles `/api/auth/signup`, `/api/auth/login`, `/api/auth/google`, `/api/auth/me`, `/api/auth/profile/:username`, `/api/auth/leaderboard`, password reset, and email verification.
  - Enforces bcrypt hashing, rate limiting, and account lockout after repeated failures.
- **`routes/problems.js`**:
  - Public problem querying (`/api/problems`), topic-filtered queries, and individual problem retrieval.
  - User interaction endpoints: solve toggle (`/solve`), personal notes (`/notes`), and starred bookmarking (`/star`).
  - Utilizes `utils/problemCache.js` for sub-millisecond read responses.
- **`routes/topics.js`**:
  - Public topic listings (`/api/topics`) with canonical slug resolution (`utils/topics.js`).
- **`routes/visualizers.js`**:
  - Visualizer catalog, categories, statistics, and secure sandboxed rendering (`/api/visualizers/render/:slug`).
  - Supports streaming from Cloudflare R2, local file fallbacks (`client/public/visualizers/`), resilient problem-ID resolution, and built-in interactive animation generation.
- **`routes/admin.js`**:
  - Privileged management endpoints. Protected by `middleware/auth.js` and `middleware/admin.js`.
  - Writes comprehensive audit logs via `utils/audit.js` on every mutating request.

### 2.2 Core Utilities & Services (`server/utils/`)
- **`problemCache.js`**: In-memory caching layer with TTL and manual cache clearing (`clearProblemsCache()`).
- **`leaderboardCache.js` & `leaderboardService.js`**: Ranking calculation, leaderboard pagination, and cached top-scorer data.
- **`audit.js`**: Fire-and-forget asynchronous audit logger storing changes in the `AuditLog` collection.
- **`email.js`**: Resend API integration for password reset notification emails.
- **`tokenSecurity.js`**: Cryptographic token generation for password resets and hash verification.
- **`rateLimiter.js`**: In-memory or Redis-compatible rate limiting for login attempts, registration, and sensitive endpoints.
- **`topics.js`**: Canonical slug mapping preventing discrepancies between singular and plural forms (e.g. `basics` vs `basic`).

