import { create } from 'zustand';
import { createPrimitive } from '../features/primitives/createPrimitive';
import { buildInitialSnapshot } from './defaultScene';
import { createHistoryState, pushHistory, redoHistory, undoHistory, type HistoryState } from './history';
import type {
  BrushSettings,
  CrayonStroke,
  LightSettings,
  PrimitiveObject,
  SceneSnapshot,
  ToolKind,
  TransformMode,
} from '../types/scene';

export interface SceneStoreState {
  history: HistoryState<SceneSnapshot>;
  setTool: (tool: ToolKind) => void;
  setColor: (color: string) => void;
  setTransformMode: (mode: TransformMode) => void;
  selectEntity: (id: string | null) => void;
  addPrimitive: (kind: PrimitiveObject['type']) => void;
  updateSelectionTransform: (
    id: string,
    transform: { position: PrimitiveObject['position']; rotation: PrimitiveObject['rotation']; scale: PrimitiveObject['scale'] },
    commit?: boolean
  ) => void;
  replaceSnapshot: (snapshot: SceneSnapshot, commit?: boolean) => void;
  updateLights: (update: Partial<LightSettings>) => void;
  updateBrush: (update: Partial<BrushSettings>) => void;
  deleteSelected: () => void;
  resetScene: () => void;
  undo: () => void;
  redo: () => void;
}

function setSnapshotField(
  snapshot: SceneSnapshot,
  fields: Partial<SceneSnapshot>
): SceneSnapshot {
  return {
    ...snapshot,
    ...fields,
  };
}

function findPrimitive(snapshot: SceneSnapshot, id: string): PrimitiveObject | undefined {
  return snapshot.primitives.find((primitive) => primitive.id === id);
}

function findStroke(snapshot: SceneSnapshot, id: string): CrayonStroke | undefined {
  return snapshot.strokes.find((stroke) => stroke.id === id);
}

export const useSceneStore = create<SceneStoreState>((set) => ({
  history: createHistoryState(buildInitialSnapshot()),

  setTool: (tool) => {
    set((state) => ({
      history: {
        ...state.history,
        present: setSnapshotField(state.history.present, { activeTool: tool }),
      },
    }));
  },

  setColor: (color) => {
    set((state) => {
      const { history } = state;
      const { selectionId } = history.present;

      if (!selectionId) {
        return {
          history: {
            ...history,
            present: setSnapshotField(history.present, { activeColor: color }),
          },
        };
      }

      if (findPrimitive(history.present, selectionId)) {
        return {
          history: pushHistory(history, {
            ...history.present,
            activeColor: color,
            primitives: history.present.primitives.map((primitive) =>
              primitive.id === selectionId ? { ...primitive, color } : primitive
            ),
          }),
        };
      }

      if (findStroke(history.present, selectionId)) {
        return {
          history: pushHistory(history, {
            ...history.present,
            activeColor: color,
            strokes: history.present.strokes.map((stroke) =>
              stroke.id === selectionId ? { ...stroke, color } : stroke
            ),
          }),
        };
      }

      return {
        history: {
          ...history,
          present: setSnapshotField(history.present, { activeColor: color }),
        },
      };
    });
  },

  setTransformMode: (mode) => {
    set((state) => ({
      history: {
        ...state.history,
        present: setSnapshotField(state.history.present, { transformMode: mode }),
      },
    }));
  },

  selectEntity: (id) => {
    set((state) => ({
      history: {
        ...state.history,
        present: setSnapshotField(state.history.present, { selectionId: id }),
      },
    }));
  },

  addPrimitive: (kind) => {
    set((state) => {
      const primitive = createPrimitive(kind, state.history.present.activeColor);
      const snapshot: SceneSnapshot = {
        ...state.history.present,
        primitives: [...state.history.present.primitives, primitive],
        selectionId: primitive.id,
        activeTool: 'transform',
      };

      return { history: pushHistory(state.history, snapshot) };
    });
  },

  updateSelectionTransform: (id, transform, commit = false) => {
    set((state) => {
      const { history } = state;
      const primitiveIndex = history.present.primitives.findIndex((primitive) => primitive.id === id);
      if (primitiveIndex === -1) {
        return state;
      }

      const nextPrimitive = {
        ...history.present.primitives[primitiveIndex],
        position: transform.position,
        rotation: transform.rotation,
        scale: transform.scale,
      };

      const primitives = [...history.present.primitives];
      primitives[primitiveIndex] = nextPrimitive;
      const nextSnapshot = {
        ...history.present,
        primitives,
      };

      return commit
        ? { history: pushHistory(history, nextSnapshot) }
        : {
            history: {
              ...history,
              present: nextSnapshot,
            },
          };
    });
  },

  replaceSnapshot: (snapshot, commit = false) => {
    set((state) => ({
      history: commit
        ? pushHistory(state.history, snapshot)
        : {
            ...state.history,
            present: structuredClone(snapshot),
          },
    }));
  },

  updateLights: (update) => {
    set((state) => ({
      history: {
        ...state.history,
        present: {
          ...state.history.present,
          lights: {
            ...state.history.present.lights,
            ...update,
          },
        },
      },
    }));
  },

  updateBrush: (update) => {
    set((state) => ({
      history: {
        ...state.history,
        present: {
          ...state.history.present,
          brush: {
            ...state.history.present.brush,
            ...update,
          },
        },
      },
    }));
  },

  deleteSelected: () => {
    set((state) => {
      const { history } = state;
      const { selectionId } = history.present;

      if (!selectionId) {
        return state;
      }

      const hasPrimitive = history.present.primitives.some((primitive) => primitive.id === selectionId);
      const hasStroke = history.present.strokes.some((stroke) => stroke.id === selectionId);

      if (!hasPrimitive && !hasStroke) {
        return state;
      }

      return {
        history: pushHistory(history, {
          ...history.present,
          primitives: history.present.primitives.filter((primitive) => primitive.id !== selectionId),
          strokes: history.present.strokes.filter((stroke) => stroke.id !== selectionId),
          selectionId: null,
        }),
      };
    });
  },

  resetScene: () => {
    set((state) => ({
      history: pushHistory(state.history, buildInitialSnapshot()),
    }));
  },

  undo: () => {
    set((state) => ({
      history: undoHistory(state.history),
    }));
  },

  redo: () => {
    set((state) => ({
      history: redoHistory(state.history),
    }));
  },
}));
