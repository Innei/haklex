// Re-export from @haklex/rich-editor
export type {
  ColorScheme,
  FootnoteDefinitionsContextValue,
  LinkFaviconProps,
  RendererConfig,
  RendererMode,
  RichEditorProps,
  RichEditorVariant,
} from '@haklex/rich-editor';
export {
  ColorSchemeProvider,
  getVariantClass,
  LinkFavicon,
  RichEditor,
  useColorScheme,
  useRendererConfig,
  useRendererMode,
} from '@haklex/rich-editor';
export {
  FootnoteDefinitionsProvider,
  useFootnoteContent,
  useFootnoteDefinitions,
  useFootnoteDisplayNumber,
} from '@haklex/rich-editor';

// Re-export from @haklex/rich-editor/commands
export type { SlashMenuItemConfig } from '@haklex/rich-editor/commands';

// Re-export from @haklex/rich-editor/renderers
export { createRendererDecoration } from '@haklex/rich-editor/renderers';
