# Client (Frontend) Agent Instructions

This directory houses the React 18 + Vite + TypeScript frontend for **DSA Sheet**.

## Key Directories & Responsibilities
- `src/components/`: Reusable UI elements (`Header`, `Footer`, `ThemeToggle`, `VisualizerFrame`, `ErrorBoundary`, `AdminRoute`, `CodeBlock`, `DSAConquestAnimation`).
- `src/pages/`: Main application routes (`HomePage`, `Topics`, `TopicPage`, `SolutionPage`, `POTDPage`, `LeaderboardPage`, `VisualizersPage`, `VisualizerDetailPage`, `ProfilePage`, `AdminPage`, Auth pages).
- `src/pages/admin/`: Modular admin tabs (`AdminOverviewTab`, `AdminTopicsTab`, `AdminProblemsTab`, `AdminVisualizersTab`, `AdminUsersTab`, `AdminPOTDTab`, `AdminLeaderboardTab`, `AdminAuditTab`, `AdminUIPrimitives`).
- `src/pages/admin/modals/`: Specialized admin modals (`VisualizerSettingsModal`, `VisualizerCodeModal`, `VisualizerReplaceModal`, `VisualizerPreviewModal`, `ProblemSolutionModal`, `CategoryManagerModal`).
- `src/contexts/`: `ThemeContext` providing theme state (`dark` / `light`) and CSS variable synchronization.
- `src/data/`: `topics.tsx` (topic pillars and metadata), `visualizers.ts` (visualizer catalog and definitions).
- `src/utils/`: `auth.ts` (JWT session management), `topics.ts` (canonical topic slugs), `visualizerApi.ts`, `topicApi.ts`.

## Rules & Coding Standards
1. **Strict TypeScript**: Always type props, state, and callbacks. Never use implicit `any`.
2. **Design Token Styling**: Always use CSS variables (`var(--bg-base)`, `var(--text-primary)`, `var(--border-strong)`) or Tailwind classes aligned with dark/light themes.
3. **Canonical Slugs**: When querying or filtering problems by topic, always use `getCanonicalTopicSlug(slug)` to ensure consistency across singular/plural terms (`basics` vs `basic`).
4. **Resilient Visualizer Association**: When determining if a problem has a visualizer, check both `problem.hasVisualizer`, `problem.visualizerSlug`, and `visualizer.problemId`.
5. **No Infinite Render Loops**: Never trigger state mutations in unconstrained `useEffect` hooks. Ensure effect dependencies are minimal and stable.
6. **Error Boundary**: Critical views must be protected with `ErrorBoundary` to prevent white screens on render faults.
7. **Verification**: After editing client code, run:
   - `npm --prefix client test`
   - `npm --prefix client run build`

