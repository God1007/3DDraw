import { OrbitControls } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useSceneStore } from '../store/sceneStore';
import { useSceneInteractions } from '../tools/useSceneInteractions';
import { PrimitiveMesh } from './PrimitiveMesh';
import { SceneEnvironment } from './SceneEnvironment';
import { StrokeMesh } from './StrokeMesh';
import { ToolCursor } from './ToolCursor';

export interface SceneCanvasHandle {
  getCanvas: () => HTMLCanvasElement | null;
}

function InteractionBinder() {
  const interactions = useSceneInteractions();
  const { gl } = useThree();

  useEffect(() => {
    const dom = gl.domElement;

    dom.addEventListener('pointerdown', interactions.onPointerDown);
    dom.addEventListener('pointermove', interactions.onPointerMove);
    dom.addEventListener('pointerup', interactions.onPointerUp);

    return () => {
      dom.removeEventListener('pointerdown', interactions.onPointerDown);
      dom.removeEventListener('pointermove', interactions.onPointerMove);
      dom.removeEventListener('pointerup', interactions.onPointerUp);
    };
  }, [gl, interactions]);

  return <ToolCursor point={interactions.cursorPoint} />;
}

export const SceneCanvas = forwardRef<SceneCanvasHandle>(function SceneCanvas(_, ref) {
  const snapshot = useSceneStore((state) => state.history.present);
  const selectEntity = useSceneStore((state) => state.selectEntity);
  const updateSelectionTransform = useSceneStore((state) => state.updateSelectionTransform);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [orbitEnabled, setOrbitEnabled] = useState(true);

  useImperativeHandle(ref, () => ({
    getCanvas: () => canvasRef.current,
  }));

  return (
    <div className="canvas-shell">
      <Canvas
        camera={{ position: [6, 5, 8], fov: 42 }}
        shadows
        gl={{ preserveDrawingBuffer: true }}
        onCreated={({ gl }) => {
          canvasRef.current = gl.domElement;
        }}
      >
        <color attach="background" args={['#f9eed7']} />
        <InteractionBinder />
        <SceneEnvironment />
        {snapshot.primitives.map((primitive) => (
          <PrimitiveMesh
            key={primitive.id}
            primitive={primitive}
            onTransformStart={() => setOrbitEnabled(false)}
            onTransformEnd={(item, mesh) => {
              updateSelectionTransform(
                item.id,
                {
                  position: mesh.position.toArray() as [number, number, number],
                  rotation: [mesh.rotation.x, mesh.rotation.y, mesh.rotation.z],
                  scale: mesh.scale.toArray() as [number, number, number],
                },
                true
              );
              setOrbitEnabled(true);
            }}
          />
        ))}
        {snapshot.strokes.map((stroke) => (
          <StrokeMesh key={stroke.id} stroke={stroke} />
        ))}
        <mesh
          position={[0, -2.4, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          onClick={() => selectEntity(null)}
        >
          <planeGeometry args={[80, 80]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
        <OrbitControls makeDefault enabled={orbitEnabled} />
      </Canvas>
    </div>
  );
});
