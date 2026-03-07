import type { Klass, LexicalNode } from 'lexical'

import { EmbedNode } from './nodes/EmbedNode'

export type { SerializedEmbedNode } from './nodes/EmbedNode'
export { $createEmbedNode, $isEmbedNode, EmbedNode } from './nodes/EmbedNode'

export const embedNodes: Array<Klass<LexicalNode>> = [EmbedNode]

export type {
  EmbedRendererComponent,
  EmbedRendererMap,
} from './context/EmbedRendererContext'
export {
  EmbedRendererProvider,
  useEmbedRenderers,
} from './context/EmbedRendererContext'
export type { EmbedLinkRendererProps } from './renderers/EmbedLinkRenderer'
export { EmbedLinkRenderer } from './renderers/EmbedLinkRenderer'
export type { EmbedStaticRendererProps } from './renderers/EmbedStaticRenderer'
export { EmbedStaticRenderer } from './renderers/EmbedStaticRenderer'
export type { EmbedType } from './url-matchers'
export {
  createSelfThinkingMatcher,
  isBilibiliVideoUrl,
  isCodesandboxUrl,
  isGistUrl,
  isGithubFilePreviewUrl,
  isTweetUrl,
  isYoutubeUrl,
  matchEmbedUrl,
} from './url-matchers'
