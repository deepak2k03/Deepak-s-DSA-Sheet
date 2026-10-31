const { test, describe, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const { getRoleForEmail, sanitizeUser } = require('../utils/userAccess');

describe('userAccess utility', () => {
  const originalEnv = process.env.ADMIN_EMAILS;

  beforeEach(() => {
    process.env.ADMIN_EMAILS = 'admin@example.com, superuser@example.com';
  });

  afterEach(() => {
    process.env.ADMIN_EMAILS = originalEnv;
  });

  describe('getRoleForEmail', () => {
    test('returns fallbackRole if email is empty or null', () => {
      assert.equal(getRoleForEmail('', 'user'), 'user');
      assert.equal(getRoleForEmail(null, 'moderator'), 'moderator');
    });

    test('returns "admin" if email is in ADMIN_EMAILS list (case-insensitive)', () => {
      assert.equal(getRoleForEmail('admin@example.com'), 'admin');
      assert.equal(getRoleForEmail('ADMIN@EXAMPLE.COM'), 'admin');
      assert.equal(getRoleForEmail('  superuser@example.com  '), 'admin');
    });

    test('returns fallback role if email is not an admin', () => {
      assert.equal(getRoleForEmail('regular@example.com', 'user'), 'user');
      assert.equal(getRoleForEmail('other@example.com', 'content_manager'), 'content_manager');
    });
  });

  describe('sanitizeUser', () => {
    test('strips sensitive fields like password and tokens', () => {
      const rawUser = {
        id: 'usr_123',
        username: 'alice',
        email: 'alice@example.com',
        password: '$2a$10$verysecurepasswordhash',
        emailVerificationToken: 'secret_token',
        passwordResetToken: 'reset_secret',
        failedLoginAttempts: 3,
        role: 'user',
        isActive: true,
        emailVerified: true,
        solvedProblems: ['1', '2'],
        solvedHistory: [{ problemId: '1', solvedAt: new Date() }],
        revisionProblems: ['1'],
        problemNotes: [{ problemId: '1', note: 'Two sum solution' }],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const sanitized = sanitizeUser(rawUser);

      assert.equal(sanitized.id, 'usr_123');
      assert.equal(sanitized.username, 'alice');
      assert.equal(sanitized.email, 'alice@example.com');
      assert.equal(sanitized.role, 'user');
      assert.equal(sanitized.isActive, true);
      assert.equal(sanitized.emailVerified, true);
      assert.equal(sanitized.password, undefined);
      assert.equal(sanitized.emailVerificationToken, undefined);
      assert.equal(sanitized.passwordResetToken, undefined);
      assert.equal(sanitized.failedLoginAttempts, undefined);
      assert.deepEqual(sanitized.solvedProblems, ['1', '2']);
    });
  });
});

