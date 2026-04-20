export interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
  committed: T;
}

function cloneSnapshot<T>(value: T): T {
  return structuredClone(value);
}

export function createHistoryState<T>(present: T): HistoryState<T> {
  const snapshot = cloneSnapshot(present);
  return {
    past: [],
    present: snapshot,
    future: [],
    committed: cloneSnapshot(present),
  };
}

export function pushHistory<T>(history: HistoryState<any>, next: T): HistoryState<T> {
  const committed = (history as HistoryState<T> & { committed?: T }).committed ?? history.present;
  return {
    past: [...history.past, cloneSnapshot(committed)],
    present: cloneSnapshot(next),
    future: [],
    committed: cloneSnapshot(next),
  };
}

export function undoHistory<T>(history: HistoryState<T>): HistoryState<T> {
  if (history.past.length === 0) {
    return history;
  }

  const previous = history.past[history.past.length - 1];
  return {
    past: history.past.slice(0, -1),
    present: cloneSnapshot(previous),
    future: [cloneSnapshot(history.present), ...history.future],
    committed: cloneSnapshot(previous),
  };
}

export function redoHistory<T>(history: HistoryState<T>): HistoryState<T> {
  if (history.future.length === 0) {
    return history;
  }

  const [next, ...future] = history.future;
  return {
    past: [...history.past, cloneSnapshot(history.present)],
    present: cloneSnapshot(next),
    future,
    committed: cloneSnapshot(next),
  };
}
