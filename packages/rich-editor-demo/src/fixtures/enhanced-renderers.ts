/**
 * Enhanced renderer configuration for demo
 */
// Import styles
import '@shiro/rich-renderer-linkcard/style.css'
import '@shiro/rich-renderer-gallery/style.css'

import type { RendererConfig } from '@shiro/rich-editor'
import { GalleryRenderer } from '@shiro/rich-renderer-gallery'
import { LinkCardRenderer } from '@shiro/rich-renderer-linkcard'

/**
 * Enhanced renderers config for demo showcase
 */
export const enhancedRendererConfig: RendererConfig = {
  LinkCard: LinkCardRenderer,
  Gallery: GalleryRenderer,
}
