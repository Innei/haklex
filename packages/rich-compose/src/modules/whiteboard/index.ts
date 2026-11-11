export { whiteboardModule } from './module';
export { $createWhiteboardNode, $isWhiteboardNode, WhiteboardNode, whiteboardNodes } from './node';
export { ComposedWhiteboardStaticRenderer } from './renderer';
export type { OnWhiteboardExpand, WhiteboardExpandPayload, WhiteboardModuleConfig } from './types';
export type { SerializedWhiteboardNode } from '@haklex/rich-ext-whiteboard/static';
export {
  useWhiteboardConfig,
  WhiteboardConfigProvider,
  WhiteboardDisplayRenderer,
} from '@haklex/rich-ext-whiteboard/static';
