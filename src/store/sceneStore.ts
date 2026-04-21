import { create } from 'zustand';
import { buildStrokeSegments } from '../features/strokes/buildStrokeSegments';
import { createPrimitive } from '../features/primitives/createPrimitive';
import { buildInitialSnapshot } from './defaultScene';
import { createHistoryState, redoHistory, undoHistory, type HistoryState } from './history';
import type {
  BrushSettings,
  CrayonStroke,
  LightSettings,
  PrimitiveObject,
  SceneSnapshot,
  ToolKind,
  TransformMode,
  Vec3,
} from '../types/scene';

export interface SceneStoreState {
  history: HistoryState<SceneSnapshot>;
  setTool: (tool: ToolKind) => void;
  setColor: (color: string) => void;
  setTransformMode: (mode: TransformMode) => void;
  selectEntity: (id: string | null) => void;
  addPrimitive: (kind: PrimitiveObject['type']) => void;
  addStroke: (points: Vec3[]) => void;
  updateSelectionTransform: (
    id: string,
    transform: { position: Vec3; rotation: Vec3; scale: Vec3 },
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

const committedBaselines = new WeakMap<HistoryState<SceneSnapshot>, SceneSnapshot>();

function cloneSnapshot(snapshot: SceneSnapshot): SceneSnapshot {
  return structuredClone(snapshot);
}

function setCommittedBaseline(history: HistoryState<SceneSnapshot>, baseline: SceneSnapshot): HistoryState<SceneSnapshot> {
  committedBaselines.set(history, cloneSnapshot(baseline));
  return history;
}

function getCommittedBaseline(history: HistoryState<SceneSnapshot>): SceneSnapshot {
  return committedBaselines.get(history) ?? history.present;
}

function createTrackedHistory(snapshot: SceneSnapshot): HistoryState<SceneSnapshot> {
  return setCommittedBaseline(createHistoryState(snapshot), snapshot);
}

function carryCommittedBaseline(
  source: HistoryState<SceneSnapshot>,
  target: HistoryState<SceneSnapshot>
): HistoryState<SceneSnapshot> {
  return setCommittedBaseline(target, getCommittedBaseline(source));
}

function syncCommittedBaseline(
  target: HistoryState<SceneSnapshot>
): HistoryState<SceneSnapshot> {
  return setCommittedBaseline(target, target.present);
}

function commitHistory(
  history: HistoryState<SceneSnapshot>,
  next: SceneSnapshot
): HistoryState<SceneSnapshot> {
  const past = [...history.past, cloneSnapshot(getCommittedBaseline(history))];
  return setCommittedBaseline(
    {
      past,
      present: cloneSnapshot(next),
      future: [],
    },
    next
  );
}

export const useSceneStore = create<SceneStoreState>((set) => ({
  history: createTrackedHistory(buildInitialSnapshot()),

  setTool: (tool) => {
    set((state) => ({
      history: syncCommittedBaseline({
        ...state.history,
        present: setSnapshotField(state.history.present, { activeTool: tool }),
      }),
    }));
  },

  setColor: (color) => {
    set((state) => {
      const { history } = state;
      const { selectionId } = history.present;

      if (!selectionId) {
        return {
          history: syncCommittedBaseline({
            ...history,
            present: setSnapshotField(history.present, { activeColor: color }),
          }),
        };
      }

      if (findPrimitive(history.present, selectionId)) {
        return {
          history: commitHistory(history, {
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
          history: commitHistory(history, {
            ...history.present,
            activeColor: color,
            strokes: history.present.strokes.map((stroke) =>
              stroke.id === selectionId ? { ...stroke, color } : stroke
            ),
          }),
        };
      }

      return {
        history: syncCommittedBaseline({
          ...history,
          present: setSnapshotField(history.present, { activeColor: color }),
        }),
      };
    });
  },

  setTransformMode: (mode) => {
    set((state) => ({
      history: syncCommittedBaseline({
        ...state.history,
        present: setSnapshotField(state.history.present, { transformMode: mode }),
      }),
    }));
  },

  selectEntity: (id) => {
    set((state) => ({
      history: syncCommittedBaseline({
        ...state.history,
        present: setSnapshotField(state.history.present, { selectionId: id }),
      }),
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

      return { history: commitHistory(state.history, snapshot) };
    });
  },

  addStroke: (points) => {
    set((state) => {
      if (points.length < 2) {
        return state;
      }

      const jitterSeed = Math.floor(Math.random() * 100000);
      const stroke: CrayonStroke = {
        id: crypto.randomUUID(),
        color: state.history.present.activeColor,
        points,
        thickness: 0.18,
        jitterSeed,
        segmentData: buildStrokeSegments(points, 0.18, jitterSeed),
      };

      const snapshot: SceneSnapshot = {
        ...state.history.present,
        strokes: [...state.history.present.strokes, stroke],
        selectionId: stroke.id,
      };

      return { history: commitHistory(state.history, snapshot) };
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
        ? { history: commitHistory(history, nextSnapshot) }
        : {
            history: carryCommittedBaseline(history, {
              ...history,
              present: nextSnapshot,
            }),
          };
    });
  },

  replaceSnapshot: (snapshot, commit = false) => {
    set((state) => ({
      history: commit
        ? commitHistory(state.history, snapshot)
        : carryCommittedBaseline(state.history, {
            ...state.history,
            present: structuredClone(snapshot),
          }),
    }));
  },

  updateLights: (update) => {
    set((state) => ({
      history: syncCommittedBaseline({
        ...state.history,
        present: {
          ...state.history.present,
          lights: {
            ...state.history.present.lights,
            ...update,
          },
        },
      }),
    }));
  },

  updateBrush: (update) => {
    set((state) => ({
      history: syncCommittedBaseline({
        ...state.history,
        present: {
          ...state.history.present,
          brush: {
            ...state.history.present.brush,
            ...update,
          },
        },
      }),
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
        history: commitHistory(history, {
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
      history: commitHistory(state.history, buildInitialSnapshot()),
    }));
  },

  undo: () => {
    set((state) => ({
      history: (() => {
        const nextHistory = undoHistory(state.history);
        return setCommittedBaseline(nextHistory, nextHistory.present);
      })(),
    }));
  },

  redo: () => {
    set((state) => ({
      history: (() => {
        const nextHistory = redoHistory(state.history);
        return setCommittedBaseline(nextHistory, nextHistory.present);
      })(),
    }));
  },
}));
