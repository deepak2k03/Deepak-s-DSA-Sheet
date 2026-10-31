---
name: testing
description: Test authoring and execution guidelines for client and server using the native Node.js test runner
---

# Testing Skill

Use this skill when writing unit tests, running regression suites, or validating bug fixes across the DSA Sheet repository.

## 1. Native Test Framework Overview

The project exclusively uses the built-in Node.js test runner (`node:test`) and strict assertion library (`node:assert/strict`), avoiding heavy external test frameworks:

- **Client Tests**: Located in `client/tests/` running via:
  ```bash
  npm --prefix client test
  # Runs: node --test --experimental-strip-types tests/**/*.test.ts
  ```
- **Server Tests**: Located in `server/tests/` running via:
  ```bash
  npm --prefix server test
  # Runs: node --test tests/**/*.test.js
  ```

---

## 2. Test Authoring Standards

### 2.1 Test Structure Template
```javascript
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { getCanonicalTopicSlug } = require('../utils/topics');

describe('Topic Slug Normalization', () => {
  it('should map plural basics to singular basic', () => {
    assert.equal(getCanonicalTopicSlug('basics'), 'basic');
  });

  it('should handle undefined or null safely', () => {
    assert.equal(getCanonicalTopicSlug(null), '');
    assert.equal(getCanonicalTopicSlug(undefined), '');
  });
});
```

### 2.2 Client TypeScript Test Template
```typescript
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { calculateLevel } from '../src/utils/levelProgress';

describe('Level Progression Calculation', () => {
  test('should return level 1 for 0 solved problems', () => {
    assert.equal(calculateLevel(0), 1);
  });

  test('should compute correct progressive level', () => {
    // Level = floor(sqrt(solved * 0.45)) + 1
    assert.equal(calculateLevel(10), 3);
  });
});
```

---

## 3. Best Practices
1. **No External DB or Network Calls in Unit Tests**: Mock external dependencies or test deterministic pure functions (slugs, mathematical calculations, serializers, sanitizers).
2. **Deterministic Assertions**: Use `assert.equal` for primitives and `assert.deepEqual` for arrays/objects.
3. **Always Run Both Suites Before Completing Tasks**:
   ```bash
   npm --prefix server test
   npm --prefix client test
   ```

