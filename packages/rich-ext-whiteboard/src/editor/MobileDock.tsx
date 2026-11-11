import type { FC } from 'react';

import * as css from './chrome.css';
import type { WhiteboardStore } from './store';
import { WhiteboardToolbar } from './Toolbar';

export const MobileDock: FC<{ store: WhiteboardStore }> = ({ store }) => (
  <div data-mobile-dock data-whiteboard-chrome className={`${css.floating} ${css.dock}`}>
    <WhiteboardToolbar showKeys={false} store={store} />
  </div>
);
