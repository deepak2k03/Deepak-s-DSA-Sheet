---
description: Security rules for authentication, token hashing, rate limiting, and access control
globs: server/**/*.{js,json}, client/src/utils/auth.ts
---

# Security & Compliance Rules

These rules enforce data protection, authentication integrity, and operational security across the application.

## 1. Authentication & Token Security
- **Token Storage**:
  - Passwords: Always hash with `bcryptjs` (salt rounds: 10).
  - Password reset tokens: Generate with `crypto.randomBytes(32).toString('hex')`. Store only the SHA-256 hash in MongoDB using `hashToken()`. Never store raw plaintext tokens.
  - Email verification tokens: Generate securely and store as SHA-256 hashes.
- **JWT Signing**:
  - Sign JWT tokens with `process.env.JWT_SECRET`.
  - Include `{ userId, tokenVersion }` in token payloads.
  - Invalidate tokens when `user.tokenVersion` increments or `user.tokensInvalidBefore` is after the token issue timestamp.

## 2. Access Control & Authorization
- Enforce the 4-tier role hierarchy:
  - `user`: Standard learner (solve problems, view solutions, manage notes).
  - `moderator`: Content reviewer.
  - `content_manager`: Topic and visualizer authoring.
  - `admin`: Full platform control.
- All `/api/admin/*` endpoints must verify that `req.user.role === 'admin'`.
- Deactivated accounts (`user.isActive === false`) must be denied access across all authenticated routes.

## 3. Account Lockout & Rate Limiting
- Track failed login attempts (`failedLoginAttempts`). Lock account for 15 minutes after 5 consecutive failures (`lockUntil`).
- Public auth routes (`/api/auth/login`, `/api/auth/signup`, `/api/auth/forgot-password`) must be protected with `authRateLimiter` (`server/utils/rateLimiter.js`).
- The global rate limiter (`globalRateLimiter`) protects against DDoS and denial-of-service traffic.

## 4. Audit Logging
- Record all privileged admin actions in `AuditLog` via `writeAuditLog(req, { action, entityType, entityId, metadata })`.
- Capture client IP, user agent, actor ID, and actor email.
- Never write passwords, tokens, or raw secrets to audit logs.

