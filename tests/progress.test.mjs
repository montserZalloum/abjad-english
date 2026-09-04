import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createProgressStore } from '../src/progress.js';

function fakeStorage() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
  };
}

test('progress survives a restart (new store, same storage)', () => {
  const storage = fakeStorage();
  createProgressStore(storage).markStudied('A');
  const afterRestart = createProgressStore(storage);
  assert.equal(afterRestart.isStudied('A'), true);
  assert.equal(afterRestart.isStudied('B'), false);
});

test('marking twice does not duplicate', () => {
  const store = createProgressStore(fakeStorage());
  store.markStudied('A');
  const state = store.markStudied('A');
  assert.deepEqual(state.studied, ['A']);
});

test('corrupt save throws instead of silently resetting', () => {
  const storage = fakeStorage();
  storage.setItem('abjad.progress.v1', '{not json');
  assert.throws(() => createProgressStore(storage).load(), /corrupt progress/);
});
