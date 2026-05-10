// Re-export from @haklex/rich-editor
export type {
  ColorScheme,
  FootnoteDefinitionsContextValue,
  LinkFaviconProps,
  PresentDialogFn,
  PresentDialogProps,
  RendererConfig,
  RendererMode,
  RichEditorProps,
  RichEditorVariant,
} from '@haklex/rich-editor';
export {
  ColorSchemeProvider,
  getVariantClass,
  LinkFavicon,
  PresentDialogProvider,
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

// Re-export from @haklex/rich-ext-poll
export type {
  PollDataAdapter,
  PollDataProviderProps,
  PollMetadata,
  PollMode,
  PollOption,
  PollRendererProps,
  PollShowResults,
  PollState,
} from '@haklex/rich-ext-poll';
export {
  extractPolls,
  PollDataProvider,
  useInitialPollState,
  usePollDataAdapter,
} from '@haklex/rich-ext-poll';

// Re-export from @haklex/rich-editor/commands
export type { SlashMenuItemConfig } from '@haklex/rich-editor/commands';

// Re-export from @haklex/rich-editor/renderers
export { createRendererDecoration } from '@haklex/rich-editor/renderers';
