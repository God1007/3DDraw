import { describe, expect, it } from 'vitest';
import { buildStrokeSegments } from '../../src/features/strokes/buildStrokeSegments';

describe('buildStrokeSegments', () => {
  it('turns a point path into chunky stroke segments', () => {
    const segments = buildStrokeSegments(
      [
        [0, 0, 0],
        [1, 0.2, 0],
        [2, 0.4, 0.1],
      ],
      0.18,
      42
    );

    expect(segments.length).toBe(2);
    expect(segments[0]?.radius).toBeGreaterThan(0.1);
    expect(segments[0]?.length).toBeGreaterThan(0.5);
  });
});
