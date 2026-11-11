import type { FC } from 'react';

import * as css from './chrome.css';
import type { WhiteboardStore } from './store';
import { useStyleRows } from './style-rows';

export const StylePanel: FC<{ store: WhiteboardStore }> = ({ store }) => {
  const rows = useStyleRows(store);
  if (!rows) return null;
  return (
    <div data-style-panel data-whiteboard-chrome className={`${css.floating} ${css.panel}`}>
      {rows}
    </div>
  );
};
