import { describe, expect, it } from 'vitest';
import { createHistoryState, pushHistory, redoHistory, undoHistory } from '../../src/store/history';
import { createDefaultSceneSnapshot } from '../../src/store/defaultScene';
import { useSceneStore } from '../../src/store/sceneStore';
import type { PrimitiveObject } from '../../src/types/scene';

describe('history helpers', () => {
  it('undoes and redoes serializable scene snapshots', () => {
    const initial = { primitives: [], strokes: [], selectionId: null };
    const afterAdd = { primitives: [{ id: 'a' }], strokes: [], selectionId: 'a' };

    const seeded = pushHistory(createHistoryState(initial), afterAdd);
    const undone = undoHistory(seeded);
    const redone = redoHistory(undone);

    expect(undone.present).toEqual(initial);
    expect(redone.present).toEqual(afterAdd);
  });
});

describe('scene store history behavior', () => {
  it('replaceSnapshot preserves history stacks when not committed', () => {
    const initial = createDefaultSceneSnapshot();
    const snapshot = {
      ...initial,
      selectionId: 'keep-history',
    };
    const replacement = {
      ...initial,
      selectionId: 'replacement',
    };

    const history = pushHistory(createHistoryState(initial), snapshot);
    const future = {
      ...initial,
      selectionId: 'future',
    };

    useSceneStore.setState({
      history: {
        ...history,
        future: [future],
      },
    });

    useSceneStore.getState().replaceSnapshot(replacement, false);

    const nextHistory = useSceneStore.getState().history;
    expect(nextHistory.past).toEqual(history.past);
    expect(nextHistory.future).toEqual([future]);
    expect(nextHistory.present).toEqual(replacement);
  });

  it('updates selection transform without pushing history until committed', () => {
    const initial = createDefaultSceneSnapshot();
    const primitive: PrimitiveObject = {
      id: 'primitive-1',
      type: 'cube',
      color: '#ffd166',
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      geometryData: {
        positions: [0, 0, 0],
        indices: [0, 1, 2],
        normals: [0, 0, 1],
        neighbors: [[1], [0], []],
      },
      meshResolution: 1,
    };

    const history = pushHistory(createHistoryState(initial), {
      ...initial,
      primitives: [primitive],
      selectionId: primitive.id,
    });

    useSceneStore.setState({ history });

    useSceneStore.getState().updateSelectionTransform(primitive.id, {
      position: [2, 3, 4],
    });

    const nextHistory = useSceneStore.getState().history;
    expect(nextHistory.past).toEqual(history.past);
    expect(nextHistory.future).toEqual(history.future);
    expect(nextHistory.present.primitives[0]?.position).toEqual([2, 3, 4]);
    expect(nextHistory.present.primitives[0]?.rotation).toEqual([0, 0, 0]);
    expect(nextHistory.present.primitives[0]?.scale).toEqual([1, 1, 1]);
  });
});
