import { ExcalidrawEditNode, ExcalidrawPlugin } from '@haklex/rich-ext-excalidraw';
import type { Klass, LexicalNode } from 'lexical';

import type { RichEditorModule } from '../../core/types';
import { excalidrawModule } from './module';

const excalidrawEditNodes: Array<Klass<LexicalNode>> = [ExcalidrawEditNode];

export const excalidrawEditModule: RichEditorModule = {
  ...excalidrawModule,
  editNodes: excalidrawEditNodes,
  plugins: <ExcalidrawPlugin />,
};
