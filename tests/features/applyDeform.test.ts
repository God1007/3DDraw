import { describe, expect, it } from 'vitest';
import { applyDeform } from '../../src/features/deform/applyDeform';

const geometry = {
  positions: [0, 0, 0, 1, 0, 0, 2, 0, 0],
  indices: [0, 1, 2],
  normals: [1, 0, 0, 1, 0, 0, 1, 0, 0],
  neighbors: [[1], [0, 2], [1]],
};

describe('applyDeform', () => {
  it('pushes vertices outward in inflate mode', () => {
    const next = applyDeform(geometry, [0, 0, 0], 'inflate', 1.5, 0.2);
    expect(next.positions[0]).toBeGreaterThan(0);
  });

  it('smooths vertices toward their neighbors', () => {
    const spiky = { ...geometry, positions: [0, 0, 0, 5, 0, 0, 2, 0, 0] };
    const next = applyDeform(spiky, [1, 0, 0], 'smooth', 3, 0.5);
    expect(next.positions[3]).toBeLessThan(5);
  });
});
