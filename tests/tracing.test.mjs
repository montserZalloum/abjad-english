import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createStrokeTracker } from '../src/tracing.js';

test('incomplete below the target, complete at it', () => {
  const tracker = createStrokeTracker(100);
  tracker.addStroke([{ x: 0, y: 0 }, { x: 30, y: 0 }]);
  assert.equal(tracker.isComplete(), false);
  tracker.addStroke([{ x: 0, y: 0 }, { x: 0, y: 80 }]);
  assert.equal(tracker.isComplete(), true);
});

test('progress is monotonic and capped at 1', () => {
  const tracker = createStrokeTracker(50);
  const p1 = tracker.addStroke([{ x: 0, y: 0 }, { x: 10, y: 0 }]);
  const p2 = tracker.addStroke([{ x: 0, y: 0 }, { x: 100, y: 0 }]);
  assert.ok(p2 > p1);
  assert.equal(tracker.progress(), 1);
});

test('empty stroke is rejected, not silently ignored', () => {
  const tracker = createStrokeTracker(10);
  assert.throws(() => tracker.addStroke([]), /non-empty/);
});
