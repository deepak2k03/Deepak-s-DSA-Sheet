const { describe, it } = require('node:test');
const assert = require('node:assert');
const jwt = require('jsonwebtoken');

describe('server/middleware/auth token extraction', () => {
  const secret = 'test-secret-12345';
  process.env.JWT_SECRET = secret;

  const validToken = jwt.sign({ userId: 'user-123', tokenVersion: 0 }, secret);

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

  it('rejects request with no token using 401', async () => {
    const auth = require('../middleware/auth');
    const req = {
      header: (name) => null,
    };
    const res = mockRes();
    let nextCalled = false;

    await auth(req, res, () => {
      nextCalled = true;
    });

    assert.strictEqual(nextCalled, false);
    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.body.msg, 'No token, authorization denied');
  });

  it('rejects invalid or corrupted token with 401', async () => {
    const auth = require('../middleware/auth');
    const req = {
      header: (name) => {
        if (name === 'x-auth-token') return 'bad-corrupted-token';
        return null;
      },
    };
    const res = mockRes();
    let nextCalled = false;

    await auth(req, res, () => {
      nextCalled = true;
    });

    assert.strictEqual(nextCalled, false);
    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.body.msg, 'Token is not valid');
  });

  it('extracts token from Authorization: Bearer <token>', async () => {
    const auth = require('../middleware/auth');
    const req = {
      header: (name) => {
        if (name.toLowerCase() === 'authorization') return `Bearer ${validToken}`;
        return null;
      },
    };
    const res = mockRes();

    // Mock User.findById so it doesn't need a real MongoDB connection
    const User = require('../models/User');
    const originalFindById = User.findById;
    User.findById = (id) => ({
      select: () => Promise.resolve({ _id: id, isActive: true, tokenVersion: 0 }),
    });

    try {
      let nextCalled = false;
      await auth(req, res, () => {
        nextCalled = true;
      });

      assert.strictEqual(nextCalled, true);
      assert.strictEqual(req.userId, 'user-123');
    } finally {
      User.findById = originalFindById;
    }
  });

  it('extracts token from x-auth-token header', async () => {
    const auth = require('../middleware/auth');
    const req = {
      header: (name) => {
        if (name.toLowerCase() === 'x-auth-token') return validToken;
        return null;
      },
    };
    const res = mockRes();

    const User = require('../models/User');
    const originalFindById = User.findById;
    User.findById = (id) => ({
      select: () => Promise.resolve({ _id: id, isActive: true, tokenVersion: 0 }),
    });

    try {
      let nextCalled = false;
      await auth(req, res, () => {
        nextCalled = true;
      });

      assert.strictEqual(nextCalled, true);
      assert.strictEqual(req.userId, 'user-123');
    } finally {
      User.findById = originalFindById;
    }
  });

  it('extracts token when userId is under decoded.id', async () => {
    const auth = require('../middleware/auth');
    const altToken = jwt.sign({ id: 'user-alt-456' }, secret);
    const req = {
      header: (name) => {
        if (name.toLowerCase() === 'authorization') return `Bearer ${altToken}`;
        return null;
      },
    };
    const res = mockRes();

    const User = require('../models/User');
    const originalFindById = User.findById;
    User.findById = (id) => ({
      select: () => Promise.resolve({ _id: id, isActive: true }),
    });

    try {
      let nextCalled = false;
      await auth(req, res, () => {
        nextCalled = true;
      });

      assert.strictEqual(nextCalled, true);
      assert.strictEqual(req.userId, 'user-alt-456');
    } finally {
      User.findById = originalFindById;
    }
  });
});

