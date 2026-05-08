import type { RichRendererModule } from '../../core/types';
import { excalidrawNodes } from './node';

/**
 * Excalidraw module — registers `ExcalidrawNode`. There is no
 * `Excalidraw` slot in `RendererConfig`; the Klass's `decorate()` handles
 * its own rendering (and the upstream renderer code-splits internally).
 *
 * Consumers wrapping `ExcalidrawConfigProvider` or replacing the display
 * renderer do so via upstream APIs (`@haklex/rich-ext-excalidraw/static`)
 * rather than through `composeRenderer`.
 */
export const excalidrawModule: RichRendererModule = {
  name: 'excalidraw',
  nodes: excalidrawNodes,
};
