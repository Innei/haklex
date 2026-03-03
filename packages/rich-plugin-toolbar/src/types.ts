import type { createTooltipHandle } from '@haklex/rich-editor-ui'

export interface ToolbarTooltipPayload {
  title: string
  shortcut?: string
}

export type ToolbarTooltipHandle = ReturnType<
  typeof createTooltipHandle<ToolbarTooltipPayload>
>
