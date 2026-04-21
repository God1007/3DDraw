import { useRef } from 'react';
import { AppShell } from './components/layout/AppShell';
import { ActionPanel } from './components/panels/ActionPanel';
import { BrushPanel } from './components/panels/BrushPanel';
import { ColorPalette } from './components/panels/ColorPalette';
import { LightPanel } from './components/panels/LightPanel';
import { ShapePanel } from './components/panels/ShapePanel';
import { ToolPanel } from './components/panels/ToolPanel';
import { SceneCanvas, type SceneCanvasHandle } from './scene/SceneCanvas';

function Sidebar({ getCanvas }: { getCanvas: () => HTMLCanvasElement | null }) {
  return (
    <>
      <header className="hero-card">
        <h1>3D Crayon Modeler</h1>
        <p>Squish, doodle, erase, and light waxy toy forms.</p>
      </header>
      <ShapePanel />
      <ToolPanel />
      <ColorPalette />
      <BrushPanel />
      <LightPanel />
      <ActionPanel getCanvas={getCanvas} />
    </>
  );
}

export default function App() {
  const sceneRef = useRef<SceneCanvasHandle>(null);

  return (
    <AppShell
      sidebar={<Sidebar getCanvas={() => sceneRef.current?.getCanvas() ?? null} />}
      canvas={<SceneCanvas ref={sceneRef} />}
    />
  );
}
