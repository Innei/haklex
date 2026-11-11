import type { Doc } from './types';

export const HISTORY_LIMIT = 100;

export interface History {
  canRedo: () => boolean;
  canUndo: () => boolean;
  clear: () => void;
  push: (entry: Doc) => void;
  redo: (current: Doc) => Doc | null;
  rewrite: (fn: (doc: Doc) => Doc) => void;
  undo: (current: Doc) => Doc | null;
}

export function createHistory(limit = HISTORY_LIMIT): History {
  let undoStack: Doc[] = [];
  let redoStack: Doc[] = [];
  return {
    push(entry) {
      undoStack.push(entry);
      if (undoStack.length > limit) undoStack = undoStack.slice(-limit);
      redoStack = [];
    },
    undo(current) {
      const entry = undoStack.pop();
      if (!entry) return null;
      redoStack.push(current);
      return entry;
    },
    redo(current) {
      const entry = redoStack.pop();
      if (!entry) return null;
      undoStack.push(current);
      return entry;
    },
    rewrite(fn) {
      undoStack = undoStack.map(fn);
      redoStack = redoStack.map(fn);
    },
    canUndo: () => undoStack.length > 0,
    canRedo: () => redoStack.length > 0,
    clear() {
      undoStack = [];
      redoStack = [];
    },
  };
}
