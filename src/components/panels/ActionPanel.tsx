import { exportViewport } from '../../features/export/exportViewport';
import { useSceneStore } from '../../store/sceneStore';

interface ActionPanelProps {
  getCanvas?: () => HTMLCanvasElement | null;
}

export function ActionPanel({ getCanvas }: ActionPanelProps) {
  const selectionId = useSceneStore((state) => state.history.present.selectionId);
  const canUndo = useSceneStore((state) => state.history.past.length > 0);
  const canRedo = useSceneStore((state) => state.history.future.length > 0);
  const undo = useSceneStore((state) => state.undo);
  const redo = useSceneStore((state) => state.redo);
  const deleteSelected = useSceneStore((state) => state.deleteSelected);
  const resetScene = useSceneStore((state) => state.resetScene);

  return (
    <section className="panel">
      <h2>Actions</h2>
      <div className="action-grid">
        <button type="button" onClick={undo} disabled={!canUndo}>
          Undo
        </button>
        <button type="button" onClick={redo} disabled={!canRedo}>
          Redo
        </button>
        <button type="button" onClick={deleteSelected} disabled={!selectionId}>
          Delete Selected
        </button>
        <button type="button" onClick={resetScene}>
          Reset Scene
        </button>
        <button
          type="button"
          onClick={() => {
            const canvas = getCanvas?.();
            if (canvas) {
              exportViewport(canvas, 'png');
            }
          }}
        >
          Export PNG
        </button>
        <button
          type="button"
          onClick={() => {
            const canvas = getCanvas?.();
            if (canvas) {
              exportViewport(canvas, 'jpg');
            }
          }}
        >
          Export JPG
        </button>
      </div>
    </section>
  );
}
