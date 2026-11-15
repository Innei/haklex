import type { FC } from 'react';

import * as css from './chrome.css';
import type { WhiteboardStore } from './store';
import { WhiteboardToolbar } from './Toolbar';
import type { ToolType } from './types';

export const MobileDock: FC<{ store: WhiteboardStore; tools?: ReadonlySet<ToolType> }> = ({
  store,
  tools,
}) => (
  <div data-mobile-dock data-whiteboard-chrome className={`${css.floating} ${css.dock}`}>
    <WhiteboardToolbar showKeys={false} store={store} tools={tools} />
  </div>
);
