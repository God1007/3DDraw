import { useSceneStore } from '../store/sceneStore';
import type { Vec3 } from '../types/scene';

export function ToolCursor({ point }: { point: Vec3 | null }) {
  const brush = useSceneStore((state) => state.history.present.brush);
  const activeTool = useSceneStore((state) => state.history.present.activeTool);

  if (!point || (activeTool !== 'eraser' && activeTool !== 'deform')) {
    return null;
  }

  const radius = activeTool === 'deform' ? brush.deformRadius : brush.eraserRadius;
  const commonProps = {
    position: point,
    scale: [radius * 2, radius * 2, radius * 2] as [number, number, number],
  };

  return (
    <mesh {...commonProps}>
      {brush.eraserShape === 'cube' ? (
        <boxGeometry args={[1, 1, 1]} />
      ) : (
        <sphereGeometry args={[0.5, 18, 18]} />
      )}
      <meshBasicMaterial color="#ff8fab" transparent opacity={0.18} wireframe />
    </mesh>
  );
}
