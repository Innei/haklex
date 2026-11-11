import type { FC } from 'react';
import { useState } from 'react';

import * as css from './chrome.css';
import type { WhiteboardStore } from './store';
import { useStore } from './store';
import { useStyleRows } from './style-rows';

export const SHEET_ROWS = 4;

export const StyleSheet: FC<{ store: WhiteboardStore }> = ({ store }) => {
  const rows = useStyleRows(store);
  const hasSelection = useStore(store, (s) => s.selectedIds.size > 0);
  const [expanded, setExpanded] = useState(false);
  if (!rows || !hasSelection) return null;
  const visible = expanded ? rows : rows.slice(0, SHEET_ROWS);
  return (
    <div data-style-sheet data-whiteboard-chrome className={css.sheet}>
      <div className={css.grabber} />
      {visible}
      {rows.length > SHEET_ROWS && (
        <button
          data-style-more
          className={css.sheetMore}
          type="button"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? 'Fewer options' : 'More styles and actions'}
        </button>
      )}
    </div>
  );
};
