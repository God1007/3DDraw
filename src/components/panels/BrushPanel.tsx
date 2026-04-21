import { useSceneStore } from '../../store/sceneStore';
import type { DeformMode, DrawingPlaneMode, EraserShape } from '../../types/scene';

export function BrushPanel() {
  const brush = useSceneStore((state) => state.history.present.brush);
  const updateBrush = useSceneStore((state) => state.updateBrush);

  return (
    <section className="panel">
      <h2>Brush</h2>
      <div className="control-stack">
        <label>
          Radius
          <input
            type="range"
            min="0.2"
            max="2"
            step="0.05"
            value={brush.eraserRadius}
            onChange={(event) => {
              const value = Number(event.target.value);
              updateBrush({
                eraserRadius: value,
                deformRadius: value,
              });
            }}
          />
        </label>
        <label>
          Eraser Shape
          <select
            value={brush.eraserShape}
            onChange={(event) => updateBrush({ eraserShape: event.target.value as EraserShape })}
          >
            <option value="sphere">Sphere</option>
            <option value="cube">Cube</option>
            <option value="cylinder">Cylinder</option>
          </select>
        </label>
        <label>
          Strength
          <input
            type="range"
            min="0.05"
            max="0.5"
            step="0.01"
            value={brush.deformStrength}
            onChange={(event) => updateBrush({ deformStrength: Number(event.target.value) })}
          />
        </label>
        <label>
          Deform Mode
          <select
            value={brush.deformMode}
            onChange={(event) => updateBrush({ deformMode: event.target.value as DeformMode })}
          >
            <option value="pushPull">Push / Pull</option>
            <option value="inflate">Inflate</option>
            <option value="smooth">Smooth</option>
          </select>
        </label>
        <label>
          Drawing Plane
          <select
            value={brush.drawingPlaneMode}
            onChange={(event) =>
              updateBrush({ drawingPlaneMode: event.target.value as DrawingPlaneMode })
            }
          >
            <option value="camera">Camera</option>
            <option value="ground">Ground</option>
          </select>
        </label>
      </div>
    </section>
  );
}
