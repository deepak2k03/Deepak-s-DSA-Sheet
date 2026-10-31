const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const { calculateStreaks, calculateLevel } = require('../utils/leaderboardService');

describe('leaderboardService utility', () => {
  describe('calculateLevel', () => {
    test('returns level 1 for 0 or negative solves', () => {
      assert.equal(calculateLevel(0), 1);
      assert.equal(calculateLevel(-5), 1);
      assert.equal(calculateLevel(null), 1);
    });

    test('calculates correct level using the progressive formula', () => {
      // Formula: floor(sqrt(totalSolved * 0.45)) + 1
      assert.equal(calculateLevel(1), 1); // floor(sqrt(0.45)) + 1 = 0 + 1 = 1
      assert.equal(calculateLevel(10), 3); // floor(sqrt(4.5)) + 1 = 2 + 1 = 3
      assert.equal(calculateLevel(50), 5); // floor(sqrt(22.5)) + 1 = 4 + 1 = 5
      assert.equal(calculateLevel(100), 7); // floor(sqrt(45)) + 1 = 6 + 1 = 7
      assert.equal(calculateLevel(450), 15); // floor(sqrt(202.5)) + 1 = 14 + 1 = 15
    });

    test('caps at maximum level 99', () => {
      assert.equal(calculateLevel(50000), 99);
    });
  });

  describe('calculateStreaks', () => {
    test('returns 0 for empty or null history', () => {
      assert.deepEqual(calculateStreaks([]), { maxStreak: 0, currentStreak: 0 });
      assert.deepEqual(calculateStreaks(null), { maxStreak: 0, currentStreak: 0 });
    });

    test('calculates streak for past consecutive days', () => {
      const history = [
        { problemId: '1', solvedAt: new Date('2024-01-01T10:00:00Z') },
        { problemId: '2', solvedAt: new Date('2024-01-02T12:00:00Z') },
        { problemId: '3', solvedAt: new Date('2024-01-03T15:00:00Z') },
        { problemId: '4', solvedAt: new Date('2024-01-05T09:00:00Z') }, // Gap on Jan 4
        { problemId: '5', solvedAt: new Date('2024-01-06T11:00:00Z') },
      ];

      const { maxStreak } = calculateStreaks(history);
      assert.equal(maxStreak, 3); // Jan 1, 2, 3
    });

    test('calculates active streak when solved today and yesterday', () => {
      const today = new Date();
      const yesterday = new Date(Date.now() - 86400000);
      const dayBefore = new Date(Date.now() - 86400000 * 2);

      const history = [
        { problemId: '10', solvedAt: dayBefore },
        { problemId: '11', solvedAt: yesterday },
        { problemId: '12', solvedAt: today },
      ];

      const { currentStreak, maxStreak } = calculateStreaks(history);
      assert.equal(currentStreak, 3);
      assert.equal(maxStreak, 3);
    });
  });
});

