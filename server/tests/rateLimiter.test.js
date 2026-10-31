const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const { createRateLimiter } = require('../utils/rateLimiter');

describe('rateLimiter utility', () => {
  const createMockReqRes = (ip = '127.0.0.1') => {
    const headers = {};
    let statusCode = 200;
    let jsonBody = null;

    const req = { ip };
    const res = {
      setHeader: (name, val) => {
        headers[name.toLowerCase()] = val;
      },
      status: (code) => {
        statusCode = code;
        return res;
      },
      json: (data) => {
        jsonBody = data;
        return res;
      },
      getHeader: (name) => headers[name.toLowerCase()],
      getStatusCode: () => statusCode,
      getBody: () => jsonBody,
    };

    return { req, res };
  };

  test('allows requests below the maxRequests threshold', () => {
    const limiter = createRateLimiter({
      windowMs: 5000,
      maxRequests: 3,
      keyBuilder: (r) => `test-under:${r.ip}`,
    });

    let nextCalled = 0;
    const next = () => { nextCalled++; };

    const { req, res } = createMockReqRes('1.1.1.1');

    limiter(req, res, next);
    limiter(req, res, next);
    limiter(req, res, next);

    assert.equal(nextCalled, 3);
    assert.equal(res.getStatusCode(), 200);
  });

  test('blocks requests exceeding maxRequests with 429 and Retry-After', () => {
    const limiter = createRateLimiter({
      windowMs: 10000,
      maxRequests: 2,
      keyBuilder: (r) => `test-exceed:${r.ip}`,
    });

    let nextCalled = 0;
    const next = () => { nextCalled++; };

    const { req, res } = createMockReqRes('2.2.2.2');

    limiter(req, res, next); // 1
    limiter(req, res, next); // 2
    limiter(req, res, next); // 3 -> Exceeded

    assert.equal(nextCalled, 2);
    assert.equal(res.getStatusCode(), 429);
    assert.ok(res.getHeader('retry-after'));
    assert.deepEqual(res.getBody(), { msg: 'Too many requests. Please try again later.' });
  });

  test('resets request allowance after windowMs expires', async () => {
    const windowMs = 50; // fast window for testing
    const limiter = createRateLimiter({
      windowMs,
      maxRequests: 1,
      keyBuilder: (r) => `test-reset:${r.ip}`,
    });

    let nextCalled = 0;
    const next = () => { nextCalled++; };

    const { req, res } = createMockReqRes('3.3.3.3');

    limiter(req, res, next); // 1 - allowed
    assert.equal(nextCalled, 1);

    limiter(req, res, next); // 2 - rejected
    assert.equal(res.getStatusCode(), 429);

    // Wait for window to expire
    await new Promise((resolve) => setTimeout(resolve, 70));

    limiter(req, res, next); // 3 - allowed after window reset
    assert.equal(nextCalled, 2);
  });
});

