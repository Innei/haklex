import {
  type ExcalidrawSlotProps,
  ExcalidrawSSRRenderer,
} from '@haklex/rich-ext-excalidraw/static';
import type { ComponentType } from 'react';

import { useExcalidrawModuleConfig } from './module-config';

export const ComposedExcalidrawStaticRenderer: ComponentType<ExcalidrawSlotProps> = ({
  snapshot,
}) => {
  const { onExpand } = useExcalidrawModuleConfig();
  return <ExcalidrawSSRRenderer snapshot={snapshot} onExpand={onExpand} />;
};
