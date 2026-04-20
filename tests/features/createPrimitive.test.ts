import { describe, expect, it } from 'vitest';
import { createPrimitive } from '../../src/features/primitives/createPrimitive';

describe('createPrimitive', () => {
  it('creates a centered capsule with editable geometry data', () => {
    const primitive = createPrimitive('capsule', '#ffd166');

    expect(primitive.type).toBe('capsule');
    expect(primitive.color).toBe('#ffd166');
    expect(primitive.position).toEqual([0, 0, 0]);
    expect(primitive.geometryData.positions.length).toBeGreaterThan(0);
    expect(primitive.geometryData.indices.length).toBeGreaterThan(0);
    expect(primitive.geometryData.neighbors.length).toBeGreaterThan(0);
  });
});
