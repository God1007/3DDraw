import { describe, expect, it } from 'vitest';
import { CRAYON_COLORS } from '../../src/constants/palette';
import { TOOL_OPTIONS, TRANSFORM_MODES } from '../../src/constants/tools';
import { buildInitialSnapshot } from '../../src/store/defaultScene';
import { createHistoryState, pushHistory, redoHistory, undoHistory } from '../../src/store/history';
import { useSceneStore } from '../../src/store/sceneStore';
import type { CrayonStroke, PrimitiveObject, StrokeSegment } from '../../src/types/scene';

function createPrimitiveFixture(id: string, color = '#ffd166'): PrimitiveObject {
  return {
    id,
    type: 'cube',
    color,
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
}

function createStrokeFixture(id: string, color = '#ef476f'): CrayonStroke {
  const segment: StrokeSegment = {
    center: [0, 0, 0],
    rotation: [0, 0, 0, 1],
    radius: 0.25,
    length: 1,
  };

  return {
    id,
    color,
    points: [[0, 0, 0]],
    thickness: 0.25,
    jitterSeed: 1,
    segmentData: [segment],
  };
}

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
  it('keeps undo anchored to the last committed snapshot across previews', () => {
    const primitive = createPrimitiveFixture('primitive-1');
    const history = createHistoryState({
      ...buildInitialSnapshot(),
      primitives: [primitive],
      selectionId: primitive.id,
    });

    useSceneStore.setState({ history });

    useSceneStore.getState().updateSelectionTransform(primitive.id, {
      position: [1, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
    });

    useSceneStore.getState().updateSelectionTransform(primitive.id, {
      position: [2, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
    }, true);

    useSceneStore.getState().undo();

    const nextHistory = useSceneStore.getState().history;
    expect(nextHistory.present.primitives[0]?.position).toEqual([0, 0, 0]);
    expect(nextHistory.past).toHaveLength(0);
  });

  it('supports addPrimitive followed by undo and redo', () => {
    useSceneStore.setState({ history: createHistoryState(buildInitialSnapshot()) });

    useSceneStore.getState().addPrimitive('cube');
    expect(useSceneStore.getState().history.present.primitives).toHaveLength(1);

    useSceneStore.getState().undo();
    expect(useSceneStore.getState().history.present.primitives).toHaveLength(0);

    useSceneStore.getState().redo();
    expect(useSceneStore.getState().history.present.primitives).toHaveLength(1);
  });

  it('recolors a selected primitive and records history', () => {
    const primitive = createPrimitiveFixture('primitive-2', '#ffd166');
    const history = createHistoryState({
      ...buildInitialSnapshot(),
      primitives: [primitive],
      selectionId: primitive.id,
    });

    useSceneStore.setState({ history });
    useSceneStore.getState().setColor('#3a86ff');

    const nextHistory = useSceneStore.getState().history;
    expect(nextHistory.present.primitives[0]?.color).toBe('#3a86ff');
    expect(nextHistory.past).toHaveLength(1);

    useSceneStore.getState().undo();
    expect(useSceneStore.getState().history.present.primitives[0]?.color).toBe('#ffd166');
  });

  it('recolors a selected stroke and records history', () => {
    const stroke = createStrokeFixture('stroke-1', '#ef476f');
    const history = createHistoryState({
      ...buildInitialSnapshot(),
      strokes: [stroke],
      selectionId: stroke.id,
    });

    useSceneStore.setState({ history });
    useSceneStore.getState().setColor('#8e6ad8');

    const nextHistory = useSceneStore.getState().history;
    expect(nextHistory.present.strokes[0]?.color).toBe('#8e6ad8');
    expect(nextHistory.past).toHaveLength(1);

    useSceneStore.getState().undo();
    expect(useSceneStore.getState().history.present.strokes[0]?.color).toBe('#ef476f');
  });

  it('deletes a selected primitive and supports undo and redo', () => {
    const primitive = createPrimitiveFixture('primitive-3');
    const history = createHistoryState({
      ...buildInitialSnapshot(),
      primitives: [primitive],
      selectionId: primitive.id,
    });

    useSceneStore.setState({ history });
    useSceneStore.getState().deleteSelected();

    expect(useSceneStore.getState().history.present.primitives).toHaveLength(0);

    useSceneStore.getState().undo();
    expect(useSceneStore.getState().history.present.primitives).toHaveLength(1);

    useSceneStore.getState().redo();
    expect(useSceneStore.getState().history.present.primitives).toHaveLength(0);
  });
});

describe('scene constants', () => {
  it('exports the expected crayon colors and tool labels', () => {
    expect(CRAYON_COLORS).toHaveLength(12);
    expect(CRAYON_COLORS[0]).toEqual({ name: 'Red', value: '#ef476f' });
    expect(TOOL_OPTIONS.find((tool) => tool.value === 'transform')?.label).toBe('Move');
    expect(TRANSFORM_MODES.map((mode) => mode.label)).toEqual(['translate', 'rotate', 'scale']);
  });
});
