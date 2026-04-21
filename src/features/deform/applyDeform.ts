import type { DeformMode, EditableGeometryData, Vec3 } from '../../types/scene';

function distance(a: Vec3, b: Vec3) {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

export function applyDeform(
  geometry: EditableGeometryData,
  center: Vec3,
  mode: DeformMode,
  radius: number,
  strength: number
): EditableGeometryData {
  const positions = [...geometry.positions];
  const sourcePositions = [...geometry.positions];

  for (let index = 0; index < positions.length; index += 3) {
    const point: Vec3 = [
      sourcePositions[index] ?? 0,
      sourcePositions[index + 1] ?? 0,
      sourcePositions[index + 2] ?? 0,
    ];
    const dist = distance(point, center);
    const vertexIndex = index / 3;

    if (mode === 'smooth') {
      const neighbors = geometry.neighbors[vertexIndex] ?? [];
      if (neighbors.length === 0) {
        continue;
      }

      const neighborInRange = neighbors.some((neighbor) => {
        const neighborPoint: Vec3 = [
          sourcePositions[neighbor * 3] ?? 0,
          sourcePositions[neighbor * 3 + 1] ?? 0,
          sourcePositions[neighbor * 3 + 2] ?? 0,
        ];

        return distance(neighborPoint, center) <= radius;
      });

      if (dist > radius && !neighborInRange) {
        continue;
      }

      const effectiveDistance = dist > radius ? radius * 0.5 : dist;
      const falloff = 1 - Math.min(effectiveDistance / radius, 1);

      const average = neighbors.reduce<Vec3>(
        (accumulator, neighbor) => {
          accumulator[0] += sourcePositions[neighbor * 3] ?? 0;
          accumulator[1] += sourcePositions[neighbor * 3 + 1] ?? 0;
          accumulator[2] += sourcePositions[neighbor * 3 + 2] ?? 0;
          return accumulator;
        },
        [0, 0, 0]
      );

      average[0] /= neighbors.length;
      average[1] /= neighbors.length;
      average[2] /= neighbors.length;

      positions[index] += (average[0] - point[0]) * strength * falloff;
      positions[index + 1] += (average[1] - point[1]) * strength * falloff;
      positions[index + 2] += (average[2] - point[2]) * strength * falloff;
      continue;
    }

    if (dist > radius) {
      continue;
    }

    const falloff = 1 - dist / radius;

    let direction: Vec3 = [point[0] - center[0], point[1] - center[1], point[2] - center[2]];
    let length = Math.hypot(...direction);

    if (length < 0.0001) {
      direction = [
        geometry.normals[index] ?? 1,
        geometry.normals[index + 1] ?? 0,
        geometry.normals[index + 2] ?? 0,
      ];
      length = Math.max(Math.hypot(...direction), 0.0001);
    }

    const signedStrength = mode === 'pushPull' ? -strength : strength;

    positions[index] += (direction[0] / length) * signedStrength * falloff;
    positions[index + 1] += (direction[1] / length) * signedStrength * falloff;
    positions[index + 2] += (direction[2] / length) * signedStrength * falloff;
  }

  return { ...geometry, positions };
}
