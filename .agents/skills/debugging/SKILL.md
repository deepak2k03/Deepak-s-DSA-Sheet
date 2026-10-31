---
name: debugging
description: Systematic reproduction, root-cause analysis, and resolution runbook for client and server issues
---

# Debugging Runbook

Use this skill when investigating bugs, uncaught runtime exceptions, broken filters, rendering crashes, or failed API calls.

## 1. Triage & Layer Identification

When an error occurs, identify the originating layer from the error signature:

| Error Signature | Layer | Common Root Cause |
| :--- | :--- | :--- |
| `ReferenceError: X is not defined` | Client / Server | Missing import or misspelled utility identifier. |
| `Cannot read properties of undefined` | Client / Server | Unchecked property access on optional API payload without `?.` or `??`. |
| `Maximum update depth exceeded` | Client | Synchronous state setter called inside a `useEffect` without guards. |
| `SyntaxError: Cannot use import statement` | Server | ESM `import` placed in CommonJS server file. Must use `require()`. |
| `Data not updating after admin change` | Server | In-memory cache not cleared. Missing `clearProblemsCache()`. |
| `Filtered list shows 0 results unexpectedly` | Client / Server | Slug mismatch (`basics` vs `basic`) or serialized field omission. |

---

## 2. Investigation Protocol

### Step 1: Trace the Error Location
- Note the exact filename and line number in the stack trace.
- Inspect the file using `read_file` around that line range.
- Do not make assumptions without reading the code.

### Step 2: Check Serialization & Data Transmission
- If client is missing expected fields (e.g. `hasVisualizer` or `visualizerSlug`), inspect the server serializer function (`serializeProblem` in `server/routes/admin.js` or `server/routes/problems.js`).
- Verify that every field needed by the React UI is retained in the projection and serialization response.

### Step 3: Check Slug & Taxonomy Normalization
- Ensure topic names pass through `getCanonicalTopicSlug` on the frontend (`client/src/utils/topicSlug.ts`) and `server/utils/topics.js` on the backend.
- Verify whether the database stores the plural or singular form.

### Step 4: Check In-Memory Caching
- If an endpoint returns stale data despite database updates, check if the route handler reads from an in-memory cache (`problemCache.js` or `leaderboardCache.js`).
- Verify that the mutation route calls the corresponding cache invalidation method.

---

## 3. Verification & Resolution Checklist
1. Apply the minimal necessary fix without introducing unintended refactors.
2. Run backend tests:
   ```bash
   npm --prefix server test
   ```
3. Run client tests:
   ```bash
   npm --prefix client test
   ```
4. Verify TypeScript and Vite build:
   ```bash
   npm --prefix client run build
   ```

