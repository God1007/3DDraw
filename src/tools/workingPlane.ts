import { Plane, Vector3 } from 'three';
import type { SceneSnapshot } from '../types/scene';

export function buildWorkingPlane(
  snapshot: SceneSnapshot,
  _cameraPosition: Vector3,
  cameraDirection: Vector3
) {
  if (snapshot.brush.drawingPlaneMode === 'ground') {
    return new Plane(new Vector3(0, 1, 0), 0);
  }

  const anchor =
    snapshot.primitives.find((primitive) => primitive.id === snapshot.selectionId)?.position ?? [0, 0, 0];

  const anchorPoint = new Vector3(...anchor).add(cameraDirection.clone().multiplyScalar(0.75));

  return new Plane().setFromNormalAndCoplanarPoint(cameraDirection.clone().normalize(), anchorPoint);
}
