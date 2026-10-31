---
description: Frontend development guidelines for React 18, Vite, TypeScript, and state management
globs: client/**/*
---

# Frontend Development Rules

These rules apply whenever creating, modifying, or refactoring client-side code in `client/src/`.

## 1. Component Architecture & Structure
- Place reusable visual components in `client/src/components/`.
- Place top-level page views in `client/src/pages/`.
- Decompose complex admin tabs into dedicated files in `client/src/pages/admin/` and modal dialogs in `client/src/pages/admin/modals/`.
- Keep component interfaces explicit using TypeScript `interface` or `type` declarations exported alongside the component.

## 2. State & Effect Discipline
- Never set state synchronously inside a `useEffect` without an explicit condition, dependency, or cancellation guard. Unbounded effect updates will cause `Maximum update depth exceeded` render loops.
- Use `useMemo` for heavy derivations (such as filtering 500+ problems, computing group metrics, or indexing collections).
- When filtering items, always provide default fallback values (`p.title || ''`, `p.topic || ''`) to avoid runtime `TypeError: undefined is not an object`.

## 3. Visualizer Integration
- Visualizers are embedded using `VisualizerFrame.tsx` with sandboxed `iframe` configurations (`sandbox="allow-scripts allow-same-origin"`).
- Always verify that a problem's visualizer link can resolve both from `problem.visualizerSlug` and from the `visualizers` catalog via `v.problemId === problem.problemNumber`.

## 4. Error Handling & Resilience
- All routes must remain protected under `ErrorBoundary.tsx`.
- Never let an unhandled exception or missing module import crash the whole page into a blank screen.
- Catch API network rejections and display actionable notices using `setError()` or toast messages.

## 5. Verification Checklist
- Run TypeScript compilation check: `npx tsc --noEmit -p client/tsconfig.app.json`
- Run client unit tests: `npm --prefix client test`
- Run production build: `npm --prefix client run build`

