---
name: documentation-update
description: Systematic process for keeping project architecture docs, API references, schemas, and agent instructions in sync with codebase changes
---

# Documentation Update Skill

Use this skill whenever introducing new features, modifying database models, altering REST endpoints, adding environment variables, or reorganizing files to keep the project documentation accurate.

## 1. Documentation Map & Responsibility Matrix

| Change Type | Primary Document to Update | Secondary Documents |
| :--- | :--- | :--- |
| **New or modified REST endpoint** | `docs/api-reference.md` | `docs/modules.md`, `docs/data-flow.md` |
| **Mongoose schema changes** | `docs/database-schema.md` | `server/AGENTS.md`, `.agents/rules/database.md` |
| **New environment variables or integrations** | `docs/integrations.md` | `docs/build-and-deployment.md` |
| **Directory or module restructuring** | `docs/directory-structure.md` | `docs/modules.md` |
| **Architectural or caching shifts** | `docs/architecture.md` | `docs/data-flow.md`, `AGENTS.md` |
| **New agent rules or skills** | `AGENTS.md` | Root navigation table |

---

## 2. Update Protocol

1. **Verify Against Actual Code**:
   - Inspect the modified source file (e.g., `server/routes/admin.js`, `server/models/User.js`).
   - Extract exact field names, parameter types, HTTP status codes, and environment variables directly from the implementation. Never guess or hallucinate.
2. **Update the Target Document**:
   - Add the new endpoint table row, schema field row, or environment variable description.
   - Maintain GitHub-flavored markdown table formatting.
3. **Verify Links and File Paths**:
   - Ensure all relative paths and markdown references point to existing files.
4. **Check for Redundancy**:
   - Place specific technical details in the appropriate document under `docs/` rather than cluttering root `AGENTS.md`. Keep root `AGENTS.md` concise and navigational.

