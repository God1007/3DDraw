import { Grid } from '@react-three/drei';
import { useSceneStore } from '../store/sceneStore';

export function SceneEnvironment() {
  const lights = useSceneStore((state) => state.history.present.lights);

  return (
    <>
      <ambientLight intensity={lights.ambientIntensity} />
      <directionalLight
        castShadow
        intensity={1.2}
        position={[lights.directionalX, lights.directionalY, lights.directionalZ]}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <Grid
        infiniteGrid
        position={[0, -2.25, 0]}
        cellSize={0.8}
        sectionSize={4}
        fadeDistance={32}
        cellColor="#d8c0a4"
        sectionColor="#b79674"
      />
    </>
  );
}
