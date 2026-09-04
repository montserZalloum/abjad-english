import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeLetterQuestion, isCorrect } from '../src/quiz.js';

// Seeded rng so distribution assertions are deterministic.
function seeded(seed) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}

test('question has 3 options, exactly one correct', () => {
  const q = makeLetterQuestion('A', seeded(42));
  assert.equal(q.options.length, 3);
  assert.equal(q.options.filter((o) => o === 'A').length, 1);
  assert.equal(q.options[q.correctIndex], 'A');
});

test('distractors never include the correct letter', () => {
  for (let seed = 0; seed < 50; seed += 1) {
    const q = makeLetterQuestion('A', seeded(seed));
    const distractors = q.options.filter((_, i) => i !== q.correctIndex);
    assert.ok(!distractors.includes('A'));
  }
});

test('correct answer is not predictable by position', () => {
  // The defect that must be caught (R2.5b): a quiz whose correct answer is
  // always in the same slot teaches position, not letters.
  const positions = new Set();
  for (let seed = 0; seed < 100; seed += 1) {
    positions.add(makeLetterQuestion('A', seeded(seed)).correctIndex);
  }
  assert.ok(positions.size > 1, 'correct answer position never varies');
});

test('isCorrect judges by index', () => {
  const q = makeLetterQuestion('A', seeded(7));
  assert.equal(isCorrect(q, q.correctIndex), true);
  assert.equal(isCorrect(q, (q.correctIndex + 1) % 3), false);
});

test('prompt is Arabic and names the letter', () => {
  const q = makeLetterQuestion('A', seeded(1));
  assert.match(q.prompt, /[؀-ۿ]/);
  assert.match(q.prompt, /A/);
});
