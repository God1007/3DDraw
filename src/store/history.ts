export interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

function cloneSnapshot<T>(value: T): T {
  return structuredClone(value);
}

export function createHistoryState<T>(present: T): HistoryState<T> {
  return {
    past: [],
    present: cloneSnapshot(present),
    future: [],
  };
}

export function pushHistory<T>(history: HistoryState<T>, next: T): HistoryState<T> {
  return {
    past: [...history.past, cloneSnapshot(history.present)],
    present: cloneSnapshot(next),
    future: [],
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
  };
}
