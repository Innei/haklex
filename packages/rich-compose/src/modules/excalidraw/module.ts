import type { RichRendererModule } from '../../core/types';
import { excalidrawNodes } from './node';

export const excalidrawModule: RichRendererModule = {
  name: 'excalidraw',
  nodes: excalidrawNodes,
};
