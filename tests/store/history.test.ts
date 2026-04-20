import { describe, expect, it } from 'vitest';
import { createHistoryState, pushHistory, redoHistory, undoHistory } from '../../src/store/history';

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
