import { WhiteboardEditNode, WhiteboardPlugin } from '@haklex/rich-ext-whiteboard';
import type { Klass, LexicalNode } from 'lexical';

import type { RichEditorModule } from '../../core/types';
import { whiteboardModule } from './module';

const whiteboardEditNodes: Array<Klass<LexicalNode>> = [WhiteboardEditNode];

export const whiteboardEditModule: RichEditorModule = {
  ...whiteboardModule,
  editNodes: whiteboardEditNodes,
  surfacePlugins: <WhiteboardPlugin />,
};
