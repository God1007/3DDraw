import type { CrayonStroke, EditableGeometryData, EraserShape, Vec3 } from '../../types/scene';

function distance(a: Vec3, b: Vec3) {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

function containsPoint(point: Vec3, center: Vec3, shape: EraserShape, radius: number) {
  if (shape === 'sphere') {
    return distance(point, center) <= radius;
  }

  if (shape === 'cube') {
    return (
      Math.abs(point[0] - center[0]) <= radius &&
      Math.abs(point[1] - center[1]) <= radius &&
      Math.abs(point[2] - center[2]) <= radius
    );
  }

  return (
    Math.hypot(point[0] - center[0], point[2] - center[2]) <= radius &&
    Math.abs(point[1] - center[1]) <= radius
  );
}

export function applyEraserToStroke(
  stroke: CrayonStroke,
  center: Vec3,
  shape: EraserShape,
  radius: number
) {
  return {
    ...stroke,
    segmentData: stroke.segmentData.filter(
      (segment) => !containsPoint(segment.center, center, shape, radius)
    ),
  };
}

export function applyEraserToGeometry(
  geometry: EditableGeometryData,
  center: Vec3,
  shape: EraserShape,
  radius: number,
  strength: number
): EditableGeometryData {
  const positions = [...geometry.positions];

  for (let index = 0; index < positions.length; index += 3) {
    const point: Vec3 = [positions[index] ?? 0, positions[index + 1] ?? 0, positions[index + 2] ?? 0];
    if (!containsPoint(point, center, shape, radius)) {
      continue;
    }

    let direction: Vec3 = [point[0] - center[0], point[1] - center[1], point[2] - center[2]];
    let length = Math.hypot(...direction);

    if (length < 0.0001) {
      direction = [
        geometry.normals[index] ?? 0,
        geometry.normals[index + 1] ?? 0,
        geometry.normals[index + 2] ?? 0,
      ];
      length = Math.max(Math.hypot(...direction), 0.0001);
    }

    const falloff = 1 - Math.min(length / radius, 1);

    positions[index] -= (direction[0] / length) * strength * falloff;
    positions[index + 1] -= (direction[1] / length) * strength * falloff;
    positions[index + 2] -= (direction[2] / length) * strength * falloff;
  }

  return { ...geometry, positions };
}
