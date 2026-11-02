---
description: Mandatory documentation synchronization across all codebase changes
trigger: always_on
---

# Documentation Synchronization Rule

Whenever any change is made to the codebase (frontend, backend, database models, routes, or configuration):

## 1. Synchronization Matrix

| Change Made | Files That Must Be Checked & Updated |
| :--- | :--- |
| **New files, directories, or assets** (e.g. `client/public/visualizers/`) | `docs/directory-structure.md`, `docs/modules.md` |
| **Routes or controller changes** (e.g. `server/routes/visualizers.js`, `/api` proxies) | `docs/api-reference.md`, `docs/data-flow.md` |
| **Component or state updates** (e.g. `VisualizerFrame.tsx`, `SolutionPage.tsx`) | `docs/modules.md`, `docs/architecture.md` |
| **Mongoose schema updates** (e.g. fields, indexes) | `docs/database-schema.md`, `server/AGENTS.md` |
| **Environment or build configuration** (e.g. `vite.config.ts`, Cloudflare R2, auth) | `docs/build-and-deployment.md`, `docs/integrations.md` |

## 2. Execution Protocol

1. **Verify Against Actual Code**: Read the modified code to ensure exact parameters, types, URLs, headers, and paths are documented without guessing.
2. **Apply Updates Promptly**: Edit the affected markdown files in `docs/` or `.agents/rules/`.
3. **Format & Consistency**: Preserve GitHub-flavored markdown table formatting and existing link conventions.
4. **Report to User**: Always include a section in your response detailing which documentation files were inspected and kept in sync.

