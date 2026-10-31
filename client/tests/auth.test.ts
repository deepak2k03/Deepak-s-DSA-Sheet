import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  getStoredToken,
  getStoredUser,
  setAuthSession,
  clearAuthSession,
  updateStoredUser,
  type StoredUser,
} from '../src/utils/auth.ts';

// Mock localStorage and window.dispatchEvent for testing environment
const storage: Record<string, string> = {};
globalThis.localStorage = {
  getItem: (key: string) => storage[key] ?? null,
  setItem: (key: string, val: string) => { storage[key] = String(val); },
  removeItem: (key: string) => { delete storage[key]; },
  clear: () => { Object.keys(storage).forEach((k) => delete storage[k]); },
  key: (i: number) => Object.keys(storage)[i] ?? null,
  length: 0,
};

globalThis.window = {
  dispatchEvent: () => true,
} as unknown as Window & typeof globalThis;

globalThis.Event = class Event {
  type: string;
  constructor(type: string) {
    this.type = type;
  }
} as unknown as typeof Event;

describe('client auth utility', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('getStoredToken returns null when no token is set', () => {
    assert.equal(getStoredToken(), null);
  });

  test('setAuthSession saves token and serialized user', () => {
    const user: StoredUser = {
      id: 'u1',
      username: 'bob',
      email: 'bob@example.com',
      role: 'user',
      solvedProblems: ['10', '20'],
    };

    setAuthSession('mock-jwt-token-123', user);

    assert.equal(getStoredToken(), 'mock-jwt-token-123');
    assert.deepEqual(getStoredUser(), user);
  });

  test('clearAuthSession removes token and user', () => {
    setAuthSession('token-to-clear', { username: 'test', email: 'test@example.com' });
    assert.ok(getStoredToken());

    clearAuthSession();

    assert.equal(getStoredToken(), null);
    assert.equal(getStoredUser(), null);
  });

  test('updateStoredUser applies updater function and persists changes', () => {
    const user: StoredUser = {
      username: 'charlie',
      email: 'charlie@example.com',
      solvedProblems: ['1'],
    };

    setAuthSession('token-456', user);

    const updated = updateStoredUser((current) => ({
      ...current,
      solvedProblems: [...(current.solvedProblems || []), '2'],
    }));

    assert.deepEqual(updated?.solvedProblems, ['1', '2']);
    assert.deepEqual(getStoredUser()?.solvedProblems, ['1', '2']);
  });
});

