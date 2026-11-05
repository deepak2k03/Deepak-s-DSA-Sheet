const { describe, it } = require('node:test');
const assert = require('node:assert');
const User = require('../models/User');
const Problem = require('../models/Problem');
const Topic = require('../models/Topic');

describe('GET /api/auth/profile/:username endpoint', () => {
  const authRouter = require('../routes/auth');

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
      send(data) {
        this.body = data;
        return this;
      },
    };
    return res;
  };

  const invokeRoute = async (username) => {
    const route = authRouter.stack.find(
      (layer) => layer.route && layer.route.path === '/profile/:username' && layer.route.methods.get
    );

    if (!route) {
      throw new Error('Route GET /profile/:username not found in router');
    }

    const req = {
      params: { username },
    };
    const res = mockRes();

    // Call the route handler
    await route.route.stack[0].handle(req, res);
    return res;
  };

  it('returns 404 when user is not found', async () => {
    const originalFindOne = User.findOne;
    User.findOne = () => ({
      select: () => ({
        lean: () => Promise.resolve(null),
      }),
    });

    try {
      const res = await invokeRoute('nonexistent-user');
      assert.strictEqual(res.statusCode, 404);
      assert.strictEqual(res.body.msg, 'User not found');
    } finally {
      User.findOne = originalFindOne;
    }
  });

  it('returns profile and topicwise solved problems for existing user', async () => {
    const originalUserFindOne = User.findOne;
    const originalProblemFind = Problem.find;
    const originalTopicFind = Topic.find;

    const mockUser = {
      _id: 'user-id-123',
      username: 'alice',
      role: 'user',
      createdAt: new Date('2026-01-01'),
      solvedProblems: ['1', '2'],
      solvedHistory: [
        { problemId: '1', solvedAt: new Date('2026-02-01') },
        { problemId: '2', solvedAt: new Date('2026-02-02') },
      ],
    };

    const mockProblems = [
      { id: 1, title: 'Two Sum', difficulty: 'Easy', topic: 'arrays', link: 'https://leetcode.com', order: 1 },
      { id: 2, title: 'Valid Palindrome', difficulty: 'Easy', topic: 'strings', link: 'https://leetcode.com', order: 1 },
    ];

    const mockTopics = [
      { name: 'Arrays', slug: 'arrays', iconKey: 'grid-3x3', order: 1 },
      { name: 'Strings', slug: 'strings', iconKey: 'code-2', order: 2 },
    ];

    User.findOne = () => ({
      select: () => ({
        lean: () => Promise.resolve(mockUser),
      }),
    });

    Problem.find = (filter) => {
      if (filter && filter.id && filter.id.$in) {
        return {
          select: () => ({
            sort: () => ({
              lean: () => Promise.resolve(mockProblems),
            }),
          }),
        };
      }
      return {
        select: () => ({
          lean: () => Promise.resolve([{ topic: 'arrays' }, { topic: 'strings' }]),
        }),
      };
    };

    Topic.find = () => ({
      select: () => ({
        sort: () => ({
          lean: () => Promise.resolve(mockTopics),
        }),
      }),
    });

    try {
      const res = await invokeRoute('alice');
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.user.username, 'alice');
      assert.strictEqual(res.body.user.totalSolved, 2);
      assert.strictEqual(res.body.solvedCount, 2);
      assert(Array.isArray(res.body.topicBreakdown));
      
      const arraysTopic = res.body.topicBreakdown.find((t) => t.topicSlug === 'arrays');
      assert(arraysTopic, 'Arrays topic should be present');
      assert.strictEqual(arraysTopic.solvedCount, 1);
      assert.strictEqual(arraysTopic.problems[0].title, 'Two Sum');

      const stringsTopic = res.body.topicBreakdown.find((t) => t.topicSlug === 'strings');
      assert(stringsTopic, 'Strings topic should be present');
      assert.strictEqual(stringsTopic.solvedCount, 1);
      assert.strictEqual(stringsTopic.problems[0].title, 'Valid Palindrome');
    } finally {
      User.findOne = originalUserFindOne;
      Problem.find = originalProblemFind;
      Topic.find = originalTopicFind;
    }
  });
});

