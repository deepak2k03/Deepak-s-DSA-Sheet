import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { getCanonicalTopicSlug } from '../src/utils/topics.ts';

describe('client topics utility', () => {
  test('handles empty and nullish topic inputs', () => {
    assert.equal(getCanonicalTopicSlug(''), '');
    assert.equal(getCanonicalTopicSlug(null as unknown as string), '');
    assert.equal(getCanonicalTopicSlug(undefined as unknown as string), '');
  });

  test('correctly normalizes canonical aliases', () => {
    assert.equal(getCanonicalTopicSlug('arrays'), 'arrays');
    assert.equal(getCanonicalTopicSlug('array'), 'arrays');
    assert.equal(getCanonicalTopicSlug('string'), 'strings');
    assert.equal(getCanonicalTopicSlug('strings'), 'strings');
    assert.equal(getCanonicalTopicSlug('dp'), 'dynamic-programming');
    assert.equal(getCanonicalTopicSlug('dynamic programming'), 'dynamic-programming');
    assert.equal(getCanonicalTopicSlug('stacks & queues'), 'stacks-queues');
    assert.equal(getCanonicalTopicSlug('linked lists'), 'linked-lists');
    assert.equal(getCanonicalTopicSlug('binary search'), 'binary-search');
  });

  test('cleans and trims input properly', () => {
    assert.equal(getCanonicalTopicSlug('  Heaps  '), 'heaps');
    assert.equal(getCanonicalTopicSlug('BIT MANIPULATION'), 'bit-manipulation');
  });
});

