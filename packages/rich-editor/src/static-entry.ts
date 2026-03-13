// Static entry point for SSR engine - includes editorTheme (has Lexical types)
export { LinkFavicon } from './components/LinkFavicon';
export type { RubyRendererProps } from './components/renderers/RubyRenderer';
export { RubyRenderer } from './components/renderers/RubyRenderer';
export type { TagRendererProps } from './components/renderers/TagRenderer';
export { getTagBgColor, TagRenderer } from './components/renderers/TagRenderer';
export type { RendererKey } from './components/RendererWrapper';
export { createRendererDecoration, RendererWrapper } from './components/RendererWrapper';
export { getVariantClass } from './components/utils';
export { allNodes, builtinNodes, customNodes } from './config';
export type { ColorScheme } from './context/ColorSchemeContext';
export { ColorSchemeProvider, useColorScheme } from './context/ColorSchemeContext';
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
export { articleVariant } from './styles/article.css';
export { commentVariant } from './styles/comment.css';
export { detailsClassNames, detailsStyles } from './styles/details.css';
export { gridClassNames, gridStyles } from './styles/grid.css';
export { katexClassNames, katexStyles } from './styles/katex.css';
export { noteVariant } from './styles/note.css';
export {
  richContent,
  semanticClassNames,
  type SharedStyleKey,
  sharedStyles,
} from './styles/shared.css';
export { editorTheme } from './styles/theme';
export type { RichEditorVariant } from './types';
export type { RendererConfig } from './types/renderer-config';
export { extractTextContent } from './utils/extractTextContent';
export { articleTheme, commentTheme, noteTheme, vars } from '@haklex/rich-style-token/styles';
