import { createExcalidrawModule } from './module-config';
import { excalidrawNodes } from './node';
import { ComposedExcalidrawStaticRenderer } from './renderer';

export const excalidrawModule = createExcalidrawModule({
  nodes: excalidrawNodes,
  renderers: { Excalidraw: ComposedExcalidrawStaticRenderer },
});
