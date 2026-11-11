export type { WhiteboardSlotProps } from './slot';
export { WHITEBOARD_NODE_KEY } from './slot';
export { whiteboardFullscreenPopup } from './styles.css';
export { EXCALIDRAW_BLOCK_TRANSFORMER } from './transformer';
export type { WhiteboardConfig } from './WhiteboardConfigContext';
export { useWhiteboardConfig, WhiteboardConfigProvider } from './WhiteboardConfigContext';
export type {
  OnWhiteboardExpand,
  WhiteboardExpandPayload,
  WhiteboardStaticRendererProps,
} from './WhiteboardDisplayRenderer';
export { WhiteboardDisplayRenderer } from './WhiteboardDisplayRenderer';
export type { WhiteboardExpandShellProps } from './WhiteboardExpandShell';
export { WhiteboardExpandShell } from './WhiteboardExpandShell';
export type { SerializedWhiteboardNode } from './WhiteboardNode';
export { $createWhiteboardNode, $isWhiteboardNode, WhiteboardNode } from './WhiteboardNode';
export type { WhiteboardSSRRendererProps } from './WhiteboardSSRRenderer';
export { WhiteboardSSRRenderer } from './WhiteboardSSRRenderer';

// Backward compat aliases
export type { WhiteboardStaticRendererProps as WhiteboardRendererProps } from './WhiteboardDisplayRenderer';
export { WhiteboardDisplayRenderer as WhiteboardStaticRenderer } from './WhiteboardDisplayRenderer';
export { WhiteboardDisplayRenderer as WhiteboardRenderer } from './WhiteboardDisplayRenderer';
