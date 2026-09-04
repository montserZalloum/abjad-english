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
  assert.equal(isComplete(getLetter('D')), false);
  assert.equal(isComplete(getLetter('A')), true);
  assert.equal(isComplete(getLetter('B')), true);
  assert.equal(isComplete(getLetter('C')), true);
});

test("B's word starts with B", () => {
  const b = getLetter('B');
  assert.equal(b.word, 'Ball');
  assert.ok(b.word.startsWith('B'));
});

test("C's word starts with C", () => {
  const c = getLetter('C');
  assert.equal(c.word, 'Cat');
  assert.ok(c.word.startsWith('C'));
});

test('every letter has an uppercase letter and matching lowercase', () => {
  for (const entry of LETTERS) {
    assert.match(entry.letter, /^[A-Z]$/);
    assert.equal(entry.lowercase, entry.letter.toLowerCase());
  }
});
