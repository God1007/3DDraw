import { useThree } from '@react-three/fiber';
import { useMemo, useRef, useState } from 'react';
import { Raycaster, Vector2, Vector3 } from 'three';
import { applyDeform } from '../features/deform/applyDeform';
import { applyEraserToGeometry, applyEraserToStroke } from '../features/eraser/applyEraser';
import { useSceneStore } from '../store/sceneStore';
import { buildWorkingPlane } from './workingPlane';
import type { Vec3 } from '../types/scene';

function toVec3(point: Vector3): Vec3 {
  return [point.x, point.y, point.z];
}

export function useSceneInteractions() {
  const snapshot = useSceneStore((state) => state.history.present);
  const addStroke = useSceneStore((state) => state.addStroke);
  const replaceSnapshot = useSceneStore((state) => state.replaceSnapshot);
  const { camera, gl } = useThree();
  const raycaster = useMemo(() => new Raycaster(), []);
  const activePoints = useRef<Vector3[]>([]);
  const [cursorPoint, setCursorPoint] = useState<Vec3 | null>(null);

  function projectPointer(clientX: number, clientY: number) {
    const rect = gl.domElement.getBoundingClientRect();
    const pointer = new Vector2(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1
    );

    raycaster.setFromCamera(pointer, camera);
    const plane = buildWorkingPlane(snapshot, camera.position.clone(), camera.getWorldDirection(new Vector3()));
    const hit = new Vector3();

    return raycaster.ray.intersectPlane(plane, hit) ? hit : null;
  }

  return {
    onPointerDown(event: PointerEvent) {
      if (snapshot.activeTool !== 'crayon') {
        return;
      }

      const hit = projectPointer(event.clientX, event.clientY);
      activePoints.current = hit ? [hit.clone()] : [];
    },

    onPointerMove(event: PointerEvent) {
      const hit = projectPointer(event.clientX, event.clientY);
      setCursorPoint(hit ? toVec3(hit) : null);

      if (snapshot.activeTool === 'eraser' && hit) {
        const next = structuredClone(snapshot);
        next.strokes = next.strokes
          .map((stroke) =>
            applyEraserToStroke(
              stroke,
              toVec3(hit),
              snapshot.brush.eraserShape,
              snapshot.brush.eraserRadius
            )
          )
          .filter((stroke) => stroke.segmentData.length > 0);
        next.primitives = next.primitives.map((primitive) => ({
          ...primitive,
          geometryData: applyEraserToGeometry(
            primitive.geometryData,
            toVec3(hit),
            snapshot.brush.eraserShape,
            snapshot.brush.eraserRadius,
            0.08
          ),
        }));
        replaceSnapshot(next, false);
        return;
      }

      if (snapshot.activeTool === 'deform' && hit && snapshot.selectionId) {
        const next = structuredClone(snapshot);
        next.primitives = next.primitives.map((primitive) =>
          primitive.id !== snapshot.selectionId
            ? primitive
            : {
                ...primitive,
                geometryData: applyDeform(
                  primitive.geometryData,
                  toVec3(hit),
                  snapshot.brush.deformMode,
                  snapshot.brush.deformRadius,
                  snapshot.brush.deformStrength
                ),
              }
        );
        replaceSnapshot(next, false);
        return;
      }

      if (snapshot.activeTool !== 'crayon' || activePoints.current.length === 0 || !hit) {
        return;
      }

      const last = activePoints.current[activePoints.current.length - 1];
      if (last && last.distanceTo(hit) > 0.12) {
        activePoints.current.push(hit.clone());
      }
    },

    onPointerUp() {
      if (snapshot.activeTool === 'crayon' && activePoints.current.length >= 2) {
        addStroke(activePoints.current.map(toVec3));
      }

      if (snapshot.activeTool === 'eraser') {
        replaceSnapshot(structuredClone(useSceneStore.getState().history.present), true);
      }

      if (snapshot.activeTool === 'deform') {
        replaceSnapshot(structuredClone(useSceneStore.getState().history.present), true);
      }

      activePoints.current = [];
    },

    cursorPoint,
  };
}
