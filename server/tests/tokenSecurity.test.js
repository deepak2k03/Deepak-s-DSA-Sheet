const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const { createPlainToken, hashToken } = require('../utils/tokenSecurity');

describe('tokenSecurity utility', () => {
  test('createPlainToken generates a 64-character hexadecimal string', () => {
    const token = createPlainToken();
    assert.equal(typeof token, 'string');
    assert.equal(token.length, 64);
    assert.match(token, /^[0-9a-f]{64}$/);
  });

  test('createPlainToken produces unique values on successive calls', () => {
    const token1 = createPlainToken();
    const token2 = createPlainToken();
    assert.notEqual(token1, token2);
  });

  test('hashToken produces a 64-character sha256 hash', () => {
    const input = 'sample-plain-token';
    const hash = hashToken(input);
    assert.equal(typeof hash, 'string');
    assert.equal(hash.length, 64);
    assert.match(hash, /^[0-9a-f]{64}$/);
  });

  test('hashToken is deterministic for the same input', () => {
    const token = 'consistent-test-token-value';
    const hash1 = hashToken(token);
    const hash2 = hashToken(token);
    assert.equal(hash1, hash2);
  });

  test('hashToken produces different hashes for different inputs', () => {
    const hash1 = hashToken('tokenA');
    const hash2 = hashToken('tokenB');
    assert.notEqual(hash1, hash2);
  });
});

