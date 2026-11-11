import {
  type WhiteboardSlotProps,
  WhiteboardSSRRenderer,
} from '@haklex/rich-ext-whiteboard/static';
import type { ComponentType } from 'react';

import { useWhiteboardModuleConfig } from './module-config';

export const ComposedWhiteboardStaticRenderer: ComponentType<WhiteboardSlotProps> = ({
  snapshot,
}) => {
  const { onExpand } = useWhiteboardModuleConfig();
  return <WhiteboardSSRRenderer snapshot={snapshot} onExpand={onExpand} />;
};
