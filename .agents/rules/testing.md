---
description: Testing standards, test runners, execution procedures, and assertion patterns
globs: client/tests/**/*, server/tests/**/*
---

# Testing Standards & Procedures

This repository utilizes the native Node.js test runner (`node --test`) for fast, zero-dependency testing on both client and server.

## 1. Test Suite Commands
- **Client Tests**:
  ```powershell
  npm --prefix client test
  # Runs: node --test --experimental-strip-types tests/**/*.test.ts
  ```
- **Server Tests**:
  ```powershell
  npm --prefix server test
  # Runs: node --test tests/**/*.test.js
  ```

## 2. Test File Locations & Naming
- Client unit tests: `client/tests/<module>.test.ts`
- Server unit tests: `server/tests/<module>.test.js`
- Test files must use `.test.ts` or `.test.js` suffix.

## 3. Test Structure & Assertions
- Use `node:test` (`describe`, `test`, `it`) and `node:assert/strict` (`assert.equal`, `assert.deepEqual`, `assert.ok`):
  ```typescript
  import { describe, test } from 'node:test';
  import assert from 'node:assert/strict';
  import { getCanonicalTopicSlug } from '../src/utils/topics.ts';

  describe('topics utility', () => {
    test('normalizes canonical aliases', () => {
      assert.equal(getCanonicalTopicSlug('arrays'), 'arrays');
      assert.equal(getCanonicalTopicSlug('array'), 'arrays');
    });
  });
  ```

## 4. Test Isolation Guidelines
- Unit tests must be hermetic and execute without requiring a live MongoDB Atlas connection or Cloudflare R2 bucket.
- Test pure algorithmic functions, caching utilities, rate limiters, token hashing, and auth middleware extraction logic.
- Avoid persistent disk writes or side-effects during tests.

