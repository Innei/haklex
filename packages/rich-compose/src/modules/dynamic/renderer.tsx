import { type DynamicSlotProps, DynamicSSRRenderer } from '@haklex/rich-ext-dynamic/static';
import type { ComponentType } from 'react';

import { useDynamicModuleConfig } from './module-config';

export const ComposedDynamicStaticRenderer: ComponentType<DynamicSlotProps> = (props) => {
  const { validateUrl } = useDynamicModuleConfig();
  return <DynamicSSRRenderer {...props} validateUrl={validateUrl} />;
};
