import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LETTERS, getLetter, isComplete } from '../content/letters.js';

test('getLetter returns the entry for a known letter', () => {
  const b = getLetter('B');
  assert.equal(b.letter, 'B');
  assert.equal(b.lowercase, 'b');
});

test('getLetter throws on an unknown letter instead of returning undefined', () => {
  assert.throws(() => getLetter('1'), /unknown letter/);
});

test('isComplete distinguishes stubs from complete entries', () => {
  assert.equal(isComplete(getLetter('C')), false);
  assert.equal(isComplete(getLetter('A')), true);
  assert.equal(isComplete(getLetter('B')), true);
});

test("B's word starts with B", () => {
  const b = getLetter('B');
  assert.equal(b.word, 'Ball');
  assert.ok(b.word.startsWith('B'));
});

test('every letter has an uppercase letter and matching lowercase', () => {
  for (const entry of LETTERS) {
    assert.match(entry.letter, /^[A-Z]$/);
    assert.equal(entry.lowercase, entry.letter.toLowerCase());
  }
});
