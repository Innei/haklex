import { createNestedDocModule } from './module-config';
import { nestedDocNodes } from './node';
import { ComposedNestedDocStaticRenderer } from './renderer';

export const NESTED_DOC_MODULE_NAME = 'nested-doc' as const;

export const nestedDocModule = createNestedDocModule({
  nodes: nestedDocNodes,
  renderers: { NestedDoc: ComposedNestedDocStaticRenderer },
});
