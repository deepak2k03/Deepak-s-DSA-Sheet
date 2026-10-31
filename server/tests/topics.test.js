const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const { getCanonicalTopicSlug, slugifyTopic } = require('../utils/topics');

describe('topics utility', () => {
  describe('getCanonicalTopicSlug', () => {
    test('returns empty string for empty or nullish values', () => {
      assert.equal(getCanonicalTopicSlug(''), '');
      assert.equal(getCanonicalTopicSlug(null), '');
      assert.equal(getCanonicalTopicSlug(undefined), '');
    });

    test('normalizes canonical aliases correctly', () => {
      assert.equal(getCanonicalTopicSlug('array'), 'arrays');
      assert.equal(getCanonicalTopicSlug('arrays'), 'arrays');
      assert.equal(getCanonicalTopicSlug('string'), 'strings');
      assert.equal(getCanonicalTopicSlug('strings'), 'strings');
      assert.equal(getCanonicalTopicSlug('dp'), 'dynamic-programming');
      assert.equal(getCanonicalTopicSlug('dynamic programming'), 'dynamic-programming');
      assert.equal(getCanonicalTopicSlug('stacks & queues'), 'stacks-queues');
      assert.equal(getCanonicalTopicSlug('stack and queue'), 'stacks-queues');
      assert.equal(getCanonicalTopicSlug('tree'), 'trees');
      assert.equal(getCanonicalTopicSlug('graph'), 'graphs');
    });

    test('handles whitespace and capitalization gracefully', () => {
      assert.equal(getCanonicalTopicSlug('  Binary Search  '), 'binary-search');
      assert.equal(getCanonicalTopicSlug('LINKED LIST'), 'linked-lists');
      assert.equal(getCanonicalTopicSlug('Bit    Manipulation'), 'bit-manipulation');
    });

    test('converts unknown topics into clean dashed slugs', () => {
      assert.equal(getCanonicalTopicSlug('Computational Geometry'), 'computational-geometry');
      assert.equal(getCanonicalTopicSlug('Game Theory & Minimax'), 'game-theory-and-minimax');
    });
  });

  describe('slugifyTopic', () => {
    test('slugifies arbitrary titles', () => {
      assert.equal(slugifyTopic('Two Pointers Technique'), 'two-pointers-technique');
      assert.equal(slugifyTopic('Bit & Mask Operations'), 'bit-and-mask-operations');
    });
  });
});

