---
name: refactoring
description: Safe refactoring guidelines and procedures for extracting components, cleaning utilities, and optimizing controller logic without regressions
---

# Refactoring Skill

Use this skill when decomposing oversized components, consolidating duplicate logic into shared utilities, or modernizing controller implementations.

## 1. Principles of Safe Refactoring

1. **Preserve External Behavior**: A refactor must never alter the observable inputs, outputs, or side effects of a component or endpoint unless explicitly requested.
2. **One Change at a Time**: Separate structural reorganization (e.g. extracting a component or helper) from functional modifications or bug fixes.
3. **Verify Baseline First**: Run the existing test suite before initiating any refactoring step.
4. **Preserve Documentation**: Retain all mathematical derivations, formula explanations, and historical comments.

---

## 2. Common Refactoring Patterns

### 2.1 Decomposing Large React Components
When a component exceeds ~500 lines or manages multiple distinct UI responsibilities (e.g. tabs or complex modals):
1. **Identify Isolated Subtrees**: Identify self-contained UI blocks (e.g., creation dialogs, filter bars, table rows).
2. **Extract Modals & Subcomponents**: Place modals in `client/src/pages/admin/modals/` and shared tab primitives in `AdminUIPrimitives.tsx`.
3. **Define Explicit Props**: Export a typed `interface` alongside the extracted component. Never pass implicit or untyped props objects.
4. **Verify Memoization**: Ensure callbacks passed to children are memoized with `useCallback` if they cause child re-renders.

### 2.2 Consolidating Backend Utilities
When duplicate database query formatting or normalization appears across multiple route files:
1. Extract helper into `server/utils/` (e.g., `server/utils/topics.js` or `server/utils/audit.js`).
2. Export using CommonJS `module.exports = { helperFunction }`.
3. Add unit test under `server/tests/` verifying edge cases (null, empty strings, unusual casing).
4. Replace inline duplicates across route files.

---

## 3. Regression Verification Runbook
Execute following every refactoring increment:
```bash
# Verify backend regressions
npm --prefix server test

# Verify frontend tests
npm --prefix client test

# Check for TypeScript typing or import errors
npm --prefix client run build
```

