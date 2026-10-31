# Database Schema

This document details the MongoDB schema definitions, collections, field types, relationships, and index configurations managed via Mongoose ODM.

---

## 1. User Model (`User.js`)

Represents registered platform members, administrative users, and tracks learning progress.

| Field | Type | Description |
| :--- | :--- | :--- |
| `username` | String | Display name of the user. |
| `email` | String | Unique email address (indexed). |
| `password` | String | Bcrypt password hash (salt rounds: 10). |
| `authProvider` | String | Authentication provider (`'local'`, `'google'`). Default: `'local'`. |
| `googleId` | String | Google OAuth subject identifier (sparse index). |
| `solvedProblems` | [String] | Array of problem IDs/numbers marked as solved. |
| `solvedHistory` | [{ problemId, solvedAt }] | Timestamped record of every solved challenge for streaks and graphs. |
| `revisionProblems` | [String] | Array of bookmarked problem IDs for spaced repetition. |
| `problemNotes` | [{ problemId, note, updatedAt }] | User markdown notes per problem. |
| `role` | String | Role authorization: `'user'`, `'moderator'`, `'content_manager'`, `'admin'`. |
| `isActive` | Boolean | Account status flag. Default: `true`. |
| `emailVerified` | Boolean | Email verification status. Default: `false`. |
| `emailVerificationToken` | String | Cryptographic token for verification. |
| `emailVerificationExpires` | Date | Expiration timestamp for verification link. |
| `passwordResetToken` | String | SHA-256 hashed reset token. |
| `passwordResetExpires` | Date | Expiration timestamp for password reset (default: 1 hour). |
| `failedLoginAttempts` | Number | Counter for brute-force rate limiting (locks at 5). |
| `lockUntil` | Date | Lockout expiration timestamp. |
| `tokenVersion` | Number | Integer bumped to invalidate existing JWT tokens globally. |
| `tokensInvalidBefore` | Date | Timestamp barrier rejecting older issued tokens. |
| `timestamps` | Timestamps | Automatic `createdAt` and `updatedAt`. |

---

## 2. Problem Model (`Problem.js`)

Contains all DSA curriculum problems and metadata.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | Number | Unique numeric problem identifier (1, 2, 3...) (unique index). |
| `title` | String | Problem title. |
| `link` | String | External practice link (LeetCode, GFG, Codeforces). |
| `difficulty` | String | Enum: `'Easy'`, `'Medium'`, `'Hard'`. Default: `'Medium'`. |
| `topic` | String | Topic slug (e.g., `'arrays'`, `'binary-search'`). |
| `visualizerSlug` | String | Associated visualizer identifier, if available. |
| `hasVisualizer` | Boolean | Flag indicating whether an interactive visualizer is linked. |
| `order` | Number | Explicit display order inside topic. Default: `0`. |
| `isDeleted` | Boolean | Soft-deletion flag. Default: `false`. |
| `deletedAt` | Date | Timestamp of deletion or `null`. |
| `timestamps` | Timestamps | Automatic `createdAt` and `updatedAt`. |

---

## 3. Topic Model (`Topic.js`)

Defines the curriculum taxonomy and category groupings.

| Field | Type | Description |
| :--- | :--- | :--- |
| `name` | String | Topic title (e.g. `'Binary Search'`). |
| `slug` | String | Unique URL slug (e.g. `'binary-search'`) (unique index). |
| `description` | String | Brief summary of concepts covered. |
| `difficulty` | String | Enum: `'Easy'`, `'Medium'`, `'Hard'`. Default: `'Medium'`. |
| `iconKey` | String | Lucide icon identifier (e.g., `'book-open'`, `'binary'`). |
| `order` | Number | Visual sort order. Default: `0`. |
| `isActive` | Boolean | Live publishing status. Default: `true`. |
| `isDeleted` | Boolean | Soft-deletion flag. Default: `false`. |
| `deletedAt` | Date | Timestamp of deletion or `null`. |
| `timestamps` | Timestamps | Automatic `createdAt` and `updatedAt`. |

---

## 4. Visualizer Model (`Visualizer.js`)

Metadata for sandboxed interactive algorithm visualizers stored in Cloudflare R2 or local storage.

| Field | Type | Description |
| :--- | :--- | :--- |
| `name` | String | Display title of the visualizer. |
| `slug` | String | Unique identifier used for URL routing and problem linking (unique index). |
| `category` | String | Pillar taxonomy (e.g. `'Searching'`, `'Sorting'`, `'Trees'`). |
| `difficulty` | String | Enum: `'Easy'`, `'Medium'`, `'Hard'`. |
| `description` | String | Explanation of the visualizer. |
| `storageType` | String | Storage backend: `'r2'` or `'local'`. Default: `'r2'`. |
| `r2Key` | String | Object key path in the Cloudflare R2 bucket. |
| `r2Bucket` | String | Name of the target R2 bucket. |
| `contentUrl` | String | Public CDN or direct asset URL. |
| `status` | String | Enum: `'available'`, `'unavailable'`. |
| `timeComplexity` | Object | `{ best, average, worst }` time complexity notations. |
| `spaceComplexity` | String | Auxiliary space notation (e.g., `'O(n)'`). |
| `type` | String | Enum: `'algorithm'`, `'data-structure'`, `'problem'`. |
| `timestamps` | Timestamps | Automatic `createdAt` and `updatedAt`. |

---

## 5. Daily Challenge / POTD Model (`POTD.js`)

Manages the daily problem calendar and historical assignments.

| Field | Type | Description |
| :--- | :--- | :--- |
| `date` | String | Date string in `"YYYY-MM-DD"` format (unique index). |
| `problem` | ObjectId | Reference to `Problem` document. |
| `customDescription`| String | Optional customized problem challenge prompt. |
| `customEstimatedTime`| String | Target duration (e.g., `'25 mins'`). |
| `customFocusArea` | String | Core focus skills (e.g., `'Two Pointers'`). |

---

## 6. Audit Log Model (`AuditLog.js`)

Records privileged actions performed by administrators for accountability and rollback.

| Field | Type | Description |
| :--- | :--- | :--- |
| `actorId` | ObjectId | Reference to `User` who performed the mutation. |
| `actorEmail` | String | Email address of the actor. |
| `action` | String | Action verb (e.g. `'UPDATE_PROBLEM'`, `'DELETE_TOPIC'`). |
| `entityType` | String | Target entity (e.g. `'Problem'`, `'Topic'`, `'User'`). |
| `entityId` | String | Identifier or string ID of the modified entity. |
| `metadata` | Mixed | JSON diff containing `before`, `after`, or changes. |
| `ip` | String | IP address of the incoming request. |
| `userAgent` | String | User-Agent string from the client. |
| `timestamps` | Timestamps | Automatic `createdAt` and `updatedAt`. |

