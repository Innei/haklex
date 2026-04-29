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
export type { PollDataProviderProps } from './context/PollDataContext';
export {
  PollDataProvider,
  useInitialPollState,
  usePollDataAdapter,
} from './context/PollDataContext';
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
export type {
  PollDataAdapter,
  PollMetadata,
  PollMode,
  PollOption,
  PollRendererProps,
  PollShowResults,
  PollState,
} from './types/poll';
export type { RendererConfig } from './types/renderer-config';
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
export { extractPolls } from './utils/extractPolls';
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
