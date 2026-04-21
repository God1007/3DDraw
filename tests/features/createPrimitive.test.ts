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

  it('welds duplicate vertices before building editable topology', () => {
    const primitive = createPrimitive('box', '#f78c35');
    const positions = primitive.geometryData.positions;
    const vertexKeys = new Set<string>();

    for (let i = 0; i < positions.length; i += 3) {
      vertexKeys.add(`${positions[i]},${positions[i + 1]},${positions[i + 2]}`);
    }

    expect(vertexKeys.size).toBe(positions.length / 3);
  });
});
