---
name: code-review
description: Comprehensive review checklist and guidelines for verifying changes against security, quality, and performance standards
---

# Code Review Skill

Use this skill when auditing pull requests, reviewing newly written code, or performing pre-commit verification across the DSA Sheet repository.

## 1. Review Dimensions & Checklists

### 1.1 Security Checklist
- [ ] **Role Protection**: Are privileged endpoints protected by both `middleware/auth.js` and `middleware/admin.js`?
- [ ] **Data Sanitization**: Are sensitive fields (`password`, `passwordResetToken`, `emailVerificationToken`) excluded from API responses?
- [ ] **Lockout Verification**: Does authentication respect `lockUntil` and increment `failedLoginAttempts`?
- [ ] **Token Revocation**: Does token verification check `tokenVersion` and `tokensInvalidBefore`?
- [ ] **Sandboxing**: Are iframe embeds configured with `sandbox="allow-scripts allow-same-origin"`?

### 1.2 Performance & Caching Checklist
- [ ] **Cache Invalidation**: Did any write mutation call `clearProblemsCache()` or `clearLeaderboardCache()`?
- [ ] **Query Efficiency**: Are Mongoose queries using `.lean()` for read-only listings and indexed fields for lookups?
- [ ] **Client Memoization**: Are heavy table filtering operations wrapped in `useMemo`?
- [ ] **No Infinite Re-renders**: Are state setters inside `useEffect` guarded by strict condition checks?

### 1.3 UI/UX & Design Consistency
- [ ] **Theme Tokens**: Does the component use standard dark tokens (`bg-[#0B0F17]`, `bg-[#111827]`, `border-slate-800`, `emerald-500`)?
- [ ] **Resilience**: Are empty states and loading skeletons provided for tabular views?
- [ ] **Defensive Rendering**: Are string methods guarded against nullish values (`(problem.title || '').toLowerCase()`)?

### 1.4 Code Quality & Module Boundaries
- [ ] **Module Format**: Is server code strictly CommonJS (`require`) and client code strictly ESM (`import`)?
- [ ] **TypeScript Types**: Are there any loose `any` casts that can be replaced with concrete interfaces?
- [ ] **No Dead Code**: Have temporary debug logs (`console.log`) and commented-out code blocks been removed?

---

## 2. Review Execution Commands
Run the verification test suite before approving changes:
```bash
# 1. Run server tests
npm --prefix server test

# 2. Run client tests
npm --prefix client test

# 3. Verify TypeScript build
npm --prefix client run build
```

