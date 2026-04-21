import { TransformControls } from '@react-three/drei';
import { useEffect, useMemo, useRef } from 'react';
import { BufferAttribute, BufferGeometry, Mesh } from 'three';
import { createCrayonTexture } from '../features/style/createCrayonTexture';
import { useSceneStore } from '../store/sceneStore';
import { SelectionOutline } from './SelectionOutline';
import type { PrimitiveObject } from '../types/scene';

function buildGeometry(primitive: PrimitiveObject) {
  const geometry = new BufferGeometry();
  geometry.setAttribute(
    'position',
    new BufferAttribute(new Float32Array(primitive.geometryData.positions), 3)
  );
  geometry.setAttribute(
    'normal',
    new BufferAttribute(new Float32Array(primitive.geometryData.normals), 3)
  );
  geometry.setIndex(primitive.geometryData.indices);
  geometry.computeVertexNormals();
  return geometry;
}

interface PrimitiveMeshProps {
  primitive: PrimitiveObject;
  onTransformStart: () => void;
  onTransformEnd: (primitive: PrimitiveObject, mesh: Mesh) => void;
}

export function PrimitiveMesh({
  primitive,
  onTransformStart,
  onTransformEnd,
}: PrimitiveMeshProps) {
  const meshRef = useRef<Mesh>(null!);
  const selectedId = useSceneStore((state) => state.history.present.selectionId);
  const activeTool = useSceneStore((state) => state.history.present.activeTool);
  const transformMode = useSceneStore((state) => state.history.present.transformMode);
  const selectEntity = useSceneStore((state) => state.selectEntity);

  const geometry = useMemo(() => buildGeometry(primitive), [primitive]);
  const texture = useMemo(() => createCrayonTexture(primitive.color), [primitive.color]);
  const isSelected = selectedId === primitive.id;

  useEffect(
    () => () => {
      geometry.dispose();
      texture.dispose();
    },
    [geometry, texture]
  );

  const mesh = (
    <mesh
      ref={meshRef}
      geometry={geometry}
      castShadow
      receiveShadow
      position={primitive.position}
      rotation={primitive.rotation}
      scale={primitive.scale}
      onClick={(event) => {
        event.stopPropagation();
        selectEntity(primitive.id);
      }}
    >
      <meshToonMaterial color={primitive.color} map={texture} />
      {isSelected ? <SelectionOutline /> : null}
    </mesh>
  );

  if (isSelected && activeTool === 'transform') {
    return (
      <>
        {mesh}
        <TransformControls
          object={meshRef}
          mode={transformMode}
          onMouseDown={onTransformStart}
          onMouseUp={() => {
            onTransformEnd(primitive, meshRef.current);
          }}
        />
      </>
    );
  }

  return mesh;
}
