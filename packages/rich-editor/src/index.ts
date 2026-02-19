export { RichEditor } from './components/RichEditor'
export { RichRenderer } from './components/RichRenderer'
export { allNodes, builtinNodes, customNodes } from './config'
export { allEditNodes, customEditNodes } from './config-edit'
export type { ColorScheme } from './context/ColorSchemeContext'
export {
  ColorSchemeProvider,
  useColorScheme,
} from './context/ColorSchemeContext'
export type { FootnoteDefinitionsContextValue } from './context/FootnoteDefinitionsContext'
export {
  FootnoteDefinitionsProvider,
  useFootnoteContent,
  useFootnoteDefinitions,
  useFootnoteDisplayNumber,
} from './context/FootnoteDefinitionsContext'
export type { RendererMode } from './context/RendererConfigContext'
export { useRendererMode } from './context/RendererConfigContext'
export * from './styles'
export type {
  RichEditorProps,
  RichEditorVariant,
  RichRendererProps,
} from './types'
export type { RendererConfig } from './types/renderer-config'
export type { SlashMenuItemConfig } from './types/slash-menu'

// Re-export renderer utilities for external renderer packages
export { createRendererDecoration } from './components/RendererWrapper'
export { getVariantClass } from './components/utils'
export { useRendererConfig } from './context/RendererConfigContext'

// Re-export nested editor utilities for external extension packages
export { getResolvedEditNodes, setResolvedEditNodes } from './node-registry'
export { NESTED_EDITOR_NODES } from './nodes/shared'

// Re-export nodes for external use
export type { SerializedMermaidNode } from './nodes/MermaidNode'
export {
  $createMermaidNode,
  $isMermaidNode,
  MermaidNode,
} from './nodes/MermaidNode'

// Re-export alert node utilities
export type { AlertType } from './nodes/AlertQuoteNode'
export { ALERT_LABELS, ALERT_TYPES } from './nodes/AlertQuoteNode'

// Re-export plugin commands
export { INSERT_ALERT_COMMAND } from './plugins/AlertPlugin'
export { FootnotePlugin } from './plugins/FootnotePlugin'
export { INSERT_IMAGE_COMMAND } from './plugins/ImagePlugin'
export {
  INSERT_KATEX_BLOCK_COMMAND,
  INSERT_KATEX_INLINE_COMMAND,
} from './plugins/KaTeXPlugin'
export { INSERT_MERMAID_COMMAND } from './plugins/MermaidPlugin'

// Re-export banner node utilities
export type { BannerType } from './nodes/BannerNode'
export { BANNER_LABELS, BANNER_TYPES } from './nodes/BannerNode'

// Re-export grid container node
export type { SerializedGridContainerNode } from './nodes/GridContainerNode'
export {
  $createGridContainerNode,
  $isGridContainerNode,
  GridContainerNode,
} from './nodes/GridContainerNode'

// Re-export footnote section node
export { FootnoteSectionEditNode } from './nodes/FootnoteSectionEditNode'
export type { SerializedFootnoteSectionNode } from './nodes/FootnoteSectionNode'
export {
  $createFootnoteSectionNode,
  $isFootnoteSectionNode,
  FootnoteSectionNode,
} from './nodes/FootnoteSectionNode'

// Re-export renderer prop types for convenience when creating custom renderers
export type { AlertRendererProps } from './components/renderers/AlertRenderer'
export type { BannerRendererProps } from './components/renderers/BannerRenderer'
export type { CodeBlockRendererProps } from './components/renderers/CodeBlockRenderer'
export type { FootnoteRendererProps } from './components/renderers/FootnoteRenderer'
export type { FootnoteSectionRendererProps } from './components/renderers/FootnoteSectionRenderer'
export type { ImageRendererProps } from './components/renderers/ImageRenderer'
export type { KaTeXRendererProps } from './components/renderers/KaTeXRenderer'
export type { LinkCardRendererProps } from './components/renderers/LinkCardRenderer'
export type { MentionRendererProps } from './components/renderers/MentionRenderer'
export type { MermaidRendererProps } from './components/renderers/MermaidRenderer'
export type { VideoRendererProps } from './components/renderers/VideoRenderer'
export type { GalleryRendererProps } from './types/renderer-config'
export type { GalleryImage } from './types/renderer-config'
export type {
  CodeFile,
  CodeSnippetRendererProps,
} from './types/renderer-config'

// Re-export LinkCard node for external edit node packages
export { LinkCardRenderer } from './components/renderers/LinkCardRenderer'
export type {
  LinkCardNodePayload,
  SerializedLinkCardNode,
} from './nodes/LinkCardNode'
export {
  $createLinkCardNode,
  $isLinkCardNode,
  LinkCardNode,
} from './nodes/LinkCardNode'

// Re-export KaTeX nodes for external edit node packages
export { KaTeXRenderer } from './components/renderers/KaTeXRenderer'
export type { SerializedKaTeXBlockNode } from './nodes/KaTeXBlockNode'
export { $isKaTeXBlockNode, KaTeXBlockNode } from './nodes/KaTeXBlockNode'
export type { SerializedKaTeXInlineNode } from './nodes/KaTeXInlineNode'
export { $isKaTeXInlineNode, KaTeXInlineNode } from './nodes/KaTeXInlineNode'

// Re-export thumbhash utilities
export { computeImageMeta, decodeThumbHash } from './utils/thumbhash'
