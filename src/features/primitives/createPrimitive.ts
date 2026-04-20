import {
  BoxGeometry,
  CapsuleGeometry,
  ConeGeometry,
  CylinderGeometry,
  SphereGeometry,
  type BufferGeometry,
} from 'three';
import type { EditableGeometryData, PrimitiveKind, PrimitiveObject } from '../../types/scene';

function buildNeighborMap(indices: number[], vertexCount: number): number[][] {
  const neighbors = Array.from({ length: vertexCount }, () => new Set<number>());

  for (let i = 0; i < indices.length; i += 3) {
    const a = indices[i];
    const b = indices[i + 1];
    const c = indices[i + 2];

    if (a === undefined || b === undefined || c === undefined) {
      continue;
    }

    neighbors[a].add(b);
    neighbors[a].add(c);
    neighbors[b].add(a);
    neighbors[b].add(c);
    neighbors[c].add(a);
    neighbors[c].add(b);
  }

  return neighbors.map((set) => Array.from(set).sort((left, right) => left - right));
}

function toEditableGeometryData(geometry: BufferGeometry): EditableGeometryData {
  const indexedGeometry = geometry.clone();
  indexedGeometry.computeVertexNormals();

  const positionAttribute = indexedGeometry.getAttribute('position');
  const normalAttribute = indexedGeometry.getAttribute('normal');
  const indexAttribute = indexedGeometry.getIndex();

  if (!indexAttribute) {
    throw new Error('Primitive geometry must be indexed.');
  }

  const positions = Array.from(positionAttribute.array as ArrayLike<number>);
  const normals = Array.from(normalAttribute.array as ArrayLike<number>);
  const indices = Array.from(indexAttribute.array as ArrayLike<number>);

  return {
    positions,
    indices,
    normals,
    neighbors: buildNeighborMap(indices, positionAttribute.count),
  };
}

const GEOMETRY_FACTORIES: Record<PrimitiveKind, () => BufferGeometry> = {
  sphere: () => new SphereGeometry(1, 28, 24),
  cube: () => new BoxGeometry(1.5, 1.5, 1.5, 8, 8, 8),
  box: () => new BoxGeometry(2, 1.25, 1.5, 10, 8, 8),
  cylinder: () => new CylinderGeometry(0.9, 0.9, 2, 24, 12),
  cone: () => new ConeGeometry(1, 2, 24, 12),
  capsule: () => new CapsuleGeometry(0.75, 1.25, 10, 20),
};

export function createPrimitive(kind: PrimitiveKind, color: string): PrimitiveObject {
  const geometry = GEOMETRY_FACTORIES[kind]();
  const geometryData = toEditableGeometryData(geometry);

  return {
    id: crypto.randomUUID(),
    type: kind,
    color,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    geometryData,
    meshResolution: 1,
  };
}
