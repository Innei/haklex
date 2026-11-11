import { createWhiteboardModule } from './module-config';
import { whiteboardNodes } from './node';
import { ComposedWhiteboardStaticRenderer } from './renderer';

export const whiteboardModule = createWhiteboardModule({
  nodes: whiteboardNodes,
  renderers: { Whiteboard: ComposedWhiteboardStaticRenderer },
});
