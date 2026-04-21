import { Quaternion, Vector3 } from 'three';
import type { StrokeSegment, Vec3 } from '../../types/scene';

function seededNoise(seed: number) {
  let value = seed >>> 0;

  return () => {
    value = (1664525 * value + 1013904223) >>> 0;
    return value / 0xffffffff;
  };
}

export function buildStrokeSegments(
  points: Vec3[],
  thickness: number,
  jitterSeed: number
): StrokeSegment[] {
  const random = seededNoise(jitterSeed);
  const up = new Vector3(0, 1, 0);

  return points.slice(0, -1).flatMap((point, index) => {
    const next = points[index + 1];

    if (!next) {
      return [];
    }

    const start = new Vector3(...point);
    const end = new Vector3(...next);
    const direction = end.clone().sub(start);
    const length = direction.length();

    if (length < 0.02) {
      return [];
    }

    const center = start.clone().lerp(end, 0.5);
    const quaternion = new Quaternion().setFromUnitVectors(up, direction.clone().normalize());
    const radius = thickness * (0.88 + random() * 0.26);

    return [
      {
        center: [center.x, center.y, center.z],
        rotation: [quaternion.x, quaternion.y, quaternion.z, quaternion.w],
        radius,
        length,
      },
    ];
  });
}
