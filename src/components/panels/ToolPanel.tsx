import { TOOL_OPTIONS, TRANSFORM_MODES } from '../../constants/tools';
import { useSceneStore } from '../../store/sceneStore';

export function ToolPanel() {
  const activeTool = useSceneStore((state) => state.history.present.activeTool);
  const transformMode = useSceneStore((state) => state.history.present.transformMode);
  const setTool = useSceneStore((state) => state.setTool);
  const setTransformMode = useSceneStore((state) => state.setTransformMode);

  return (
    <section className="panel">
      <h2>Tools</h2>
      <div className="tool-grid">
        {TOOL_OPTIONS.map((tool) => (
          <button
            key={tool.value}
            type="button"
            data-active={String(activeTool === tool.value)}
            onClick={() => setTool(tool.value)}
          >
            {tool.label}
          </button>
        ))}
      </div>
      <div className="subtool-row">
        {TRANSFORM_MODES.map((mode) => (
          <button
            key={mode.value}
            type="button"
            data-active={String(transformMode === mode.value)}
            onClick={() => {
              setTool('transform');
              setTransformMode(mode.value);
            }}
          >
            {mode.label}
          </button>
        ))}
      </div>
    </section>
  );
}
