import type { LexicalEditor } from 'lexical';
import { $getRoot, $isElementNode } from 'lexical';

const MAX_ROOT_LOOKUP_ATTEMPTS = 30;

interface ScheduleGridCellAutoFocusOptions {
  cancelFrame?: Window['cancelAnimationFrame'];
  cellEditors: LexicalEditor[];
  clearAutoFocusIntent: () => void;
  maxRootLookupAttempts?: number;
  requestFrame?: Window['requestAnimationFrame'];
}

function selectNestedRootStart(): void {
  const firstChild = $getRoot().getFirstChild();
  if ($isElementNode(firstChild)) {
    firstChild.selectStart();
  } else {
    $getRoot().selectStart();
  }
}

export function scheduleGridCellAutoFocus({
  cellEditors,
  clearAutoFocusIntent,
  requestFrame = window.requestAnimationFrame.bind(window),
  cancelFrame = window.cancelAnimationFrame.bind(window),
  maxRootLookupAttempts = MAX_ROOT_LOOKUP_ATTEMPTS,
}: ScheduleGridCellAutoFocusOptions): () => void {
  let cancelled = false;
  let frame: number | null = null;

  const schedule = (attempt: number) => {
    frame = requestFrame(() => {
      frame = null;
      if (cancelled) return;

      const firstCellEditor = cellEditors[0];
      if (!firstCellEditor) {
        clearAutoFocusIntent();
        return;
      }

      if (!firstCellEditor.getRootElement() && attempt < maxRootLookupAttempts) {
        schedule(attempt + 1);
        return;
      }

      clearAutoFocusIntent();
      firstCellEditor.update(selectNestedRootStart, { discrete: true });
      firstCellEditor.focus();
    });
  };

  schedule(0);

  return () => {
    cancelled = true;
    if (frame !== null) {
      cancelFrame(frame);
    }
  };
}
