import { useSceneStore } from '../../store/sceneStore';
import type { PrimitiveKind } from '../../types/scene';

const SHAPES: PrimitiveKind[] = ['sphere', 'cube', 'box', 'cylinder', 'cone', 'capsule'];

function formatShapeLabel(shape: PrimitiveKind) {
  return shape.charAt(0).toUpperCase() + shape.slice(1);
}

export function ShapePanel() {
  const addPrimitive = useSceneStore((state) => state.addPrimitive);

  return (
    <section className="panel">
      <h2>Shapes</h2>
      <div className="shape-grid">
        {SHAPES.map((shape) => (
          <button key={shape} type="button" onClick={() => addPrimitive(shape)}>
            {formatShapeLabel(shape)}
          </button>
        ))}
      </div>
    </section>
  );
}
