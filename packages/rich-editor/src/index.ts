export { CorePlugins } from './components/CorePlugins';
export type { LinkFaviconProps } from './components/LinkFavicon';
export { LinkFavicon } from './components/LinkFavicon';
export { RichEditor } from './components/RichEditor';
export type { RichEditorShellProps } from './components/RichEditorShell';
export { RichEditorShell } from './components/RichEditorShell';
export { getVariantClass } from './components/utils';
export type { ColorScheme } from './context/ColorSchemeContext';
export { ColorSchemeProvider, useColorScheme } from './context/ColorSchemeContext';
export { ExtraNodesProvider, useExtraNodes } from './context/ExtraNodesContext';
export type { FootnoteDefinitionsContextValue } from './context/FootnoteDefinitionsContext';
export {
  FootnoteDefinitionsProvider,
  useFootnoteContent,
  useFootnoteDefinitions,
  useFootnoteDisplayNumber,
} from './context/FootnoteDefinitionsContext';
export type { RenderEditorStateFn } from './context/NestedContentRendererContext';
export {
  NestedContentRendererProvider,
  useNestedContentRenderer,
  useOptionalNestedContentRenderer,
} from './context/NestedContentRendererContext';
export type { PresentDialogFn, PresentDialogProps } from './context/PresentDialogContext';
export { PresentDialogProvider, usePresentDialog } from './context/PresentDialogContext';
export type { RendererMode } from './context/RendererConfigContext';
export {
  RendererConfigProvider,
  useRendererConfig,
  useRendererMode,
  useVariant,
} from './context/RendererConfigContext';
export type { TextSelectionStore, TextSelectionStoreState } from './context/TextSelectionContext';
export {
  createTextSelectionStore,
  TextSelectionStoreProvider,
  useTextSelectionSnapshot,
  useTextSelectionStore,
} from './context/TextSelectionContext';
export { blockIdState } from './plugins/BlockIdPlugin';
export * from './styles';
export type { RichEditorProps, RichEditorVariant } from './types';
export type { RendererConfig } from './types/renderer-config';
export {
  ALERT_NODE_KEY,
  BANNER_NODE_KEY,
  CODE_BLOCK_NODE_KEY,
  FOOTNOTE_NODE_KEY,
  FOOTNOTE_SECTION_NODE_KEY,
  IMAGE_NODE_KEY,
  KATEX_NODE_KEY,
  LINK_CARD_NODE_KEY,
  MENTION_NODE_KEY,
  MERMAID_NODE_KEY,
  RUBY_NODE_KEY,
  TAG_NODE_KEY,
  VIDEO_NODE_KEY,
} from './types/renderer-keys';
export type {
  AnchorError,
  AnchorResult,
  BlockAnchor,
  CommentAnchor,
  RangeAnchor,
} from './utils/comment-anchor';
export {
  $getRootBlock,
  $getTextOffsetInBlock,
  $resolveSelectionPoint,
  buildBlockAnchor,
  buildRangeAnchor,
} from './utils/comment-anchor';
export type { DOMSelectionTarget, TextSelectionSnapshot } from './utils/text-selection';
export {
  $captureTextSelection,
  $captureTextSelectionFromRangeSelection,
  $restoreTextSelection,
  createDOMRangeFromTextSelection,
  findDOMPointByTextOffset,
  getBlockElementById,
  getDOMRectFromTextSelection,
  getTextOffsetFromDOMPoint,
} from './utils/text-selection';
export { TEXT_SELECTION_HIGHLIGHT_NAME } from './utils/text-selection-constants';
