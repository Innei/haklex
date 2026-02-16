import type { RendererConfig } from '@shiro/rich-editor'
import { TabsEditRenderer } from '@shiro/rich-ext-tabs'
import { AlertEditRenderer } from '@shiro/rich-renderer-alert'
import { BannerEditRenderer } from '@shiro/rich-renderer-banner'
import { MentionEditRenderer } from '@shiro/rich-renderer-mention'
import { MermaidEditRenderer } from '@shiro/rich-renderer-mermaid'

import { enhancedRendererConfig } from './config'

export const enhancedEditRendererConfig: RendererConfig = {
  ...enhancedRendererConfig,
  Alert: AlertEditRenderer,
  Banner: BannerEditRenderer,
  Mention: MentionEditRenderer,
  Mermaid: MermaidEditRenderer,
  Tabs: TabsEditRenderer,
}
