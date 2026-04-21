import { useEffect, useMemo } from 'react';
import { createCrayonTexture } from '../features/style/createCrayonTexture';
import { useSceneStore } from '../store/sceneStore';
import type { CrayonStroke } from '../types/scene';

export function StrokeMesh({ stroke }: { stroke: CrayonStroke }) {
  const texture = useMemo(() => createCrayonTexture(stroke.color), [stroke.color]);
  const selectedId = useSceneStore((state) => state.history.present.selectionId);
  const selectEntity = useSceneStore((state) => state.selectEntity);

  useEffect(() => () => texture.dispose(), [texture]);

  return (
    <group
      onClick={(event) => {
        event.stopPropagation();
        selectEntity(stroke.id);
      }}
    >
      {stroke.segmentData.map((segment, index) => (
        <mesh
          key={`${stroke.id}-${index}`}
          position={segment.center}
          quaternion={segment.rotation}
          castShadow
          receiveShadow
        >
          <capsuleGeometry
            args={[segment.radius, Math.max(segment.length - segment.radius * 2, 0.02), 6, 10]}
          />
          <meshToonMaterial color={stroke.color} map={texture} />
        </mesh>
      ))}
      {selectedId === stroke.id ? (
        <mesh position={stroke.segmentData[0]?.center ?? [0, 0, 0]}>
          <sphereGeometry args={[0.08, 10, 10]} />
          <meshBasicMaterial color="#3a2e28" />
        </mesh>
      ) : null}
    </group>
  );
}
