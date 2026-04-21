import { describe, expect, it } from 'vitest';
import { applyEraserToGeometry, applyEraserToStroke } from '../../src/features/eraser/applyEraser';

describe('applyEraser', () => {
  it('removes stroke segments inside the brush radius', () => {
    const stroke = {
      segmentData: [
        { center: [0, 0, 0], rotation: [0, 0, 0, 1], radius: 0.2, length: 1 },
        { center: [3, 0, 0], rotation: [0, 0, 0, 1], radius: 0.2, length: 1 },
      ],
    };

    const next = applyEraserToStroke(stroke as never, [0.1, 0, 0], 'sphere', 0.6);
    expect(next.segmentData).toHaveLength(1);
  });

  it('pushes nearby vertices inward on editable geometry', () => {
    const geometry = {
      positions: [0, 0, 0, 1, 0, 0, 3, 0, 0],
      indices: [0, 1, 2],
      normals: [1, 0, 0, 1, 0, 0, 1, 0, 0],
      neighbors: [[1], [0, 2], [1]],
    };

    const carved = applyEraserToGeometry(geometry, [0, 0, 0], 'sphere', 1.2, 0.3);
    expect(carved.positions[0]).toBeLessThan(0);
    expect(carved.positions[6]).toBe(3);
  });
});
