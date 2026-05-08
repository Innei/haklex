import type { RichRendererModule } from '../../core/types';
import { nestedDocNodes } from './node';

/**
 * Nested-doc module — registers `NestedDocNode`. There is no
 * `NestedDoc` slot in `RendererConfig`; the Klass's `decorate()` consumes
 * the `NestedContentRendererProvider` (composeRenderer always wires this
 * to a recursive closure) so nested editor states render through the
 * same composition.
 */
export const nestedDocModule: RichRendererModule = {
  name: 'nested-doc',
  nodes: nestedDocNodes,
};
