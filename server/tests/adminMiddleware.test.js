const { describe, it } = require('node:test');
const assert = require('node:assert');
const adminOnly = require('../middleware/admin');
const User = require('../models/User');

describe('server/middleware/admin access gate', () => {
  const mockRes = () => {
    const res = {
      statusCode: 200,
      body: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(data) {
        this.body = data;
        return this;
      },
    };
    return res;
  };

  it('rejects access if user is not found or inactive', async () => {
    const originalFindById = User.findById;
    User.findById = async () => null;

    try {
      const req = { userId: 'non-existent-user' };
      const res = mockRes();
      let nextCalled = false;

      await adminOnly(req, res, () => {
        nextCalled = true;
      });

      assert.strictEqual(nextCalled, false);
      assert.strictEqual(res.statusCode, 403);
      assert.strictEqual(res.body.msg, 'Account access denied');
    } finally {
      User.findById = originalFindById;
    }
  });

  it('rejects access if user role is not admin', async () => {
    const originalFindById = User.findById;
    User.findById = async () => ({
      _id: 'user-regular',
      role: 'user',
      isActive: true,
    });

    try {
      const req = { userId: 'user-regular' };
      const res = mockRes();
      let nextCalled = false;

      await adminOnly(req, res, () => {
        nextCalled = true;
      });

      assert.strictEqual(nextCalled, false);
      assert.strictEqual(res.statusCode, 403);
      assert.strictEqual(res.body.msg, 'Admin access required');
    } finally {
      User.findById = originalFindById;
    }
  });

  it('allows access and attaches req.currentUser when role is admin', async () => {
    const originalFindById = User.findById;
    const adminUser = {
      _id: 'user-admin',
      role: 'admin',
      isActive: true,
      email: 'admin@example.com',
    };
    User.findById = async () => adminUser;

    try {
      const req = { userId: 'user-admin' };
      const res = mockRes();
      let nextCalled = false;

      await adminOnly(req, res, () => {
        nextCalled = true;
      });

      assert.strictEqual(nextCalled, true);
      assert.strictEqual(req.currentUser, adminUser);
    } finally {
      User.findById = originalFindById;
    }
  });
});

