import { createDynamicModule } from './module-config';
import { dynamicNodes } from './node';
import { ComposedDynamicStaticRenderer } from './renderer';

export const dynamicModule = createDynamicModule({
  nodes: dynamicNodes,
  renderers: { Dynamic: ComposedDynamicStaticRenderer },
});
