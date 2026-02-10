export { RichEditor } from './components/RichEditor'
export { RichRenderer } from './components/RichRenderer'
export { allNodes, builtinNodes, customNodes } from './config'
export type { ColorScheme } from './context/ColorSchemeContext'
export { useColorScheme } from './context/ColorSchemeContext'
export * from './styles'
export type {
  RichEditorProps,
  RichEditorVariant,
  RichRendererProps,
} from './types'
export type { RendererConfig } from './types/renderer-config'

// Re-export nodes for external use
export type { SerializedMermaidNode } from './nodes/MermaidNode'
export {
  $createMermaidNode,
  $isMermaidNode,
  MermaidNode,
} from './nodes/MermaidNode'

// Re-export plugin commands
export { INSERT_ALERT_COMMAND } from './plugins/AlertPlugin'
export { INSERT_IMAGE_COMMAND } from './plugins/ImagePlugin'
export {
  INSERT_KATEX_BLOCK_COMMAND,
  INSERT_KATEX_INLINE_COMMAND,
} from './plugins/KaTeXPlugin'
export { INSERT_MERMAID_COMMAND } from './plugins/MermaidPlugin'

// Re-export renderer prop types for convenience when creating custom renderers
export type { CodeBlockRendererProps } from './components/renderers/CodeBlockRenderer'
export type { FootnoteRendererProps } from './components/renderers/FootnoteRenderer'
export type { GalleryRendererProps } from './components/renderers/GalleryRenderer'
export type { ImageRendererProps } from './components/renderers/ImageRenderer'
export type { KaTeXRendererProps } from './components/renderers/KaTeXRenderer'
export type { LinkCardRendererProps } from './components/renderers/LinkCardRenderer'
export type { MentionRendererProps } from './components/renderers/MentionRenderer'
export type { MermaidRendererProps } from './components/renderers/MermaidRenderer'
export type { TabsRendererProps } from './components/renderers/TabsRenderer'
export type { VideoRendererProps } from './components/renderers/VideoRenderer'
