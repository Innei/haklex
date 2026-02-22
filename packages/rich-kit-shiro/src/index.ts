export type { ShiroEditorProps } from './ShiroEditor'
export { ShiroEditor } from './ShiroEditor'
export type { ShiroRendererProps } from './ShiroRenderer'
export { ShiroRenderer } from './ShiroRenderer'

// Re-export from @haklex/rich-editor
export type {
  ColorScheme,
  RendererConfig,
  RichEditorVariant,
} from '@haklex/rich-editor'
export type {
  FootnoteDefinitionsContextValue,
  RendererMode,
  RichEditorProps,
  RichRendererProps,
  SlashMenuItemConfig,
} from '@haklex/rich-editor'
export {
  allEditNodes,
  allNodes,
  builtinNodes,
  ColorSchemeProvider,
  createRendererDecoration,
  customEditNodes,
  customNodes,
  getResolvedEditNodes,
  getVariantClass,
  NESTED_EDITOR_NODES,
  RichEditor,
  RichRenderer,
  setResolvedEditNodes,
  useColorScheme,
  useRendererConfig,
  useRendererMode,
} from '@haklex/rich-editor'
export {
  FootnoteDefinitionsProvider,
  useFootnoteContent,
  useFootnoteDefinitions,
  useFootnoteDisplayNumber,
} from '@haklex/rich-editor'

// Re-export from @haklex/rich-ext-tldraw
export type {
  SerializedTldrawNode,
  TldrawConfig,
  TldrawEditRendererProps,
  TldrawRendererProps,
  TldrawStaticRendererProps,
} from '@haklex/rich-ext-tldraw'
export {
  $createTldrawNode,
  $isTldrawNode,
  INSERT_TLDRAW_COMMAND,
  TldrawConfigProvider,
  TldrawEditRenderer,
  TldrawNode,
  TldrawPlugin,
  TldrawRenderer,
  TldrawStaticRenderer,
  useTldrawConfig,
} from '@haklex/rich-ext-tldraw'

// Re-export from @haklex/rich-plugin-block-handle
export { BlockHandlePlugin } from '@haklex/rich-plugin-block-handle'

// Re-export from @haklex/rich-plugin-floating-toolbar
export { FloatingToolbarPlugin } from '@haklex/rich-plugin-floating-toolbar'

// Re-export from @haklex/rich-plugin-link-edit
export {
  FloatingLinkEditorPlugin,
  type FloatingLinkEditorPluginProps,
} from '@haklex/rich-plugin-link-edit'

// Re-export from @haklex/rich-plugin-slash-menu
export type { SlashMenuPluginProps } from '@haklex/rich-plugin-slash-menu'
export {
  collectNodeSlashItems,
  getBuiltinItems,
  SlashMenuItem,
  SlashMenuList,
  SlashMenuPlugin,
} from '@haklex/rich-plugin-slash-menu'

// Re-export from @haklex/rich-plugin-table
export {
  TableCellResizerPlugin,
  TableRowColumnHandlesPlugin,
} from '@haklex/rich-plugin-table'

// Re-export from @haklex/rich-renderers
export type {
  EmbedLinkRendererProps,
  EmbedRendererComponent,
  EmbedRendererMap,
  EmbedStaticRendererProps,
  EmbedType,
  EnhancedLinkCardProps,
  GalleryNodePayload,
  LinkCardData,
  LinkCardPlugin,
  LinkCardTypeClass,
  PluginRegistry,
  SerializedCodeSnippetNode,
  SerializedEmbedNode,
  SerializedGalleryNode,
  UrlMatchInfo,
  UrlMatchResult,
} from '@haklex/rich-renderers'
export { enhancedRendererConfig } from '@haklex/rich-renderers'
export {
  $createCodeSnippetNode,
  $createGalleryNode,
  $isCodeSnippetNode,
  $isGalleryNode,
  AlertRenderer,
  arxivPlugin,
  bangumiPlugin,
  BannerRenderer,
  camelcaseKeys,
  CodeBlockRenderer,
  CodeSnippetNode,
  codeSnippetNodes,
  CodeSnippetRenderer,
  createMxSpacePlugin,
  createSelfThinkingMatcher,
  EmbedLinkRenderer,
  EmbedNode,
  embedNodes,
  EmbedRendererProvider,
  EmbedStaticRenderer,
  fetchGitHubApi,
  GalleryNode,
  galleryNodes,
  GalleryRenderer,
  generateColor,
  getPluginByName,
  githubCommitPlugin,
  githubDiscussionPlugin,
  githubIssuePlugin,
  githubPrPlugin,
  githubRepoPlugin,
  ImageRenderer,
  isBilibiliVideoUrl,
  isCodesandboxUrl,
  isGistUrl,
  isGithubFilePreviewUrl,
  isTweetUrl,
  isYoutubeUrl,
  LanguageToColorMap,
  leetcodePlugin,
  LinkCardRenderer,
  LinkCardSkeleton,
  matchEmbedUrl,
  MentionRenderer,
  MermaidRenderer,
  mxSpacePlugin,
  neteaseMusicPlugin,
  pluginMap,
  plugins,
  qqMusicPlugin,
  tmdbPlugin,
  useEmbedRenderers,
  useUrlMatcher,
  VideoRenderer,
} from '@haklex/rich-renderers'

// Re-export from @haklex/rich-renderers-edit
export type {
  CodeSnippetEditRendererProps,
  EmbedPluginProps,
} from '@haklex/rich-renderers-edit'
export { enhancedEditRendererConfig } from '@haklex/rich-renderers-edit'
export {
  $createCodeSnippetEditNode,
  $createEmbedEditNode,
  $isCodeSnippetEditNode,
  $isEmbedEditNode,
  AlertEditRenderer,
  BannerEditRenderer,
  CodeBlockEditRenderer,
  CodeSnippetEditNode,
  codeSnippetEditNodes,
  CodeSnippetEditRenderer,
  EmbedEditNode,
  embedEditNodes,
  EmbedPlugin,
  ImageEditRenderer,
  INSERT_EMBED_COMMAND,
  KaTeXBlockEditNode,
  katexEditNodes,
  KaTeXInlineEditNode,
  LinkCardEditNode,
  linkCardEditNodes,
  MentionEditRenderer,
  MermaidEditRenderer,
  VideoEditRenderer,
} from '@haklex/rich-renderers-edit'

// Markdown transformers
export {
  buildShiroMarkdownTransformers,
  SHIRO_EXT_MARKDOWN_TRANSFORMERS,
  SHIRO_MARKDOWN_TRANSFORMERS,
} from './markdown'
