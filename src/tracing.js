// Tracing logic: counts stroke length against a target. The canvas layer feeds
// it points; this module decides progress and completion, so tests can drive it
// without a pointer or a canvas.

export function createStrokeTracker(targetLength) {
  if (!(targetLength > 0)) throw new Error('targetLength must be positive');
  let drawn = 0;

  return {
    // points: [{x, y}, ...] for one continuous stroke.
    addStroke(points) {
      if (!Array.isArray(points) || points.length === 0) {
        throw new Error('stroke must be a non-empty array of points');
      }
      for (let i = 1; i < points.length; i += 1) {
        drawn += Math.hypot(
          points[i].x - points[i - 1].x,
          points[i].y - points[i - 1].y,
        );
      }
      return this.progress();
    },
    progress() {
      return Math.min(1, drawn / targetLength);
    },
    isComplete() {
      return drawn >= targetLength;
    },
  };
}
